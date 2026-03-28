"use client";

import { useBookingById, usePayBooking } from "@/hooks/useBooking";
import {
  AlertCircle,
  CreditCard,
  Loader2,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") ?? "";
  const [retryError, setRetryError] = useState<string | null>(null);

  const { data: booking, isLoading } = useBookingById(bookingId);
  const payMutation = usePayBooking();

  const handleRetry = async () => {
    if (!booking) return;
    setRetryError(null);

    const method =
      booking.paymentMethod === "SSLCOMMERZ" ? "sslcommerz" : "stripe";

    try {
      const result = await payMutation.mutateAsync({
        bookingId: booking.id,
        paymentMethod: method,
        action: "initiate",
      });

      const checkoutUrl =
        result.payment.checkoutUrl ?? result.payment.redirectUrl;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
    } catch (err) {
      setRetryError(
        err instanceof Error ? err.message : "Payment retry failed.",
      );
    }
  };

  const isExpired =
    booking?.expiresAt && new Date(booking.expiresAt) < new Date();
  const isCancelled = booking?.bookingStatus.toUpperCase() === "CANCELLED";
  const canRetry = booking && !isExpired && !isCancelled;

  return (
    <main className="min-h-[70vh] bg-[#f7fafd] px-4 py-10 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Icon */}
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-9 w-9 text-red-500" />
          </div>

          <h1 className="font-mulish text-3xl font-extrabold text-[#101b25] sm:text-4xl">
            Payment unsuccessful
          </h1>
          <p className="mt-3 max-w-xl font-open-sans text-sm leading-6 text-[#5f6c79] sm:text-base">
            Your payment could not be processed. No charges have been made to
            your account.
          </p>

          {/* Error banner */}
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-open-sans text-sm text-red-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-bold">Payment was not completed</p>
                <p className="mt-0.5 text-red-600">
                  This can happen if the transaction was declined, cancelled, or
                  your session timed out. You can safely try again.
                </p>
              </div>
            </div>
          </div>

          {/* Booking info if available */}
          {isLoading && bookingId && (
            <div className="mt-5 flex items-center gap-2 font-open-sans text-sm text-[#5f6c79]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading booking
              details...
            </div>
          )}

          {booking && (
            <div className="mt-5 rounded-xl border border-[#dbe5ef] bg-[#f7fafd] p-4">
              <div className="grid grid-cols-2 gap-3 font-open-sans text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#8593a1]">
                    Booking code
                  </p>
                  <p className="mt-0.5 font-mulish font-bold text-[#101b25]">
                    {booking.bookingCode}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#8593a1]">
                    Room
                  </p>
                  <p className="mt-0.5 font-mulish font-bold text-[#101b25]">
                    {booking.room?.name ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#8593a1]">
                    Amount due
                  </p>
                  <p className="mt-0.5 font-mulish font-bold text-amber-700">
                    ${Number(booking.remainingAmount).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#8593a1]">
                    Status
                  </p>
                  <p className="mt-0.5 font-mulish font-bold text-red-600">
                    {isCancelled
                      ? "Cancelled"
                      : isExpired
                        ? "Expired"
                        : "Awaiting payment"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Expired / cancelled warning */}
          {booking && isExpired && !isCancelled && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-open-sans text-sm text-amber-700">
              <p className="font-bold">Booking expired</p>
              <p className="mt-0.5">
                This booking has expired because payment was not completed in
                time. Please create a new booking.
              </p>
            </div>
          )}

          {booking && isCancelled && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-open-sans text-sm text-red-700">
              <p className="font-bold">Booking cancelled</p>
              <p className="mt-0.5">
                This booking has been cancelled and can no longer be paid.
                Please create a new booking.
              </p>
            </div>
          )}

          {/* Retry error */}
          {retryError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-open-sans text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {retryError}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {canRetry ? (
              <button
                type="button"
                onClick={handleRetry}
                disabled={payMutation.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-mulish text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70 sm:w-auto"
              >
                {payMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Retrying...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" /> Retry payment
                  </>
                )}
              </button>
            ) : bookingId ? (
              <Link
                href={`/booking/confirmation?bookingId=${encodeURIComponent(bookingId)}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-mulish text-sm font-extrabold text-primary-foreground sm:w-auto"
              >
                <RefreshCcw className="h-4 w-4" /> View booking
              </Link>
            ) : null}

            <Link
              href="/rooms"
              className="inline-flex w-full items-center justify-center rounded-md border border-primary px-5 py-3 font-mulish text-sm font-extrabold text-primary sm:w-auto"
            >
              Browse rooms
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function PaymentFailedClient() {
  return (
    <Suspense fallback={null}>
      <PaymentFailedContent />
    </Suspense>
  );
}
