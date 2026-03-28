"use client";

import BookingConfirmationDetailsSection from "@/components/booking/sections/BookingConfirmationDetailsSection";
import BookingConfirmationStatusSection from "@/components/booking/sections/BookingConfirmationStatusSection";
import { useCancelBooking, useBookingById, usePayBooking } from "@/hooks/useBooking";
import {
  AlertCircle,
  Ban,
  CreditCard,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") ?? "";

  const {
    data: booking,
    isLoading,
    isError,
    error,
    refetch,
  } = useBookingById(bookingId);

  const payMutation = usePayBooking();
  const cancelMutation = useCancelBooking();

  const [actionError, setActionError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handlePayRemaining = async () => {
    if (!booking) return;
    setActionError(null);

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

      refetch();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Payment failed. Please try again.",
      );
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    setActionError(null);
    setShowCancelConfirm(false);

    try {
      await cancelMutation.mutateAsync({ bookingId: booking.id });
      refetch();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not cancel booking.",
      );
    }
  };

  if (!bookingId) {
    return (
      <main className="bg-[#f7fafd] py-10">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-2xl border border-[#dbe5ef] bg-white p-6 sm:p-8">
            <h1 className="font-mulish text-2xl font-extrabold text-[#101b25]">
              Booking not found
            </h1>
            <p className="mt-2 font-open-sans text-sm text-[#5b6774]">
              A booking id was not provided. Please go back to the rooms page.
            </p>
            <Link
              href="/rooms"
              className="mt-5 inline-flex rounded-md bg-primary px-4 py-2.5 font-mulish text-sm font-bold text-primary-foreground"
            >
              Browse rooms
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="bg-[#f7fafd] py-10">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[#dbe5ef] bg-white p-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="font-open-sans text-sm text-[#5b6774]">
              Loading booking details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (isError || !booking) {
    return (
      <main className="bg-[#f7fafd] py-10">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-2xl border border-red-200 bg-white p-6 sm:p-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <h1 className="font-mulish text-2xl font-extrabold text-[#101b25]">
              Could not load booking
            </h1>
            <p className="mt-2 font-open-sans text-sm leading-relaxed text-[#5f6c79]">
              {error?.message ?? "Something went wrong. Please try again later."}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 font-mulish text-sm font-bold text-primary-foreground"
              >
                <RefreshCcw className="h-4 w-4" /> Try again
              </button>
              <Link
                href="/rooms"
                className="inline-flex items-center justify-center rounded-md border border-primary px-5 py-2.5 font-mulish text-sm font-bold text-primary"
              >
                Back to rooms
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const normalizedBooking = booking.bookingStatus.toUpperCase();
  const normalizedPayment = booking.paymentStatus.toUpperCase();

  const canPay =
    normalizedBooking !== "CANCELLED" &&
    (normalizedPayment === "PENDING" || normalizedPayment === "PARTIAL") &&
    booking.remainingAmount > 0;

  const canCancel =
    normalizedBooking !== "CANCELLED" && normalizedBooking === "PENDING"
      ? true
      : normalizedBooking === "CONFIRMED" && normalizedPayment !== "PAID";

  return (
    <main className="bg-[#f7fafd] py-8 lg:py-12">
      <div className="mx-auto max-w-4xl space-y-6 px-4">
        {/* Action error */}
        {actionError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-open-sans text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {actionError}
          </div>
        )}

        <BookingConfirmationStatusSection
          bookingCode={booking.bookingCode}
          bookingStatus={booking.bookingStatus}
          paymentStatus={booking.paymentStatus}
          paidAmount={Number(booking.paidAmount)}
          totalPrice={Number(booking.totalPrice)}
          remainingAmount={Number(booking.remainingAmount)}
          depositRate={Number(booking.depositRate ?? 0)}
        />

        <BookingConfirmationDetailsSection booking={booking} />

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {/* Pay remaining / Pay now */}
          {canPay && (
            <button
              type="button"
              onClick={handlePayRemaining}
              disabled={payMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-mulish text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {payMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  {normalizedPayment === "PENDING"
                    ? `Pay now — $${Number(booking.depositAmount).toFixed(2)}`
                    : `Pay remaining — $${Number(booking.remainingAmount).toFixed(2)}`}
                </>
              )}
            </button>
          )}

          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-md border border-primary px-5 py-3 font-mulish text-sm font-extrabold text-primary sm:w-auto"
          >
            Back to home
          </Link>
          <Link
            href="/rooms"
            className="inline-flex w-full items-center justify-center rounded-md border border-[#dbe5ef] px-5 py-3 font-mulish text-sm font-extrabold text-[#5f6c79] sm:w-auto"
          >
            Book another room
          </Link>

          {/* Cancel */}
          {canCancel && !showCancelConfirm && (
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-200 px-5 py-3 font-mulish text-sm font-extrabold text-red-600 transition-colors hover:bg-red-50 sm:w-auto"
            >
              <Ban className="h-4 w-4" /> Cancel booking
            </button>
          )}
        </div>

        {/* Cancel confirmation */}
        {showCancelConfirm && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-mulish text-sm font-bold text-red-800">
              Are you sure you want to cancel this booking?
            </p>
            <p className="mt-1 font-open-sans text-sm text-red-700">
              {Number(booking.paidAmount) > 0
                ? "Refund eligibility depends on how far your check-in date is. Cancellations 7+ days before check-in receive a full refund."
                : "This action cannot be undone."}
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 font-mulish text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-70"
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Cancelling...
                  </>
                ) : (
                  "Yes, cancel booking"
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="rounded-md border border-red-200 px-4 py-2 font-mulish text-sm font-bold text-red-700 transition-colors hover:bg-red-100"
              >
                Keep booking
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function BookingConfirmationClient() {
  return (
    <Suspense fallback={null}>
      <BookingConfirmationContent />
    </Suspense>
  );
}
