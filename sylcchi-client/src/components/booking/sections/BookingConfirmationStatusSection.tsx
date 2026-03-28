import {
  AlertCircle,
  BadgeCheck,
  Ban,
  Clock3,
  CreditCard,
  Wallet,
} from "lucide-react";

type BookingConfirmationStatusSectionProps = {
  bookingCode: string;
  bookingStatus: string;
  paymentStatus: string;
  paidAmount: number;
  totalPrice: number;
  remainingAmount: number;
  depositRate: number;
};

const bookingStatusConfig: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  CONFIRMED: {
    label: "Confirmed",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <BadgeCheck className="h-4 w-4" />,
  },
  PENDING: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <Clock3 className="h-4 w-4" />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: <Ban className="h-4 w-4" />,
  },
};

const paymentStatusConfig: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  PAID: {
    label: "Fully Paid",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <Wallet className="h-4 w-4" />,
  },
  PARTIAL: {
    label: "Partially Paid",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <CreditCard className="h-4 w-4" />,
  },
  PENDING: {
    label: "Unpaid",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <Clock3 className="h-4 w-4" />,
  },
};

function StatusBadge({
  config,
}: {
  config: { label: string; color: string; bg: string; border: string; icon: React.ReactNode };
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${config.color} ${config.bg} ${config.border}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

export default function BookingConfirmationStatusSection({
  bookingCode,
  bookingStatus,
  paymentStatus,
  paidAmount,
  totalPrice,
  remainingAmount,
  depositRate,
}: BookingConfirmationStatusSectionProps) {
  const normalizedBooking = bookingStatus.toUpperCase();
  const normalizedPayment = paymentStatus.toUpperCase();

  const bConfig = bookingStatusConfig[normalizedBooking] ?? bookingStatusConfig.PENDING;
  const pConfig = paymentStatusConfig[normalizedPayment] ?? paymentStatusConfig.PENDING;

  const paidPercent =
    totalPrice > 0 ? Math.min(100, Math.round((paidAmount / totalPrice) * 100)) : 0;

  const depositPercent = Math.round((depositRate ?? 0) * 100);

  const heroIcon =
    normalizedBooking === "CONFIRMED" ? (
      <BadgeCheck className="h-9 w-9 text-emerald-600" />
    ) : normalizedBooking === "CANCELLED" ? (
      <Ban className="h-9 w-9 text-red-500" />
    ) : (
      <Clock3 className="h-9 w-9 text-amber-500" />
    );

  const heroTitle =
    normalizedBooking === "CONFIRMED"
      ? "Booking confirmed"
      : normalizedBooking === "CANCELLED"
        ? "Booking cancelled"
        : "Booking pending";

  const heroSubtitle =
    normalizedBooking === "CONFIRMED" && normalizedPayment === "PAID"
      ? "Your booking is confirmed and fully paid. We look forward to welcoming you!"
      : normalizedBooking === "CONFIRMED" && normalizedPayment === "PARTIAL"
        ? `Your booking is confirmed with ${paidPercent}% paid. The remaining balance is due before check-in.`
        : normalizedBooking === "CANCELLED"
          ? "This booking has been cancelled."
          : "Complete your payment to confirm this booking. It will expire if left unpaid.";

  return (
    <section className="rounded-2xl border border-[#dbe5ef] bg-white p-6 sm:p-8">
      {/* Hero */}
      <div className="mb-6 flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
            normalizedBooking === "CONFIRMED"
              ? "bg-emerald-50"
              : normalizedBooking === "CANCELLED"
                ? "bg-red-50"
                : "bg-amber-50"
          }`}
        >
          {heroIcon}
        </div>

        <div className="min-w-0">
          <h1 className="font-mulish text-2xl font-extrabold text-[#101b25]">
            {heroTitle}
          </h1>
          <p className="mt-1 font-open-sans text-sm leading-relaxed text-[#5f6c79]">
            {heroSubtitle}
          </p>
        </div>
      </div>

      {/* Status badges */}
      <div className="mb-6 flex flex-wrap gap-2">
        <StatusBadge config={bConfig} />
        <StatusBadge config={pConfig} />
        {depositPercent > 0 && depositPercent < 100 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dbe5ef] bg-[#f7fafd] px-3 py-1 text-xs font-bold text-[#5f6c79]">
            {depositPercent}% deposit required
          </span>
        )}
      </div>

      {/* Booking code + statuses grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[#dbe5ef] bg-[#f7fafd] px-4 py-3">
          <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1]">
            Booking code
          </p>
          <p className="mt-1 font-mulish text-sm font-bold text-[#101b25]">
            {bookingCode}
          </p>
        </div>

        <div className="rounded-lg border border-[#dbe5ef] bg-[#f7fafd] px-4 py-3">
          <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1]">
            Booking status
          </p>
          <p className={`mt-1 font-mulish text-sm font-bold ${bConfig.color}`}>
            {bConfig.label}
          </p>
        </div>

        <div className="rounded-lg border border-[#dbe5ef] bg-[#f7fafd] px-4 py-3">
          <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1]">
            Payment status
          </p>
          <p className={`mt-1 font-mulish text-sm font-bold ${pConfig.color}`}>
            {pConfig.label}
          </p>
        </div>
      </div>

      {/* Payment progress bar */}
      {normalizedBooking !== "CANCELLED" && totalPrice > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between font-open-sans text-xs text-[#5f6c79]">
            <span>Payment progress</span>
            <span className="font-bold text-[#101b25]">{paidPercent}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                paidPercent >= 100
                  ? "bg-emerald-500"
                  : paidPercent > 0
                    ? "bg-blue-500"
                    : "bg-gray-200"
              }`}
              style={{ width: `${paidPercent}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between font-open-sans text-xs text-[#8593a1]">
            <span>
              Paid: <span className="font-bold text-emerald-700">${paidAmount.toFixed(2)}</span>
            </span>
            {remainingAmount > 0 && (
              <span>
                Due: <span className="font-bold text-amber-700">${remainingAmount.toFixed(2)}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
