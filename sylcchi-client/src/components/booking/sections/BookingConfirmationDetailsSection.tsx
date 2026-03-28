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
      className={`flex items-center justify-between font-open-sans text-sm text-[#5f6c79] ${bold ? "mt-3 border-t border-[#e1e8ef] pt-3" : "mt-2"}`}
    >
      <span className={bold ? "font-mulish text-base font-extrabold text-[#101b25]" : ""}>
        {label}
      </span>
      <span
        className={
          bold
            ? "font-mulish text-2xl font-extrabold text-primary"
            : valueClass ?? "text-[#101b25]"
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
    <section className="rounded-2xl border border-[#dbe5ef] bg-white p-6 sm:p-8">
      <h2 className="font-mulish text-xl font-extrabold text-[#101b25]">
        Booking details
      </h2>

      {/* Stay info grid */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[#dbe5ef] bg-[#f7fafd] px-4 py-3">
          <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1]">
            Room
          </p>
          <p className="mt-1 font-mulish text-sm font-bold text-[#101b25]">
            {booking.room?.name ?? "Selected room"}
          </p>
        </div>

        <div className="rounded-lg border border-[#dbe5ef] bg-[#f7fafd] px-4 py-3">
          <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1]">
            Guests
          </p>
          <p className="mt-1 font-mulish text-sm font-bold text-[#101b25]">
            {booking.guests} guest{booking.guests > 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-lg border border-[#dbe5ef] bg-[#f7fafd] px-4 py-3">
          <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1]">
            Check-in
          </p>
          <p className="mt-1 font-mulish text-sm font-bold text-[#101b25]">
            {formatDate(booking.checkInDate)}
          </p>
        </div>

        <div className="rounded-lg border border-[#dbe5ef] bg-[#f7fafd] px-4 py-3">
          <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1]">
            Check-out
          </p>
          <p className="mt-1 font-mulish text-sm font-bold text-[#101b25]">
            {formatDate(booking.checkOutDate)}
          </p>
        </div>

        <div className="rounded-lg border border-[#dbe5ef] bg-[#f7fafd] px-4 py-3">
          <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1]">
            Duration
          </p>
          <p className="mt-1 font-mulish text-sm font-bold text-[#101b25]">
            {booking.nights} night{booking.nights > 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-lg border border-[#dbe5ef] bg-[#f7fafd] px-4 py-3">
          <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1]">
            Payment method
          </p>
          <p className="mt-1 font-mulish text-sm font-bold text-[#101b25]">
            {booking.paymentMethod === "STRIPE"
              ? "Card (Stripe)"
              : booking.paymentMethod === "SSLCOMMERZ"
                ? "SSLCommerz"
                : "Pay at check-in"}
          </p>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="mt-5 border-t border-[#e1e8ef] pt-4">
        <h3 className="mb-2 font-mulish text-sm font-extrabold text-[#101b25]">
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
            valueClass="text-blue-700"
          />
        )}

        <PriceRow
          label={`Paid (${paidPercent}%)`}
          value={`$${Number(booking.paidAmount).toFixed(2)}`}
          valueClass="font-bold text-emerald-700"
        />

        {booking.remainingAmount > 0 &&
          booking.bookingStatus.toUpperCase() !== "CANCELLED" && (
            <PriceRow
              label="Remaining due"
              value={`$${Number(booking.remainingAmount).toFixed(2)}`}
              valueClass="font-bold text-amber-700"
            />
          )}

        {/* Refund info */}
        {refundStatus && refundStatus !== "NONE" && (
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="font-open-sans text-xs uppercase tracking-wide text-blue-500">
              Refund status
            </p>
            <p className="mt-1 font-mulish text-sm font-bold text-blue-700">
              {refundStatus === "COMPLETED" ? "Refund completed" : "Refund pending"}
              {refundAmount != null && refundAmount > 0 && (
                <span className="ml-1 font-open-sans font-normal text-blue-600">
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
