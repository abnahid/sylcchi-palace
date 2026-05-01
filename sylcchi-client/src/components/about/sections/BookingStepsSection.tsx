import { aboutBookingSteps } from "@/components/about/about-content";
import Image from "next/image";
import Link from "next/link";

const BookingStepsSection = () => {
  return (
    <section className="bg-white dark:bg-[#101e2e] py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="mb-8 font-mulish text-3xl font-extrabold text-[#101b25] dark:text-white sm:text-4xl">
              Stages of booking a room
            </h2>

            <div className="space-y-6">
              {aboutBookingSteps.map((step) => (
                <div key={step.num} className="flex gap-4 sm:gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-primary dark:text-[#7fb3df]">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="font-mulish text-lg font-bold text-[#101b25] dark:text-white">
                      {step.title}
                    </h4>
                    <p className="mt-2 font-open-sans text-sm leading-relaxed text-[#5b6774] dark:text-[#9aa5b0] sm:text-[15px]">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/rooms"
              className="mt-8 inline-flex items-center rounded-lg bg-primary px-8 py-3 font-mulish text-base font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Book now
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl">
            <div className="relative h-80 sm:h-105">
              <Image
                src="/Gallery/room-5.webp"
                alt="Booking stages"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingStepsSection;
