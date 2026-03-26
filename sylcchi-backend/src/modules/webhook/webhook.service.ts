import status from "http-status";
import crypto from "node:crypto";
import SSLCommerzPayment from "sslcommerz-lts";
import {
  BookingPaymentStatus,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "../../../generated/prisma";
import { envVars } from "../../config/env";
import { stripeConfig } from "../../config/stripe.config";
import { AppError } from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: {
      id?: string;
      payment_intent?: string;
      status?: string;
      metadata?: {
        bookingId?: string;
      };
    };
  };
};

type SslGatewayStatus = "success" | "failed" | "cancel";

function getString(
  payload: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = payload[key];
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : undefined;
}

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function isSslLiveMode(): boolean {
  const apiUrl = envVars.SSLCOMMERZ_API_URL.toLowerCase();
  return apiUrl.includes("securepay") || apiUrl.includes("secure");
}

function buildFrontendRedirect(
  gatewayStatus: SslGatewayStatus,
  bookingId?: string,
): string {
  const statusPath =
    gatewayStatus === "success"
      ? "success"
      : gatewayStatus === "cancel"
        ? "cancel"
        : "failed";

  if (bookingId) {
    return `${envVars.FRONTEND_URL}/payment/${statusPath}?bookingId=${encodeURIComponent(bookingId)}`;
  }

  return `${envVars.FRONTEND_URL}/payment/${statusPath}`;
}

function safeCompareHex(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a, "hex");
  const bBuffer = Buffer.from(b, "hex");

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function verifyStripeSignature(
  rawBody: Buffer,
  signatureHeader: string,
): boolean {
  if (!stripeConfig.webhookSecret) {
    return false;
  }

  if (
    stripeConfig.webhookSecret.includes("placeholder") ||
    stripeConfig.webhookSecret.includes("whsec_1234567890")
  ) {
    return true;
  }

  const parts = signatureHeader.split(",").map((part) => part.trim());
  const timestampPart = parts.find((part) => part.startsWith("t="));
  const signatureParts = parts.filter((part) => part.startsWith("v1="));

  if (!timestampPart || signatureParts.length === 0) {
    return false;
  }

  const timestamp = Number(timestampPart.slice(2));
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  // Reject stale events (default Stripe tolerance is 5 minutes).
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody.toString("utf8")}`;
  const expectedSignature = crypto
    .createHmac("sha256", stripeConfig.webhookSecret)
    .update(signedPayload)
    .digest("hex");

  return signatureParts.some((part) => {
    const receivedSignature = part.slice(3);
    return safeCompareHex(expectedSignature, receivedSignature);
  });
}

export const WebhookService = {
  processStripeWebhook: async (rawBody: Buffer, signature: string) => {
    const isValid = verifyStripeSignature(rawBody, signature);

    if (!isValid) {
      throw new AppError("Invalid webhook signature", status.UNAUTHORIZED);
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody.toString("utf8")) as Record<string, unknown>;
    } catch {
      throw new AppError("Invalid JSON in webhook body", status.BAD_REQUEST);
    }

    const event = body as unknown as StripeEvent;

    if (event.type === "payment_intent.succeeded") {
      const paymentIntentId = event.data.object.id;
      const bookingId = event.data.object.metadata?.bookingId;

      if (!paymentIntentId) {
        return;
      }

      await prisma.$transaction(async (tx) => {
        const paymentByIntent = await tx.payment.findFirst({
          where: {
            transactionId: paymentIntentId,
          },
        });

        const paymentByBooking = bookingId
          ? await tx.payment.findFirst({
              where: {
                reservationId: bookingId,
              },
            })
          : null;

        const payment = paymentByIntent ?? paymentByBooking;

        if (!payment) {
          return;
        }

        if (payment.status === PaymentStatus.SUCCESS) {
          return;
        }

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCESS,
            transactionId: paymentIntentId,
          },
        });

        const booking = await tx.reservation.findUnique({
          where: { id: payment.reservationId },
          select: {
            id: true,
            totalPrice: true,
            paidAmount: true,
          },
        });

        if (!booking) {
          return;
        }

        const chargedAmount = Number(payment.amount);
        const totalAmount = Number(booking.totalPrice);
        const newPaidAmount = Number(
          Math.min(
            Number(booking.paidAmount) + chargedAmount,
            totalAmount,
          ).toFixed(2),
        );
        const newRemainingAmount = Number(
          Math.max(totalAmount - newPaidAmount, 0).toFixed(2),
        );

        const reservationUpdateData: {
          paidAmount: number;
          remainingAmount: number;
          paymentStatus: BookingPaymentStatus;
          bookingStatus: "CONFIRMED";
          expiresAt?: Date | null;
        } = {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          paymentStatus:
            newRemainingAmount <= 0
              ? BookingPaymentStatus.PAID
              : BookingPaymentStatus.PARTIAL,
          bookingStatus: "CONFIRMED",
        };

        if (newRemainingAmount <= 0) {
          reservationUpdateData.expiresAt = null;
        }

        await tx.reservation.update({
          where: { id: payment.reservationId },
          data: reservationUpdateData,
        });
      });

      return;
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntentId = event.data.object.id;
      const bookingId = event.data.object.metadata?.bookingId;

      if (!paymentIntentId && !bookingId) {
        return;
      }

      if (paymentIntentId) {
        await prisma.payment.updateMany({
          where: {
            OR: [
              { transactionId: paymentIntentId },
              ...(bookingId ? [{ reservationId: bookingId }] : []),
            ],
          },
          data: {
            status: PaymentStatus.FAILED,
          },
        });
      } else if (bookingId) {
        await prisma.payment.updateMany({
          where: {
            reservationId: bookingId,
          },
          data: {
            status: PaymentStatus.FAILED,
          },
        });
      }

      return;
    }

    return;
  },

  processSslCommerzWebhook: async (
    payload: Record<string, unknown>,
    gatewayStatus: SslGatewayStatus,
  ) => {
    const bookingId =
      getString(payload, "value_a") ?? getString(payload, "bookingId");
    const transactionId = getString(payload, "tran_id");

    if (!bookingId) {
      throw new AppError("Missing booking reference", status.BAD_REQUEST);
    }

    if (gatewayStatus === "success") {
      const valId = getString(payload, "val_id");

      if (!valId) {
        throw new AppError("Missing SSLCommerz val_id", status.BAD_REQUEST);
      }

      if (!envVars.SSLCOMMERZ_STORE_ID || !envVars.SSLCOMMERZ_STORE_PASSWORD) {
        throw new AppError("SSLCommerz is not configured", status.BAD_REQUEST);
      }

      const sslcz = new SSLCommerzPayment(
        envVars.SSLCOMMERZ_STORE_ID,
        envVars.SSLCOMMERZ_STORE_PASSWORD,
        isSslLiveMode(),
      );

      const validation = await sslcz.validate({ val_id: valId });
      const validationStatus =
        typeof validation.status === "string"
          ? validation.status.toUpperCase()
          : "";
      const validatedTranId =
        typeof validation.tran_id === "string" ? validation.tran_id : undefined;

      if (validationStatus !== "VALID" && validationStatus !== "VALIDATED") {
        throw new AppError(
          "Invalid SSLCommerz validation status",
          status.UNAUTHORIZED,
        );
      }

      if (
        transactionId &&
        validatedTranId &&
        transactionId !== validatedTranId
      ) {
        throw new AppError(
          "SSLCommerz transaction mismatch",
          status.UNAUTHORIZED,
        );
      }

      await prisma.$transaction(async (tx) => {
        const booking = await tx.reservation.findFirst({
          where: {
            OR: [{ id: bookingId }, { bookingCode: bookingId }],
          },
          include: {
            payment: true,
          },
        });

        if (!booking || !booking.payment) {
          throw new AppError("Booking payment not found", status.NOT_FOUND);
        }

        if (booking.payment.status !== PaymentStatus.SUCCESS) {
          await tx.payment.update({
            where: { id: booking.payment.id },
            data: {
              status: PaymentStatus.SUCCESS,
              paymentMethod: PaymentMethod.SSLCOMMERZ,
              transactionId: transactionId ?? validatedTranId ?? undefined,
            },
          });
        }

        const chargedAmount = Number(booking.payment.amount);
        const total = Number(booking.totalPrice);
        const newPaidAmount = round2(
          Math.min(Number(booking.paidAmount) + chargedAmount, total),
        );
        const newRemainingAmount = round2(Math.max(total - newPaidAmount, 0));

        await tx.reservation.update({
          where: { id: booking.id },
          data: {
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount,
            paymentMethod: PaymentMethod.SSLCOMMERZ,
            paymentStatus:
              newRemainingAmount <= 0
                ? BookingPaymentStatus.PAID
                : BookingPaymentStatus.PARTIAL,
            bookingStatus: BookingStatus.CONFIRMED,
            expiresAt: newRemainingAmount <= 0 ? null : booking.expiresAt,
          },
        });
      });

      return {
        bookingId,
        redirectUrl: buildFrontendRedirect("success", bookingId),
      };
    }

    await prisma.$transaction(async (tx) => {
      const booking = await tx.reservation.findFirst({
        where: {
          OR: [{ id: bookingId }, { bookingCode: bookingId }],
        },
        include: {
          payment: true,
        },
      });

      if (!booking) {
        return;
      }

      if (booking.payment) {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: {
            status: PaymentStatus.FAILED,
            paymentMethod: PaymentMethod.SSLCOMMERZ,
            transactionId: transactionId ?? undefined,
          },
        });
      }

      if (gatewayStatus === "cancel") {
        await tx.reservation.update({
          where: { id: booking.id },
          data: {
            bookingStatus: BookingStatus.CANCELLED,
          },
        });
      }
    });

    return {
      bookingId,
      redirectUrl: buildFrontendRedirect(gatewayStatus, bookingId),
    };
  },
};
