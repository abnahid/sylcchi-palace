import type { BookingData } from "@/lib/types/booking";
import { format, parseISO } from "date-fns";

type BookingConfirmationDetailsSectionProps = {
  booking: BookingData;
};

function formatDate(value: string): string {
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return format(parsed, "EEE, MMM d, yyyy");
}

function PriceRow({
  label,
  value,
  valueClass,
  bold,
}: {
  label: string;
  value: string;
  valueClass?: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between font-open-sans text-sm text-[#5f6c79] dark:text-[#9aa5b0] ${bold ? "mt-3 border-t border-[#e1e8ef] dark:border-[#243443] pt-3" : "mt-2"}`}
    >
      <span className={bold ? "font-mulish text-base font-extrabold text-[#101b25] dark:text-white" : ""}>
        {label}
      </span>
      <span
        className={
          bold
            ? "font-mulish text-2xl font-extrabold text-primary"
            : valueClass ?? "text-[#101b25] dark:text-white"
        }
      >
        {value}
      </span>
    </div>
  );
}

export default function BookingConfirmationDetailsSection({
  booking,
}: BookingConfirmationDetailsSectionProps) {
  const depositPercent = Math.round((booking.depositRate ?? 0) * 100);
  const paidPercent =
    booking.totalPrice > 0
      ? Math.min(100, Math.round((booking.paidAmount / booking.totalPrice) * 100))
      : 0;

  const refundStatus = booking.payment?.refundStatus;
  const refundAmount = booking.payment?.refundAmount;

  return (
    <section className="rounded-2xl border border-[#dbe5ef] dark:border-[#243443] bg-white dark:bg-[#101e2e] p-6 sm:p-8">
      <h2 className="font-mulish text-xl font-extrabold text-[#101b25] dark:text-white">
        Booking details
      </h2>

      {/* Stay info grid */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[#dbe5ef] dark:border-[#243443] bg-[#f7fafd] dark:bg-[#0a1622] px-4 py-3">
          <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1] dark:text-[#7d8a96]">
            Room
          </p>
          <p className="mt-1 font-mulish text-sm font-bold text-[#101b25] dark:text-white">
            {booking.room?.name ?? "Selected room"}
          </p>
        </div>

        <div className="rounded-lg border border-[#dbe5ef] dark:border-[#243443] bg-[#f7fafd] dark:bg-[#0a1622] px-4 py-3">
          <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1] dark:text-[#7d8a96]">
            Guests
          </p>
          <p className="mt-1 font-mulish text-sm font-bold text-[#101b25] dark:text-white">
            {booking.guests} guest{booking.guests > 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-lg border border-[#dbe5ef] dark:border-[#243443] bg-[#f7fafd] dark:bg-[#0a1622] px-4 py-3">
          <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1] dark:text-[#7d8a96]">
            Check-in
          </p>
          <p className="mt-1 font-mulish text-sm font-bold text-[#101b25] dark:text-white">
            {formatDate(booking.checkInDate)}
          </p>
        </div>

        <div className="rounded-lg border border-[#dbe5ef] dark:border-[#243443] bg-[#f7fafd] dark:bg-[#0a1622] px-4 py-3">
          <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1] dark:text-[#7d8a96]">
            Check-out
          </p>
          <p className="mt-1 font-mulish text-sm font-bold text-[#101b25] dark:text-white">
            {formatDate(booking.checkOutDate)}
          </p>
        </div>

        <div className="rounded-lg border border-[#dbe5ef] dark:border-[#243443] bg-[#f7fafd] dark:bg-[#0a1622] px-4 py-3">
          <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1] dark:text-[#7d8a96]">
            Duration
          </p>
          <p className="mt-1 font-mulish text-sm font-bold text-[#101b25] dark:text-white">
            {booking.nights} night{booking.nights > 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-lg border border-[#dbe5ef] dark:border-[#243443] bg-[#f7fafd] dark:bg-[#0a1622] px-4 py-3">
          <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1] dark:text-[#7d8a96]">
            Payment method
          </p>
          <p className="mt-1 font-mulish text-sm font-bold text-[#101b25] dark:text-white">
            {booking.paymentMethod === "STRIPE"
              ? "Card (Stripe)"
              : booking.paymentMethod === "SSLCOMMERZ"
                ? "SSLCommerz"
                : "Pay at check-in"}
          </p>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="mt-5 border-t border-[#e1e8ef] dark:border-[#243443] pt-4">
        <h3 className="mb-2 font-mulish text-sm font-extrabold text-[#101b25] dark:text-white">
          Price breakdown
        </h3>

        <PriceRow
          label={`$${Number(booking.basePrice).toFixed(2)} × ${booking.nights} night${booking.nights > 1 ? "s" : ""}`}
          value={`$${Number(booking.subtotal).toFixed(2)}`}
        />
        <PriceRow label="VAT (5%)" value={`$${Number(booking.vat).toFixed(2)}`} />

        {depositPercent > 0 && depositPercent < 100 && (
          <PriceRow
            label={`Deposit (${depositPercent}%)`}
            value={`$${Number(booking.depositAmount).toFixed(2)}`}
            valueClass="text-blue-700 dark:text-blue-300"
          />
        )}

        <PriceRow
          label={`Paid (${paidPercent}%)`}
          value={`$${Number(booking.paidAmount).toFixed(2)}`}
          valueClass="font-bold text-emerald-700 dark:text-emerald-400"
        />

        {booking.remainingAmount > 0 &&
          booking.bookingStatus.toUpperCase() !== "CANCELLED" && (
            <PriceRow
              label="Remaining due"
              value={`$${Number(booking.remainingAmount).toFixed(2)}`}
              valueClass="font-bold text-amber-700 dark:text-amber-300"
            />
          )}

        {/* Refund info */}
        {refundStatus && refundStatus !== "NONE" && (
          <div className="mt-3 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-4 py-3">
            <p className="font-open-sans text-xs uppercase tracking-wide text-blue-500 dark:text-blue-400">
              Refund status
            </p>
            <p className="mt-1 font-mulish text-sm font-bold text-blue-700 dark:text-blue-300">
              {refundStatus === "COMPLETED" ? "Refund completed" : "Refund pending"}
              {refundAmount != null && refundAmount > 0 && (
                <span className="ml-1 font-open-sans font-normal text-blue-600 dark:text-blue-400">
                  — ${Number(refundAmount).toFixed(2)}
                </span>
              )}
            </p>
          </div>
        )}

        <PriceRow label="Total" value={`$${Number(booking.totalPrice).toFixed(2)}`} bold />
      </div>
    </section>
  );
}
