import status from "http-status";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import {
  BookingPaymentStatus,
  BookingStatus,
  CheckinStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from "../../../generated/prisma";
import {
  deleteFileFromCloudinary,
  uploadBufferToCloudinary,
} from "../../config/cloudinary.config";
import { envVars } from "../../config/env";
import { buildUniqueFileName } from "../../config/multer.config";
import { AppError } from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../utils/email";

type LookupPayload = {
  bookingCode: string;
  identity: string;
};

type VerifyOtpPayload = {
  bookingCode: string;
  identity: string;
  otp: string;
};

type CompleteCheckinPayload = {
  checkinToken: string;
  identityType?: string;
  identityNumber?: string;
  arrivalTime?: Date;
  notes?: string;
  paymentMethod?: "stripe" | "sslcommerz";
};

type UploadCheckinDocumentsPayload = {
  checkinToken: string;
  files: UploadableCheckinDocumentFile[];
  documentTypes?: string[];
};

type CheckinTokenPayload = {
  type: "checkin";
  reservationId: string;
  bookingCode: string;
  identity: string;
};

type GuestDetail = {
  name: string;
  email: string;
  phone: string;
};

type UploadableCheckinDocumentFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

const LOOKUP_WINDOW_MS = 60 * 1000;
const LOOKUP_MAX_ATTEMPTS = 8;
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const MAX_CHECKIN_DOCUMENTS = 2;

const lookupAttempts = new Map<string, { count: number; resetAt: number }>();

function normalizeIdentity(identity: string): string {
  return identity.trim().toLowerCase();
}

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function assertLookupRateLimit(key: string): void {
  const current = lookupAttempts.get(key);
  const currentTime = Date.now();

  if (!current || current.resetAt < currentTime) {
    lookupAttempts.set(key, {
      count: 1,
      resetAt: currentTime + LOOKUP_WINDOW_MS,
    });
    return;
  }

  if (current.count >= LOOKUP_MAX_ATTEMPTS) {
    throw new AppError(
      "Too many check-in attempts. Please try again shortly",
      status.TOO_MANY_REQUESTS,
    );
  }

  lookupAttempts.set(key, {
    count: current.count + 1,
    resetAt: current.resetAt,
  });
}

function toStripeAmount(amount: number): number {
  return Math.round(amount * 100);
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function getPrimaryGuest(guestDetails: unknown): {
  email?: string;
  phone?: string;
  name?: string;
} {
  if (!Array.isArray(guestDetails) || !guestDetails[0]) {
    return {};
  }

  const first = guestDetails[0];
  if (!first || typeof first !== "object" || Array.isArray(first)) {
    return {};
  }

  const record = first as Record<string, unknown>;

  return {
    email:
      typeof record.email === "string"
        ? record.email.trim().toLowerCase()
        : undefined,
    phone:
      typeof record.phone === "string"
        ? record.phone.trim().toLowerCase()
        : undefined,
    name: typeof record.name === "string" ? record.name.trim() : undefined,
  };
}

function getGuestContacts(
  guestDetails: unknown,
): Array<{ email?: string; phone?: string; name?: string }> {
  if (!Array.isArray(guestDetails)) {
    return [];
  }

  return guestDetails
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => {
      const record = item as Record<string, unknown>;

      return {
        email:
          typeof record.email === "string"
            ? record.email.trim().toLowerCase()
            : undefined,
        phone:
          typeof record.phone === "string"
            ? record.phone.trim().toLowerCase()
            : undefined,
        name: typeof record.name === "string" ? record.name.trim() : undefined,
      };
    });
}

function signCheckinToken(payload: CheckinTokenPayload): string {
  return jwt.sign(payload, envVars.JWT_SECRET, {
    expiresIn: "15m",
  });
}

function verifyCheckinToken(token: string): CheckinTokenPayload {
  const decoded = jwt.verify(token, envVars.JWT_SECRET);

  if (!decoded || typeof decoded === "string") {
    throw new AppError("Invalid check-in token", status.UNAUTHORIZED);
  }

  const value = decoded as Partial<CheckinTokenPayload>;

  if (
    value.type !== "checkin" ||
    typeof value.reservationId !== "string" ||
    typeof value.bookingCode !== "string" ||
    typeof value.identity !== "string"
  ) {
    throw new AppError("Invalid check-in token", status.UNAUTHORIZED);
  }

  return value as CheckinTokenPayload;
}

function getDefaultDocumentTypeByMime(mimeType: string): string {
  if (mimeType === "application/pdf") {
    return "PDF";
  }

  return "NID_IMAGE";
}

async function createStripeCheckoutSession(
  bookingId: string,
  amount: number,
): Promise<{ checkoutSessionId: string; checkoutUrl: string }> {
  if (!envVars.STRIPE_SECRET_KEY) {
    throw new AppError("Stripe is not configured", status.BAD_REQUEST);
  }

  const successBaseUrl =
    envVars.STRIPE_CHECKOUT_SUCCESS_URL ??
    `${envVars.FRONTEND_URL}/payment/success`;
  const cancelBaseUrl =
    envVars.STRIPE_CHECKOUT_CANCEL_URL ?? `${envVars.FRONTEND_URL}/payment`;

  const successUrl = `${successBaseUrl}?bookingId=${bookingId}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${cancelBaseUrl}?bookingId=${bookingId}`;

  const body = new URLSearchParams({
    mode: "payment",
    "payment_method_types[0]": "card",
    "line_items[0][price_data][currency]": envVars.STRIPE_CURRENCY,
    "line_items[0][price_data][product_data][name]":
      "Room booking - balance payment",
    "line_items[0][price_data][unit_amount]": String(toStripeAmount(amount)),
    "line_items[0][quantity]": "1",
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: bookingId,
    "metadata[bookingId]": bookingId,
    "payment_intent_data[metadata][bookingId]": bookingId,
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${envVars.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new AppError(
      `Failed to create Stripe checkout session: ${errorBody}`,
      status.BAD_GATEWAY,
    );
  }

  const result = (await response.json()) as { id?: string; url?: string };
  if (!result.id || !result.url) {
    throw new AppError("Invalid Stripe response", status.BAD_GATEWAY);
  }

  return {
    checkoutSessionId: result.id,
    checkoutUrl: result.url,
  };
}

async function createSslCommerzSession(payload: {
  bookingId: string;
  amount: number;
  customer: GuestDetail;
}): Promise<{ redirectUrl: string; transactionId: string }> {
  if (!envVars.SSLCOMMERZ_STORE_ID || !envVars.SSLCOMMERZ_STORE_PASSWORD) {
    throw new AppError("SSLCommerz is not configured", status.BAD_REQUEST);
  }

  const transactionId = `checkin-${payload.bookingId}-${Date.now()}`;

  const body = new URLSearchParams({
    store_id: envVars.SSLCOMMERZ_STORE_ID,
    store_passwd: envVars.SSLCOMMERZ_STORE_PASSWORD,
    total_amount: String(payload.amount),
    currency: "BDT",
    tran_id: transactionId,
    success_url: `${envVars.BETTER_AUTH_URL}/api/v1/bookings/pay`,
    fail_url: `${envVars.BETTER_AUTH_URL}/api/v1/bookings/pay`,
    cancel_url: `${envVars.BETTER_AUTH_URL}/api/v1/bookings/pay`,
    product_name: "Room booking - balance payment",
    product_category: "Hotel",
    product_profile: "general",
    cus_name: payload.customer.name,
    cus_email: payload.customer.email,
    cus_phone: payload.customer.phone,
    shipping_method: "NO",
    num_of_item: "1",
    value_a: payload.bookingId,
  });

  const response = await fetch(
    `${envVars.SSLCOMMERZ_API_URL}/gwprocess/v4/api.php`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new AppError(
      `Failed to create SSLCommerz session: ${errorBody}`,
      status.BAD_GATEWAY,
    );
  }

  const result = (await response.json()) as {
    status?: string;
    GatewayPageURL?: string;
  };

  if (result.status !== "SUCCESS" || !result.GatewayPageURL) {
    throw new AppError("Invalid SSLCommerz response", status.BAD_GATEWAY);
  }

  return {
    redirectUrl: result.GatewayPageURL,
    transactionId,
  };
}

export const CheckinService = {
  uploadCheckinDocuments: async (payload: UploadCheckinDocumentsPayload) => {
    const token = verifyCheckinToken(payload.checkinToken);

    if (payload.files.length === 0) {
      throw new AppError(
        "At least one document is required",
        status.BAD_REQUEST,
      );
    }

    if (payload.files.length > MAX_CHECKIN_DOCUMENTS) {
      throw new AppError(
        `You can upload up to ${MAX_CHECKIN_DOCUMENTS} documents`,
        status.BAD_REQUEST,
      );
    }

    const booking = await prisma.reservation.findUnique({
      where: { id: token.reservationId },
      select: {
        id: true,
        bookingCode: true,
        checkinOtps: {
          where: {
            target: token.identity,
            verifiedAt: {
              not: null,
            },
          },
          orderBy: {
            verifiedAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!booking || booking.bookingCode !== token.bookingCode) {
      throw new AppError("Booking not found", status.NOT_FOUND);
    }

    if (!booking.checkinOtps[0]?.verifiedAt) {
      throw new AppError("OTP verification required", status.UNAUTHORIZED);
    }

    const existingDocCount = await prisma.reservationDocument.count({
      where: { reservationId: booking.id },
    });

    if (existingDocCount >= MAX_CHECKIN_DOCUMENTS) {
      throw new AppError(
        `Maximum ${MAX_CHECKIN_DOCUMENTS} documents already uploaded`,
        status.BAD_REQUEST,
      );
    }

    const remainingSlots = MAX_CHECKIN_DOCUMENTS - existingDocCount;
    if (payload.files.length > remainingSlots) {
      throw new AppError(
        `Only ${remainingSlots} more document(s) can be uploaded`,
        status.BAD_REQUEST,
      );
    }

    const uploads = await Promise.all(
      payload.files.map(async (file, index) => {
        const documentType =
          payload.documentTypes?.[index]?.trim() ||
          getDefaultDocumentTypeByMime(file.mimetype);

        const uploaded = await uploadBufferToCloudinary(file.buffer, {
          folder: `sylcchi/checkin-documents/${booking.id}`,
          filename: buildUniqueFileName(file.originalname),
          resourceType: file.mimetype === "application/pdf" ? "raw" : "image",
          optimizeImage: file.mimetype.startsWith("image/"),
        });

        return {
          documentType,
          documentUrl: uploaded.secureUrl,
        };
      }),
    );

    try {
      const created = await prisma.$transaction(async (tx) => {
        return Promise.all(
          uploads.map((item) =>
            tx.reservationDocument.create({
              data: {
                reservationId: booking.id,
                documentType: item.documentType,
                documentUrl: item.documentUrl,
              },
            }),
          ),
        );
      });

      return created;
    } catch (error) {
      await Promise.allSettled(
        uploads.map((item) => deleteFileFromCloudinary(item.documentUrl)),
      );

      throw error;
    }
  },

  lookupBooking: async (payload: LookupPayload) => {
    const bookingCode = payload.bookingCode.trim().toUpperCase();
    const identity = normalizeIdentity(payload.identity);

    if (!bookingCode || !identity) {
      throw new AppError(
        "bookingCode and identity are required",
        status.BAD_REQUEST,
      );
    }

    assertLookupRateLimit(`${bookingCode}:${identity}`);

    const booking = await prisma.reservation.findUnique({
      where: { bookingCode },
      select: {
        id: true,
        bookingCode: true,
        bookingStatus: true,
        guestDetails: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new AppError("Booking not found", status.NOT_FOUND);
    }

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      throw new AppError("Booking is cancelled", status.BAD_REQUEST);
    }

    const primaryGuest = getPrimaryGuest(booking.guestDetails);
    const guests = getGuestContacts(booking.guestDetails);
    const matchedGuest = guests.find(
      (guest) => identity === guest.email || identity === guest.phone,
    );
    const ownerEmail = booking.user?.email?.trim().toLowerCase();
    const isOwnerEmailMatch = ownerEmail === identity;

    if (!matchedGuest && !isOwnerEmailMatch) {
      throw new AppError("Booking verification failed", status.FORBIDDEN);
    }

    const otpTargetEmail =
      matchedGuest?.email ?? ownerEmail ?? primaryGuest.email;

    if (!otpTargetEmail) {
      throw new AppError(
        "No email is available for OTP delivery",
        status.BAD_REQUEST,
      );
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    await prisma.$transaction(async (tx) => {
      await tx.checkinOtp.updateMany({
        where: {
          reservationId: booking.id,
          target: identity,
          verifiedAt: null,
        },
        data: {
          expiresAt: new Date(),
        },
      });

      await tx.checkinOtp.create({
        data: {
          reservationId: booking.id,
          channel: "email",
          target: identity,
          otpHash,
          expiresAt: addMinutes(new Date(), OTP_TTL_MINUTES),
        },
      });
    });

    await sendEmail({
      to: otpTargetEmail,
      subject: "Your Sylcchi Palace check-in verification code",
      html: `<p>Your OTP for online check-in is <b>${otp}</b>.</p><p>This code will expire in ${OTP_TTL_MINUTES} minutes.</p>`,
    });

    return {
      bookingCode,
      otpSent: true,
      message: "OTP sent to your booking contact channel",
    };
  },

  verifyOtp: async (payload: VerifyOtpPayload) => {
    const bookingCode = payload.bookingCode.trim().toUpperCase();
    const identity = normalizeIdentity(payload.identity);
    const otp = payload.otp.trim();

    if (!bookingCode || !identity || !otp) {
      throw new AppError(
        "bookingCode, identity and otp are required",
        status.BAD_REQUEST,
      );
    }

    const booking = await prisma.reservation.findUnique({
      where: { bookingCode },
      include: {
        room: true,
      },
    });

    if (!booking) {
      throw new AppError("Booking not found", status.NOT_FOUND);
    }

    const otpRecord = await prisma.checkinOtp.findFirst({
      where: {
        reservationId: booking.id,
        target: identity,
        verifiedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      throw new AppError("OTP expired or invalid", status.BAD_REQUEST);
    }

    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      throw new AppError(
        "Too many invalid OTP attempts",
        status.TOO_MANY_REQUESTS,
      );
    }

    const isValid = hashOtp(otp) === otpRecord.otpHash;

    if (!isValid) {
      await prisma.checkinOtp.update({
        where: { id: otpRecord.id },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });

      throw new AppError("Invalid OTP", status.BAD_REQUEST);
    }

    await prisma.checkinOtp.update({
      where: { id: otpRecord.id },
      data: {
        verifiedAt: new Date(),
      },
    });

    const checkinToken = signCheckinToken({
      type: "checkin",
      reservationId: booking.id,
      bookingCode,
      identity,
    });

    return {
      checkinToken,
      booking: {
        bookingCode: booking.bookingCode,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        room: {
          id: booking.room.id,
          name: booking.room.name,
        },
        subtotal: booking.subtotal,
        vat: booking.vat,
        total: booking.totalPrice,
        paid: booking.paidAmount,
        due: booking.remainingAmount,
        paymentStatus: booking.paymentStatus,
        requiresPayment: booking.paymentStatus !== BookingPaymentStatus.PAID,
      },
    };
  },

  completeCheckin: async (payload: CompleteCheckinPayload) => {
    const token = verifyCheckinToken(payload.checkinToken);

    const booking = await prisma.reservation.findUnique({
      where: { id: token.reservationId },
      include: {
        payment: true,
        room: true,
        checkin: true,
        checkinOtps: {
          where: {
            target: token.identity,
            verifiedAt: {
              not: null,
            },
          },
          orderBy: {
            verifiedAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!booking || booking.bookingCode !== token.bookingCode) {
      throw new AppError("Booking not found", status.NOT_FOUND);
    }

    const verifiedOtp = booking.checkinOtps[0];
    if (!verifiedOtp || !verifiedOtp.verifiedAt) {
      throw new AppError("OTP verification required", status.UNAUTHORIZED);
    }

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      throw new AppError("Booking is cancelled", status.BAD_REQUEST);
    }

    const windowStart = addHours(booking.checkInDate, -48);
    if (new Date() < windowStart) {
      throw new AppError(
        "Online check-in will open 48 hours before check-in",
        status.BAD_REQUEST,
      );
    }

    if (booking.paymentStatus !== BookingPaymentStatus.PAID) {
      const remainingAmount = Number(booking.remainingAmount);

      if (remainingAmount <= 0) {
        await prisma.reservation.update({
          where: { id: booking.id },
          data: {
            paymentStatus: BookingPaymentStatus.PAID,
            expiresAt: null,
          },
        });
      } else {
        const method = payload.paymentMethod;

        if (!method) {
          return {
            requiresPayment: true,
            remainingAmount,
          };
        }

        const selectedMethod =
          method === "stripe" ? PaymentMethod.STRIPE : PaymentMethod.SSLCOMMERZ;

        if (selectedMethod === PaymentMethod.STRIPE) {
          const checkout = await createStripeCheckoutSession(
            booking.id,
            remainingAmount,
          );

          await prisma.$transaction(async (tx) => {
            await tx.reservation.update({
              where: { id: booking.id },
              data: {
                paymentMethod: selectedMethod,
                expiresAt: addHours(new Date(), 5),
              },
            });

            if (booking.payment) {
              await tx.payment.update({
                where: { id: booking.payment.id },
                data: {
                  amount: remainingAmount,
                  paymentMethod: selectedMethod,
                  paymentType: PaymentType.FULL,
                  status: PaymentStatus.PENDING,
                  transactionId: checkout.checkoutSessionId,
                },
              });
            }
          });

          return {
            requiresPayment: true,
            remainingAmount,
            payment: {
              gateway: "stripe",
              checkoutUrl: checkout.checkoutUrl,
              checkoutSessionId: checkout.checkoutSessionId,
            },
          };
        }

        const guestInfo = getPrimaryGuest(booking.guestDetails);
        const sslSession = await createSslCommerzSession({
          bookingId: booking.id,
          amount: remainingAmount,
          customer: {
            name: guestInfo.name ?? "Guest",
            email: guestInfo.email ?? "guest@example.com",
            phone: guestInfo.phone ?? "0000000000",
          },
        });

        await prisma.$transaction(async (tx) => {
          await tx.reservation.update({
            where: { id: booking.id },
            data: {
              paymentMethod: selectedMethod,
              expiresAt: addHours(new Date(), 5),
            },
          });

          if (booking.payment) {
            await tx.payment.update({
              where: { id: booking.payment.id },
              data: {
                amount: remainingAmount,
                paymentMethod: selectedMethod,
                paymentType: PaymentType.FULL,
                status: PaymentStatus.PENDING,
                transactionId: sslSession.transactionId,
              },
            });
          }
        });

        return {
          requiresPayment: true,
          remainingAmount,
          payment: {
            gateway: "sslcommerz",
            redirectUrl: sslSession.redirectUrl,
            transactionId: sslSession.transactionId,
          },
        };
      }
    }

    const checkinTime = payload.arrivalTime ?? new Date();
    const notePayload: Record<string, string | undefined> = {
      identityType: payload.identityType,
      identityNumber: payload.identityNumber,
      notes: payload.notes,
    };

    const notesJson = JSON.stringify(notePayload);

    const checkin = booking.checkin
      ? await prisma.checkin.update({
          where: { reservationId: booking.id },
          data: {
            checkinTime,
            status: CheckinStatus.CHECKED_IN,
            notes: notesJson,
          },
        })
      : await prisma.checkin.create({
          data: {
            reservationId: booking.id,
            roomId: booking.roomId,
            checkinTime,
            status: CheckinStatus.CHECKED_IN,
            notes: notesJson,
          },
        });

    return {
      requiresPayment: false,
      checkin,
    };
  },
};
