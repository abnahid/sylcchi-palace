"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "How do I book a room at Sylcchi Palace?",
    a: "Browse our Rooms page, select your check-in and check-out dates, choose a room that fits your guests, and complete payment securely with Stripe or SSLCommerz. You'll receive a confirmation email instantly with all your booking details.",
  },
  {
    q: "What are the check-in and check-out times?",
    a: "Check-in starts at 2:00 PM and check-out is by 12:00 PM (noon). Early check-in or late check-out can be arranged on request, subject to availability.",
  },
  {
    q: "Can I cancel or modify my reservation?",
    a: "Yes. You can cancel free of charge up to 24 hours before your check-in date directly from your Profile → My Bookings page. Cancellations made later are charged the first night's rate.",
  },
  {
    q: "What amenities are included with my stay?",
    a: "Every stay includes free high-speed Wi-Fi, complimentary breakfast on most room types, access to the rooftop pool and fitness center, and 24/7 room service. Airport shuttle is available on request.",
  },
  {
    q: "Do you accept local Bangladeshi payment methods?",
    a: "Yes — we accept all major international cards through Stripe, plus bKash, Nagad, and local cards through SSLCommerz. All payments are processed securely.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white py-12 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="font-mulish text-primary mb-3 text-sm font-bold tracking-widest uppercase">
              Frequently Asked Questions
            </p>
            <h2 className="font-mulish mb-4 max-w-md text-2xl leading-tight font-extrabold text-[#101b25] sm:text-3xl lg:text-4xl">
              Everything you need to know before your stay
            </h2>
            <p className="font-open-sans mb-8 max-w-md text-sm leading-relaxed text-gray-500 sm:text-base">
              From booking to check-out, here are quick answers to the
              questions our guests ask most. Need more help? Reach out to our
              24/7 concierge any time.
            </p>

            <a
              href="/support"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-mulish inline-flex items-center rounded-md px-5 py-2.5 text-sm font-bold transition-colors"
            >
              View all FAQs
            </a>
          </div>

          <div className="space-y-4">
            {faqs.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.q}
                  className={`overflow-hidden rounded-xl border transition-all ${
                    isOpen
                      ? "border-primary/30 bg-[#f0f5fa] shadow-sm"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-mulish text-base font-bold text-[#101b25] sm:text-lg">
                      {item.q}
                    </span>
                    <span
                      className={`bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform`}
                    >
                      {isOpen ? (
                        <Minus className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5">
                      <p className="font-open-sans text-sm leading-relaxed text-gray-600">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
