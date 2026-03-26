import status from "http-status";
import {
  BookingPaymentStatus,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  Prisma,
  RefundStatus,
} from "../../../generated/prisma";
import { envVars } from "../../config/env";
import { AppError } from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

type GuestDetail = {
  name: string;
  email: string;
  phone: string;
};

type CreateBookingPayload = {
  roomId: string;
  userId?: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  guestDetails: GuestDetail[];
  paymentMethod: "stripe" | "sslcommerz" | "pay_later";
};

type PayBookingPayload = {
  bookingId: string;
  paymentMethod?: "stripe" | "sslcommerz";
  action?: "initiate" | "confirm" | "callback";
  gatewayStatus?: "success" | "failed" | "cancel";
  transactionId?: string;
};

type BookingAccessContext = {
  userId?: string;
  role?: string;
  guestEmail?: string;
};

function toPaymentMethod(
  value: CreateBookingPayload["paymentMethod"],
): PaymentMethod {
  if (value === "stripe") {
    return PaymentMethod.STRIPE;
  }

  if (value === "sslcommerz") {
    return PaymentMethod.SSLCOMMERZ;
  }

  return PaymentMethod.PAY_LATER;
}

function toPayMethod(value: PayBookingPayload["paymentMethod"]): PaymentMethod {
  if (value === "stripe") {
    return PaymentMethod.STRIPE;
  }

  return PaymentMethod.SSLCOMMERZ;
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function normalizeDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function nightsBetween(checkInDate: Date, checkOutDate: Date): number {
  const start = normalizeDateOnly(checkInDate);
  const end = normalizeDateOnly(checkOutDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function daysBetween(start: Date, end: Date): number {
  const startOnly = normalizeDateOnly(start);
  const endOnly = normalizeDateOnly(end);
  const diffMs = endOnly.getTime() - startOnly.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

function getDepositRate(daysBeforeCheckIn: number): number {
  if (daysBeforeCheckIn > 15) {
    return 0.25;
  }

  if (daysBeforeCheckIn >= 7) {
    return 0.5;
  }

  return 1;
}

function getCancellationRefundRate(daysBeforeCheckIn: number): number {
  if (daysBeforeCheckIn >= 7) {
    return 1;
  }

  return 0;
}

function buildBookingCode(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SP-${y}${m}${d}-${random}`;
}

async function createUniqueBookingCode(
  tx: Prisma.TransactionClient,
): Promise<string> {
  for (let i = 0; i < 10; i += 1) {
    const bookingCode = buildBookingCode();
    const exists = await tx.reservation.findUnique({
      where: { bookingCode },
      select: { id: true },
    });

    if (!exists) {
      return bookingCode;
    }
  }

  throw new AppError(
    "Failed to generate unique booking code",
    status.INTERNAL_SERVER_ERROR,
  );
}

function toStripeAmount(totalPrice: number): number {
  return Math.round(totalPrice * 100);
}

function getPrimaryGuestEmail(
  guestDetails: Prisma.JsonValue,
): string | undefined {
  if (!Array.isArray(guestDetails) || guestDetails.length === 0) {
    return undefined;
  }

  const first = guestDetails[0];
  if (!first || typeof first !== "object" || Array.isArray(first)) {
    return undefined;
  }

  const email = (first as Record<string, unknown>).email;
  if (typeof email !== "string") {
    return undefined;
  }

  return email.toLowerCase();
}

async function cancelExpiredBookingsTx(
  tx: Prisma.TransactionClient,
): Promise<number> {
  const now = new Date();

  try {
    const result = await tx.reservation.updateMany({
      where: {
        bookingStatus: BookingStatus.PENDING,
        paymentStatus: {
          in: [BookingPaymentStatus.PENDING, BookingPaymentStatus.PARTIAL],
        },
        expiresAt: {
          lt: now,
        },
      },
      data: {
        bookingStatus: BookingStatus.CANCELLED,
      },
    });

    return result.count;
  } catch (error) {
    const code = (error as { code?: string })?.code;

    if (code !== "P2007") {
      throw error;
    }

    console.error(
      "[ReservationService] BookingPaymentStatus enum mismatch detected. Falling back to text-safe expiry cleanup.",
      error,
    );

    const updatedCount = await tx.$executeRaw<number>(Prisma.sql`
      UPDATE "reservations"
      SET "booking_status" = 'CANCELLED'
      WHERE "booking_status" = 'PENDING'
        AND "payment_status"::text <> 'PAID'
        AND "expires_at" < ${now}
    `);

    return updatedCount;
  }
}

function ensureBookingAccess(
  booking: {
    userId: string | null;
    guestDetails: Prisma.JsonValue;
  },
  access: BookingAccessContext,
): void {
  const isAdminOrManager = access.role === "ADMIN" || access.role === "MANAGER";

  if (isAdminOrManager) {
    return;
  }

  if (booking.userId) {
    if (!access.userId || access.userId !== booking.userId) {
      throw new AppError(
        "You are not allowed to access this booking",
        status.FORBIDDEN,
      );
    }

    return;
  }

  const bookingGuestEmail = getPrimaryGuestEmail(booking.guestDetails);
  if (!bookingGuestEmail) {
    throw new AppError(
      "Unable to verify guest booking owner",
      status.FORBIDDEN,
    );
  }

  if (
    !access.guestEmail ||
    access.guestEmail.toLowerCase() !== bookingGuestEmail
  ) {
    throw new AppError(
      "Guest email is required to access this booking",
      status.FORBIDDEN,
    );
  }
}

async function createStripeCheckoutSession(
  amount: number,
  bookingId: string,
): Promise<{
  checkoutSessionId: string;
  checkoutUrl: string;
}> {
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
    "line_items[0][price_data][product_data][name]": "Room booking",
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

  const result = (await response.json()) as {
    id?: string;
    url?: string;
  };

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
}): Promise<{
  redirectUrl: string;
  transactionId: string;
}> {
  if (!envVars.SSLCOMMERZ_STORE_ID || !envVars.SSLCOMMERZ_STORE_PASSWORD) {
    throw new AppError("SSLCommerz is not configured", status.BAD_REQUEST);
  }

  const transactionId = `booking-${payload.bookingId}-${Date.now()}`;

  const body = new URLSearchParams({
    store_id: envVars.SSLCOMMERZ_STORE_ID,
    store_passwd: envVars.SSLCOMMERZ_STORE_PASSWORD,
    total_amount: String(payload.amount),
    currency: "BDT",
    tran_id: transactionId,
    success_url: `${envVars.BETTER_AUTH_URL}/api/v1/bookings/pay`,
    fail_url: `${envVars.BETTER_AUTH_URL}/api/v1/bookings/pay`,
    cancel_url: `${envVars.BETTER_AUTH_URL}/api/v1/bookings/pay`,
    product_name: "Room booking",
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

export const ReservationService = {
  createBooking: async (payload: CreateBookingPayload) => {
    return prisma.$transaction(
      async (tx) => {
        await cancelExpiredBookingsTx(tx);

        const room = await tx.room.findUnique({
          where: { id: payload.roomId },
          select: {
            id: true,
            price: true,
            capacity: true,
            isAvailable: true,
          },
        });

        if (!room || !room.isAvailable) {
          throw new AppError(
            "Room is not available for booking",
            status.BAD_REQUEST,
          );
        }

        const today = startOfToday();
        if (
          payload.checkInDate < today ||
          payload.checkOutDate <= payload.checkInDate
        ) {
          throw new AppError(
            "Invalid check-in/check-out date range",
            status.BAD_REQUEST,
          );
        }

        const nights = nightsBetween(payload.checkInDate, payload.checkOutDate);
        if (nights < 1) {
          throw new AppError("Minimum stay is 1 night", status.BAD_REQUEST);
        }

        if (nights > envVars.BOOKING_MAX_STAY_NIGHTS) {
          throw new AppError(
            `Maximum stay is ${envVars.BOOKING_MAX_STAY_NIGHTS} nights`,
            status.BAD_REQUEST,
          );
        }

        if (payload.guests < 1 || payload.guests > room.capacity) {
          throw new AppError(
            `Guests must be between 1 and room capacity (${room.capacity})`,
            status.BAD_REQUEST,
          );
        }

        if (payload.guestDetails.length !== payload.guests) {
          throw new AppError(
            "guestDetails length must match guests count",
            status.BAD_REQUEST,
          );
        }

        const hasInvalidGuest = payload.guestDetails.some(
          (guest) =>
            !guest.name ||
            !guest.email ||
            !guest.phone ||
            guest.name.trim() === "" ||
            guest.email.trim() === "" ||
            guest.phone.trim() === "",
        );

        if (hasInvalidGuest) {
          throw new AppError(
            "Each guest detail must include name, email and phone",
            status.BAD_REQUEST,
          );
        }

        const overlap = await tx.reservation.findFirst({
          where: {
            roomId: payload.roomId,
            bookingStatus: {
              in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
            },
            checkInDate: {
              lt: payload.checkOutDate,
            },
            checkOutDate: {
              gt: payload.checkInDate,
            },
          },
          select: { id: true },
        });

        if (overlap) {
          throw new AppError(
            "Room is already booked for the selected dates",
            status.CONFLICT,
          );
        }

        const basePrice = Number(room.price);
        const subtotal = round2(basePrice * nights);
        const vat = round2(subtotal * 0.05);
        const totalPrice = round2(subtotal + vat);

        const daysBeforeCheckIn = daysBetween(today, payload.checkInDate);
        const depositRate = getDepositRate(daysBeforeCheckIn);
        const depositAmount = round2(totalPrice * depositRate);

        const bookingCode = await createUniqueBookingCode(tx);

        const now = new Date();
        const paymentMethod = toPaymentMethod(payload.paymentMethod);
        const expiresAt = addHours(now, 5);

        const booking = await tx.reservation.create({
          data: {
            bookingCode,
            roomId: payload.roomId,
            userId: payload.userId,
            checkInDate: payload.checkInDate,
            checkOutDate: payload.checkOutDate,
            guests: payload.guests,
            guestDetails: payload.guestDetails,
            basePrice,
            nights,
            subtotal,
            vat,
            totalPrice,
            depositRate,
            depositAmount,
            paidAmount: 0,
            remainingAmount: totalPrice,
            paymentMethod,
            paymentStatus: BookingPaymentStatus.PENDING,
            bookingStatus: BookingStatus.PENDING,
            expiresAt,
            payment: {
              create: {
                amount: depositAmount,
                currency:
                  paymentMethod === PaymentMethod.SSLCOMMERZ ? "BDT" : "USD",
                paymentMethod,
                paymentType:
                  depositRate >= 1 ? PaymentType.FULL : PaymentType.DEPOSIT,
                status: PaymentStatus.PENDING,
              },
            },
          },
          include: {
            room: true,
            payment: true,
          },
        });

        return booking;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  },

  payBooking: async (
    payload: PayBookingPayload,
    access: BookingAccessContext,
  ) => {
    return prisma.$transaction(
      async (tx) => {
        await cancelExpiredBookingsTx(tx);

        const booking = await tx.reservation.findFirst({
          where: {
            OR: [{ id: payload.bookingId }, { bookingCode: payload.bookingId }],
          },
          include: {
            payment: true,
          },
        });

        if (!booking) {
          throw new AppError("Booking not found", status.NOT_FOUND);
        }

        ensureBookingAccess(booking, access);

        if (booking.bookingStatus === BookingStatus.CANCELLED) {
          throw new AppError(
            "Booking is already cancelled",
            status.BAD_REQUEST,
          );
        }

        if (booking.paymentStatus === BookingPaymentStatus.PAID) {
          return {
            booking,
            payment: {
              status: "already_paid",
            },
          };
        }

        if (booking.expiresAt && booking.expiresAt < new Date()) {
          await tx.reservation.update({
            where: { id: booking.id },
            data: {
              bookingStatus: BookingStatus.CANCELLED,
            },
          });

          throw new AppError("Booking has expired", status.BAD_REQUEST);
        }

        const selectedMethod = payload.paymentMethod
          ? toPayMethod(payload.paymentMethod)
          : booking.paymentMethod;

        if (
          selectedMethod !== PaymentMethod.STRIPE &&
          selectedMethod !== PaymentMethod.SSLCOMMERZ
        ) {
          throw new AppError(
            "Pay later bookings cannot be paid through this endpoint",
            status.BAD_REQUEST,
          );
        }

        await tx.reservation.update({
          where: { id: booking.id },
          data: {
            paymentMethod: selectedMethod,
            expiresAt: addHours(new Date(), 5),
          },
        });

        const paidAmount = Number(booking.paidAmount);
        const totalPrice = Number(booking.totalPrice);
        const remainingAmount = round2(Math.max(totalPrice - paidAmount, 0));
        const isFirstCharge = paidAmount <= 0;
        const amountToCharge = isFirstCharge
          ? Number(booking.depositAmount)
          : remainingAmount;

        if (amountToCharge <= 0) {
          return {
            booking,
            payment: {
              status: "already_paid",
            },
          };
        }

        const paymentType =
          isFirstCharge && Number(booking.depositRate) < 1
            ? PaymentType.DEPOSIT
            : PaymentType.FULL;

        if (selectedMethod === PaymentMethod.STRIPE) {
          const action = payload.action ?? "initiate";

          if (action === "initiate") {
            const checkout = await createStripeCheckoutSession(
              amountToCharge,
              booking.id,
            );

            const paymentRecord = booking.payment
              ? await tx.payment.update({
                  where: { reservationId: booking.id },
                  data: {
                    amount: amountToCharge,
                    currency: envVars.STRIPE_CURRENCY.toUpperCase(),
                    paymentMethod: PaymentMethod.STRIPE,
                    paymentType,
                    status: PaymentStatus.PENDING,
                    transactionId: checkout.checkoutSessionId,
                  },
                })
              : await tx.payment.create({
                  data: {
                    reservationId: booking.id,
                    amount: amountToCharge,
                    currency: envVars.STRIPE_CURRENCY.toUpperCase(),
                    paymentMethod: PaymentMethod.STRIPE,
                    paymentType,
                    status: PaymentStatus.PENDING,
                    transactionId: checkout.checkoutSessionId,
                  },
                });

            return {
              booking: await tx.reservation.findUnique({
                where: { id: booking.id },
                include: { payment: true, room: true },
              }),
              payment: {
                status: "requires_payment",
                gateway: "stripe",
                checkoutUrl: checkout.checkoutUrl,
                checkoutSessionId: checkout.checkoutSessionId,
                paymentRecord,
              },
            };
          }

          throw new AppError(
            "Stripe checkout confirmation is handled by webhook; use action=initiate to get checkoutUrl",
            status.BAD_REQUEST,
          );
        }

        const action = payload.action ?? "initiate";

        if (action === "initiate") {
          const guestDetails = booking.guestDetails as GuestDetail[];
          const firstGuest = guestDetails[0];

          if (!firstGuest) {
            throw new AppError(
              "Primary guest details are required",
              status.BAD_REQUEST,
            );
          }

          const sslSession = await createSslCommerzSession({
            bookingId: booking.id,
            amount: amountToCharge,
            customer: firstGuest,
          });

          const existingPayment = await tx.payment.findFirst({
            where: { reservationId: booking.id },
          });

          if (existingPayment) {
            await tx.payment.update({
              where: { id: existingPayment.id },
              data: {
                amount: amountToCharge,
                status: PaymentStatus.PENDING,
                paymentMethod: PaymentMethod.SSLCOMMERZ,
                paymentType,
                transactionId: sslSession.transactionId,
              },
            });
          }

          return {
            booking: await tx.reservation.findUnique({
              where: { id: booking.id },
              include: { payment: true, room: true },
            }),
            payment: {
              status: "requires_payment",
              gateway: "sslcommerz",
              redirectUrl: sslSession.redirectUrl,
              transactionId: sslSession.transactionId,
            },
          };
        }

        if (!payload.gatewayStatus) {
          throw new AppError(
            "gatewayStatus is required for SSLCommerz callback",
            status.BAD_REQUEST,
          );
        }

        if (payload.gatewayStatus === "success") {
          const currentPayment = await tx.payment.findFirst({
            where: { reservationId: booking.id },
          });

          const chargedAmount = currentPayment
            ? Number(currentPayment.amount)
            : 0;
          const total = Number(booking.totalPrice);
          const newPaidAmount = round2(
            Math.min(Number(booking.paidAmount) + chargedAmount, total),
          );
          const newRemainingAmount = round2(Math.max(total - newPaidAmount, 0));

          const updatedBooking = await tx.reservation.update({
            where: { id: booking.id },
            data: {
              paidAmount: newPaidAmount,
              remainingAmount: newRemainingAmount,
              paymentStatus:
                newRemainingAmount <= 0
                  ? BookingPaymentStatus.PAID
                  : BookingPaymentStatus.PARTIAL,
              bookingStatus: BookingStatus.CONFIRMED,
              expiresAt:
                newRemainingAmount <= 0 ? null : addHours(new Date(), 5),
            },
            include: {
              room: true,
              payment: true,
            },
          });

          const existingPaymentForSuccess = await tx.payment.findFirst({
            where: { reservationId: booking.id },
          });

          if (existingPaymentForSuccess) {
            await tx.payment.update({
              where: { id: existingPaymentForSuccess.id },
              data: {
                status: PaymentStatus.SUCCESS,
                paymentMethod: PaymentMethod.SSLCOMMERZ,
                transactionId: payload.transactionId ?? undefined,
              },
            });
          }

          return {
            booking: updatedBooking,
            payment: {
              status: "paid",
              gateway: "sslcommerz",
              transactionId: payload.transactionId,
            },
          };
        }

        const existingPaymentForFail = await tx.payment.findFirst({
          where: { reservationId: booking.id },
        });

        if (existingPaymentForFail) {
          await tx.payment.update({
            where: { id: existingPaymentForFail.id },
            data: {
              status: PaymentStatus.FAILED,
              paymentMethod: PaymentMethod.SSLCOMMERZ,
              transactionId: payload.transactionId ?? undefined,
            },
          });
        }

        if (payload.gatewayStatus === "cancel") {
          await tx.reservation.update({
            where: { id: booking.id },
            data: {
              bookingStatus: BookingStatus.CANCELLED,
            },
          });
        }

        throw new AppError(
          "SSLCommerz payment failed or cancelled",
          status.BAD_REQUEST,
        );
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  },

  getBookingById: async (bookingId: string, access: BookingAccessContext) => {
    await ReservationService.cancelExpiredBookings();

    const booking = await prisma.reservation.findFirst({
      where: {
        OR: [{ id: bookingId }, { bookingCode: bookingId }],
      },
      include: {
        room: true,
        payment: true,
      },
    });

    if (!booking) {
      throw new AppError("Booking not found", status.NOT_FOUND);
    }

    ensureBookingAccess(booking, access);
    return booking;
  },

  cancelBooking: async (
    bookingId: string,
    access: BookingAccessContext,
    reason?: string,
  ) => {
    await ReservationService.cancelExpiredBookings();

    const booking = await prisma.reservation.findFirst({
      where: {
        OR: [{ id: bookingId }, { bookingCode: bookingId }],
      },
      select: {
        id: true,
        userId: true,
        guestDetails: true,
        bookingStatus: true,
        paymentStatus: true,
      },
    });

    if (!booking) {
      throw new AppError("Booking not found", status.NOT_FOUND);
    }

    ensureBookingAccess(booking, access);

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
      throw new AppError("Booking is already cancelled", status.BAD_REQUEST);
    }

    return prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id: booking.id },
        data: {
          bookingStatus: BookingStatus.CANCELLED,
        },
      });

      if (
        booking.paymentStatus === BookingPaymentStatus.PAID ||
        booking.paymentStatus === BookingPaymentStatus.PARTIAL
      ) {
        const fullBooking = await tx.reservation.findUnique({
          where: { id: booking.id },
          select: {
            checkInDate: true,
            totalPrice: true,
            paidAmount: true,
          },
        });

        if (!fullBooking) {
          throw new AppError("Booking not found", status.NOT_FOUND);
        }

        const today = startOfToday();
        const daysBefore = daysBetween(today, fullBooking.checkInDate);
        const refundRate = getCancellationRefundRate(daysBefore);
        const refundAmount = round2(
          Number(fullBooking.paidAmount) * refundRate,
        );

        await tx.payment.updateMany({
          where: {
            reservationId: booking.id,
            refundStatus: {
              in: [RefundStatus.NONE, RefundStatus.PENDING],
            },
          },
          data: {
            refundStatus:
              refundAmount > 0 ? RefundStatus.PENDING : RefundStatus.COMPLETED,
            refundAmount,
          },
        });
      }

      return tx.reservation.findUnique({
        where: { id: booking.id },
        include: {
          room: true,
          payment: true,
        },
      });
    });
  },

  markRefundCompleted: async (bookingId: string, refundAmount?: number) => {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.reservation.findUnique({
        where: { id: bookingId },
        include: {
          payment: true,
        },
      });

      if (!booking) {
        throw new AppError("Booking not found", status.NOT_FOUND);
      }

      if (!booking.payment) {
        throw new AppError("Payment record not found", status.NOT_FOUND);
      }

      if (booking.bookingStatus !== BookingStatus.CANCELLED) {
        throw new AppError(
          "Booking must be cancelled before completing refund",
          status.BAD_REQUEST,
        );
      }

      if (
        booking.paymentStatus !== BookingPaymentStatus.PAID ||
        booking.payment.status !== PaymentStatus.SUCCESS
      ) {
        throw new AppError(
          "Only paid successful bookings can be refunded",
          status.BAD_REQUEST,
        );
      }

      if (booking.payment.refundStatus === RefundStatus.COMPLETED) {
        return tx.reservation.findUnique({
          where: { id: bookingId },
          include: {
            room: true,
            payment: true,
          },
        });
      }

      if (booking.payment.refundStatus !== RefundStatus.PENDING) {
        throw new AppError(
          "Refund is not pending manual handling",
          status.BAD_REQUEST,
        );
      }

      await tx.payment.update({
        where: { id: booking.payment.id },
        data: {
          refundStatus: RefundStatus.COMPLETED,
          refundAmount: refundAmount ?? booking.payment.amount,
        },
      });

      return tx.reservation.findUnique({
        where: { id: bookingId },
        include: {
          room: true,
          payment: true,
        },
      });
    });
  },

  cancelExpiredBookings: async () => {
    return prisma.$transaction(async (tx) => {
      return cancelExpiredBookingsTx(tx);
    });
  },
};
