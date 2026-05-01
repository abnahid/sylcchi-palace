import { aboutFaqItems } from "@/components/about/about-content";
import { ChevronDown } from "lucide-react";

const FaqSection = () => {
  const cards = [
    ...aboutFaqItems.slice(0, 2).map((faq) => ({ type: "faq" as const, faq })),
    { type: "cta" as const },
    ...aboutFaqItems.slice(2).map((faq) => ({ type: "faq" as const, faq })),
  ];

  return (
    <section className=" py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <h2 className="max-w-xl font-mulish text-4xl font-extrabold leading-[1.05] text-[#101b25] dark:text-white sm:text-5xl">
            Frequently asked questions about Sylcchi Palace
          </h2>
          <p className="max-w-57.5 text-left font-open-sans text-sm leading-5 text-[#5b6774] dark:text-[#9aa5b0] md:pt-2 md:text-right">
            Everything you need to know about your stay at our luxury hotel in Sylhet.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card, index) => {
            if (card.type === "cta") {
              return (
                <article
                  key={`cta-${index}`}
                  className="rounded-lg bg-primary p-6 text-primary-foreground"
                >
                  <h3 className="font-mulish text-3xl font-extrabold leading-tight">
                    Do you have any questions?
                  </h3>
                  <p className="mt-3 font-open-sans text-sm text-primary-foreground/85">
                    Can&apos;t find what you&apos;re looking for? Our team is here
                    to help.
                  </p>
                  <button
                    type="button"
                    className="mt-6 rounded-md bg-white dark:bg-[#101e2e] px-5 py-2.5 font-mulish text-sm font-bold text-primary dark:text-[#7fb3df] transition-colors hover:bg-[#eaf1f8] dark:hover:bg-[#1a2b3d]"
                  >
                    Ask a question
                  </button>
                </article>
              );
            }

            return (
              <article
                key={card.faq.q}
                className="rounded-lg bg-white dark:bg-[#101e2e] p-5 shadow-[0_2px_22px_0_rgba(25,56,80,0.08)]"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h4 className="font-mulish text-[32px] font-extrabold leading-[1.08] text-primary dark:text-[#7fb3df]">
                    {card.faq.q}
                  </h4>
                  <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-primary dark:text-[#7fb3df]" />
                </div>
                <p className="font-open-sans text-sm leading-relaxed text-[#5b6774] dark:text-[#9aa5b0]">
                  {card.faq.a}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
