import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the terms and conditions for booking and staying at Sylcchi Palace, Sylhet's premier luxury hotel.",
  alternates: { canonical: "/terms" },
};

const sections = [
  {
    title: "1. Acceptance of terms",
    body: (
      <p>
        By booking a room or using the Sylcchi Palace website, you agree to be
        bound by these Terms & Conditions. If you do not agree, please do not
        use our services.
      </p>
    ),
  },
  {
    title: "2. Reservations",
    body: (
      <ul className="list-disc space-y-1 pl-6">
        <li>
          Guests must be at least 18 years old to make a reservation. A valid
          government-issued photo ID is required at check-in.
        </li>
        <li>
          The number of guests staying in a room must not exceed the room
          capacity shown on the booking page.
        </li>
        <li>
          A reservation is only confirmed once payment has been successfully
          processed and a confirmation email has been sent.
        </li>
      </ul>
    ),
  },
  {
    title: "3. Payments",
    body: (
      <p>
        Payments are processed securely through Stripe (international cards) or
        SSLCommerz (local Bangladeshi methods including bKash and Nagad). All
        prices on the website are in USD per night unless otherwise stated and
        are inclusive of applicable government taxes and service charges.
      </p>
    ),
  },
  {
    title: "4. Cancellation & refund policy",
    body: (
      <ul className="list-disc space-y-1 pl-6">
        <li>
          Free cancellation up to 24 hours before your check-in date — full
          refund.
        </li>
        <li>
          Cancellations made within 24 hours of check-in are charged the first
          night&apos;s rate.
        </li>
        <li>
          No-shows are charged the full booking amount and the reservation is
          released.
        </li>
        <li>
          Refunds are returned to the original payment method within 7–10
          business days.
        </li>
      </ul>
    ),
  },
  {
    title: "5. Check-in & check-out",
    body: (
      <p>
        Check-in is from 2:00 PM and check-out is by 12:00 PM (noon). Early
        check-in or late check-out may be arranged on request, subject to
        availability and possible additional charges.
      </p>
    ),
  },
  {
    title: "6. Hotel rules",
    body: (
      <ul className="list-disc space-y-1 pl-6">
        <li>Smoking is not permitted inside any room. Designated outdoor areas are available.</li>
        <li>
          Quiet hours are observed between 10:00 PM and 7:00 AM out of respect
          for other guests.
        </li>
        <li>
          Pets are not allowed unless specifically arranged in advance with
          management.
        </li>
        <li>
          Guests are responsible for any damage caused to room property during
          their stay.
        </li>
      </ul>
    ),
  },
  {
    title: "7. Liability",
    body: (
      <p>
        Sylcchi Palace is not liable for any loss, theft, or damage to personal
        belongings left unattended in public areas. We strongly recommend using
        the in-room safe for valuables.
      </p>
    ),
  },
  {
    title: "8. Use of the website & AI concierge",
    body: (
      <p>
        Our AI concierge chat assistant is provided for convenience and gives
        information based on data from our hotel systems. While we strive for
        accuracy, responses may occasionally be incomplete or out of date.
        Please confirm critical details with our front desk before making
        decisions based on AI responses.
      </p>
    ),
  },
  {
    title: "9. Changes to these terms",
    body: (
      <p>
        We may update these Terms & Conditions from time to time. Continued use
        of the website after changes constitutes acceptance of the updated
        terms.
      </p>
    ),
  },
  {
    title: "10. Governing law",
    body: (
      <p>
        These terms are governed by the laws of the People&apos;s Republic of
        Bangladesh. Any disputes will be resolved in the courts of Sylhet,
        Bangladesh.
      </p>
    ),
  },
];

export default function Page() {
  return (
    <main className="bg-slate-50 dark:bg-[#0a1622]">
      <section className="bg-[#245b8d] text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="font-mulish text-4xl font-extrabold md:text-5xl">
            Terms & Conditions
          </h1>
          <p className="mt-3 text-sm text-slate-100">
            Last updated: April 8, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="rounded-2xl bg-white dark:bg-[#101e2e] p-8 shadow-sm md:p-10">
          <p className="text-sm leading-7 text-slate-600 dark:text-[#9aa5b0]">
            Welcome to Sylcchi Palace. These Terms & Conditions govern your
            booking, stay, and use of our website and services. Please read
            them carefully before making a reservation.
          </p>

          <div className="mt-8 space-y-8">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="font-mulish text-lg font-bold text-slate-900 dark:text-white">
                  {s.title}
                </h2>
                <div className="mt-2 text-sm leading-7 text-slate-600 dark:text-[#9aa5b0]">
                  {s.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
