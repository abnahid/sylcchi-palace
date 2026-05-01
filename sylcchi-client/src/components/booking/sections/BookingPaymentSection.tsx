type BookingPaymentSectionProps = {
  paymentMethod: "stripe" | "sslcommerz" | "pay_later";
  onPaymentMethodChange: (
    method: "stripe" | "sslcommerz" | "pay_later",
  ) => void;
};

const paymentOptions = [
  {
    value: "stripe",
    title: "Stripe",
    desc: "Pay securely with card",
  },
  {
    value: "sslcommerz",
    title: "SSLCommerz",
    desc: "Pay with local payment channels",
  },
  {
    value: "pay_later",
    title: "Pay Later",
    desc: "Reserve now and pay at check-in",
  },
] as const;

export default function BookingPaymentSection({
  paymentMethod,
  onPaymentMethodChange,
}: BookingPaymentSectionProps) {
  return (
    <section className="rounded-2xl border border-[#dbe5ef] dark:border-[#243443] bg-white dark:bg-[#101e2e] p-5 sm:p-6">
      <h2 className="font-mulish text-xl font-extrabold text-[#101b25] dark:text-white">
        Payment method
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {paymentOptions.map((option) => {
          const active = paymentMethod === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onPaymentMethodChange(option.value)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                active
                  ? "border-primary bg-[#eaf3fb] dark:bg-[#17354f]/40"
                  : "border-[#dbe5ef] dark:border-[#243443] bg-white dark:bg-[#101e2e] hover:border-primary/60"
              }`}
            >
              <p className="font-mulish text-sm font-extrabold text-[#101b25] dark:text-white">
                {option.title}
              </p>
              <p className="mt-1 font-open-sans text-xs text-[#5f6c79] dark:text-[#9aa5b0]">
                {option.desc}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
