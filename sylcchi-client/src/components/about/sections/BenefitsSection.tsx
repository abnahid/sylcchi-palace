import { aboutStats } from "@/components/about/about-content";
import Image from "next/image";

const BenefitsSection = () => {
  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 font-mulish text-3xl font-extrabold text-[#101b25] sm:text-4xl">
              The main benefits to choose Sylcchi Palace
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {aboutStats.map((stat) => (
                <div key={stat.num}>
                  <p className="font-mulish text-4xl font-extrabold leading-none text-primary sm:text-5xl">
                    {stat.num}
                  </p>
                  <p className="mt-2 font-open-sans text-sm leading-relaxed text-[#5b6774]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="font-open-sans text-lg leading-relaxed text-[#5b6774]">
            <p>
              Welcome to Sylcchi Palace — a premier luxury hotel nestled in the
              heart of Sylhet. We combine refined elegance with warm
              hospitality, offering guests an unforgettable experience with
              beautifully appointed rooms, exceptional dining, and personalised
              service that sets the standard for luxury accommodation in Sylhet.
            </p>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-xl">
          <div className="relative h-60 sm:h-87.5 lg:h-120">
            <Image
              src="/Gallery/room-4.webp"
              alt="Sylcchi Palace interior"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1200px"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
