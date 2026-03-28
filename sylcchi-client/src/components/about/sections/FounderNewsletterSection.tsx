import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const FounderNewsletterSection = () => {
  return (
    <section className="bg-[#eef2f7] py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="relative h-22 w-22 shrink-0 overflow-hidden rounded-full sm:h-24 sm:w-24">
              <Image
                src="/assets/images/s-logo.png"
                alt="Founder"
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>

            <div className="min-w-0">
              <blockquote className="font-mulish text-xl font-extrabold leading-tight text-[#101b25] sm:text-2xl">
                &ldquo;At Sylcchi Palace, we believe every guest deserves more
                than just a room — they deserve an experience. Our commitment is
                to deliver world-class luxury with the warmth of Sylheti
                hospitality.&rdquo;
              </blockquote>

              <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2">
                <p className="font-open-sans text-sm text-[#4f5c6a]">
                  Management Team
                </p>
                <p className="font-open-sans text-sm text-[#101b25]">
                  Sylcchi Palace, Sylhet
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
            <div className="border-l-2 border-primary pl-5">
              <h3 className="font-mulish text-3xl font-extrabold leading-tight text-[#101b25]">
                Ready to book your luxury stay?
              </h3>
              <p className="mt-3 max-w-md font-open-sans text-base leading-relaxed text-[#5b6774]">
                Explore our range of elegantly designed rooms and suites,
                each crafted to deliver an exceptional experience in the heart
                of Sylhet.
              </p>

              <Link
                href="/rooms"
                className="mt-5 inline-flex items-center rounded-lg bg-primary px-6 py-2.5 font-mulish text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                View rooms
              </Link>
            </div>

            <div className="self-end">
              <h3 className="font-mulish text-3xl font-extrabold text-[#101b25]">
                Newsletter
              </h3>
              <p className="mt-2 max-w-md font-open-sans text-base leading-relaxed text-[#5b6774]">
                Stay updated with exclusive offers, seasonal packages, and the
                latest news from Sylcchi Palace.
              </p>

              <form
                className="mt-5 flex w-full max-w-md flex-col gap-3 sm:flex-row"
                onSubmit={(event) => event.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full rounded-lg border border-[#b4bcc6] bg-white px-4 py-3 font-open-sans text-[15px] text-[#101b25] outline-none transition-colors placeholder:text-[#95a0ad] focus:border-primary sm:rounded-r-none"
                />

                <button
                  type="submit"
                  className="flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-primary-foreground transition-colors hover:bg-primary/90 sm:rounded-l-none"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderNewsletterSection;
