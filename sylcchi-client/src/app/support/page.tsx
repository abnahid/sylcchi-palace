import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help & Support",
  description:
    "Need help with your stay or booking at Sylcchi Palace? Find answers to common questions, contact our 24/7 guest support team, or reach out by phone, email or WhatsApp.",
  alternates: { canonical: "/support" },
};

const faqs = [
  {
    q: "How do I book a room?",
    a: "Browse our Rooms page, pick your check-in and check-out dates, choose a room that fits your guests, and complete payment securely with Stripe or SSLCommerz. You will receive a confirmation email with your booking details.",
  },
  {
    q: "Can I cancel or modify my reservation?",
    a: "Yes. Bookings can be cancelled free of charge up to 24 hours before your check-in date from your Profile → My Bookings page. After that window, the first night is non-refundable.",
  },
  {
    q: "What are the check-in and check-out times?",
    a: "Check-in starts at 2:00 PM and check-out is by 12:00 PM (noon). Early check-in or late check-out can be arranged on request, subject to availability.",
  },
  {
    q: "Do you offer airport pickup?",
    a: "Yes — we offer an airport shuttle from Sylhet Osmani International Airport on request. Please contact us at least 12 hours in advance with your flight details.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards through Stripe, as well as local Bangladeshi payment methods (bKash, Nagad, cards) through SSLCommerz.",
  },
  {
    q: "Is breakfast included?",
    a: "Complimentary breakfast is included with most room types. The room details page will indicate whether breakfast is included for the room you select.",
  },
  {
    q: "Do you allow children?",
    a: "Absolutely. Children under 6 stay free when sharing a room with an adult. Family suites are available for larger groups.",
  },
  {
    q: "Is Wi-Fi available?",
    a: "Yes, free high-speed Wi-Fi is available throughout the hotel and in every room.",
  },
];

export default function Page() {
  return (
    <main className="bg-slate-50">
      <section className="bg-[#245b8d] text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h1 className="font-mulish text-4xl font-extrabold md:text-5xl">
            Help & Support
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-100">
            We&apos;re here for you 24/7. Find quick answers below or reach out
            to our guest support team — whichever is easier.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-mulish text-lg font-bold text-[#245b8d]">
              Call us
            </h3>
            <p className="mt-2 text-sm text-slate-600">Front desk · 24/7</p>
            <a
              href="tel:+8801819334455"
              className="mt-3 block text-base font-semibold text-slate-800 hover:text-[#245b8d]"
            >
              +880 1819-334455
            </a>
            <a
              href="tel:+8801677998877"
              className="mt-1 block text-base font-semibold text-slate-800 hover:text-[#245b8d]"
            >
              +880 1677-998877
            </a>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-mulish text-lg font-bold text-[#245b8d]">
              Email
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              We reply within 2 hours
            </p>
            <a
              href="mailto:support@sylcchipalace.com"
              className="mt-3 block text-base font-semibold text-slate-800 hover:text-[#245b8d]"
            >
              support@sylcchipalace.com
            </a>
            <a
              href="mailto:info@sylcchipalace.com"
              className="mt-1 block text-base font-semibold text-slate-800 hover:text-[#245b8d]"
            >
              info@sylcchipalace.com
            </a>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-mulish text-lg font-bold text-[#245b8d]">
              Visit us
            </h3>
            <p className="mt-2 text-sm text-slate-600">Front desk reception</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Dargah Gate Road
              <br />
              Sylhet 3100, Bangladesh
            </p>
          </div>
        </div>

        <div className="mt-14">
          <h2 className="font-mulish text-2xl font-extrabold text-slate-900">
            Frequently asked questions
          </h2>
          <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {faqs.map((item) => (
              <details key={item.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-slate-800">
                  <span>{item.q}</span>
                  <span className="ml-4 text-[#245b8d] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-2xl bg-[#245b8d] p-8 text-center text-white">
          <h2 className="font-mulish text-2xl font-extrabold">
            Still need a hand?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-100">
            Our concierge team is available around the clock. You can also chat
            with our AI concierge using the chat bubble at the bottom right of
            any page.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#245b8d] transition hover:bg-slate-100"
          >
            Contact us
          </Link>
        </div>
      </section>
    </main>
  );
}
