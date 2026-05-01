import { differenceInCalendarDays } from "date-fns";
import { Info, Loader2, ShieldCheck } from "lucide-react";

type BookingPriceSummarySectionProps = {
  nightlyPrice: number;
  nights: number;
  subtotal: number;
  vat: number;
  total: number;
  submitting: boolean;
  onSubmit: () => void;
  paymentMethod: "stripe" | "sslcommerz" | "pay_later";
  checkInDate: Date;
};

function getDepositInfo(daysBeforeCheckIn: number) {
  if (daysBeforeCheckIn > 15) {
    return { rate: 0.25, label: "25% deposit", note: "75% due before check-in" };
  }
  if (daysBeforeCheckIn >= 7) {
    return { rate: 0.5, label: "50% deposit", note: "50% due before check-in" };
  }
  return { rate: 1, label: "Full payment", note: "Full amount due now" };
}

export default function BookingPriceSummarySection({
  nightlyPrice,
  nights,
  subtotal,
  vat,
  total,
  submitting,
  onSubmit,
  paymentMethod,
  checkInDate,
}: BookingPriceSummarySectionProps) {
  const daysUntilCheckIn = Math.max(
    0,
    differenceInCalendarDays(checkInDate, new Date()),
  );

  const deposit = getDepositInfo(daysUntilCheckIn);
  const isPayLater = paymentMethod === "pay_later";
  const depositAmount = isPayLater ? 0 : total * deposit.rate;
  const showDeposit = !isPayLater && deposit.rate < 1;

  return (
    <aside className="h-fit rounded-2xl border border-[#dbe5ef] dark:border-[#243443] bg-white dark:bg-[#101e2e] p-5 sm:p-6">
      <h2 className="font-mulish text-xl font-extrabold text-[#101b25] dark:text-white">
        Price summary
      </h2>

      <div className="mt-4 space-y-2.5 font-open-sans text-sm text-[#5f6c79] dark:text-[#9aa5b0]">
        <div className="flex items-center justify-between">
          <span>
            ${nightlyPrice.toFixed(2)} x {nights} night{nights > 1 ? "s" : ""}
          </span>
          <span className="text-[#101b25] dark:text-white">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>VAT (5%)</span>
          <span className="text-[#101b25] dark:text-white">${vat.toFixed(2)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="mt-4 border-t border-[#e1e8ef] dark:border-[#243443] pt-4">
        <div className="flex items-end justify-between">
          <span className="font-mulish text-base font-extrabold text-[#101b25] dark:text-white">
            Total
          </span>
          <span className="font-mulish text-3xl font-extrabold text-primary">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Deposit breakdown for online payments */}
      {!isPayLater && (
        <div className="mt-4 rounded-xl border border-blue-100 dark:border-blue-500/30 bg-blue-50/60 dark:bg-blue-500/10 p-4">
          <div className="flex items-center gap-2 font-mulish text-sm font-bold text-blue-800 dark:text-blue-300">
            <Info className="h-4 w-4" />
            {deposit.label}
          </div>

          {showDeposit ? (
            <div className="mt-2 space-y-1.5 font-open-sans text-sm">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 dark:text-blue-300">Pay now ({Math.round(deposit.rate * 100)}%)</span>
                <span className="font-bold text-blue-800 dark:text-blue-300">
                  ${depositAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5f6c79] dark:text-[#9aa5b0]">Due before check-in</span>
                <span className="text-amber-700 dark:text-amber-300">
                  ${(total - depositAmount).toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-1 font-open-sans text-xs text-blue-600 dark:text-blue-400">
              {deposit.note}
            </p>
          )}

          {showDeposit && (
            <p className="mt-2 font-open-sans text-xs text-[#8593a1] dark:text-[#7d8a96]">
              Deposit rate is based on check-in proximity ({daysUntilCheckIn}{" "}
              day{daysUntilCheckIn !== 1 ? "s" : ""} away)
            </p>
          )}
        </div>
      )}

      {/* Pay later info */}
      {isPayLater && (
        <div className="mt-4 rounded-xl border border-amber-100 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 font-mulish text-sm font-bold text-amber-800 dark:text-amber-300">
            <Info className="h-4 w-4" />
            Pay at check-in
          </div>
          <p className="mt-1 font-open-sans text-xs text-amber-600 dark:text-amber-400">
            No payment required now. Full amount is due at the property on your
            check-in date. Booking expires if not confirmed within 5 hours.
          </p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3.5 font-mulish text-sm font-extrabold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Processing...
          </>
        ) : isPayLater ? (
          "Reserve now"
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            {showDeposit
              ? `Pay $${depositAmount.toFixed(2)} deposit`
              : `Pay $${total.toFixed(2)}`}
          </>
        )}
      </button>

      {/* Trust signals */}
      <p className="mt-3 text-center font-open-sans text-xs text-[#8593a1] dark:text-[#7d8a96]">
        <ShieldCheck className="mr-1 inline h-3 w-3" />
        Secure payment powered by{" "}
        {paymentMethod === "sslcommerz" ? "SSLCommerz" : "Stripe"}
      </p>
    </aside>
  );
}
