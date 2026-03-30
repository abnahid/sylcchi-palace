"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { FaHotel, FaRegSmileBeam, FaUsers } from "react-icons/fa";

const features = [
  {
    icon: FaHotel,
    title: "Prime city location",
    description: "Stay near Dargah Gate with easy access to Sylhet landmarks.",
  },
  {
    icon: FaUsers,
    title: "Comfort for every guest",
    description:
      "Premium room options for families, couples, and business stays.",
  },
  {
    icon: FaRegSmileBeam,
    title: "Trusted hospitality",
    description: "Warm service and thoughtful amenities for a memorable visit.",
  },
];

export default function Accommodation() {
  return (
    <section className="bg-[#f0f5fa] py-12 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          {/* Left side - Text content */}
          <div>
            <h2 className="mb-4 max-w-md font-mulish text-2xl font-extrabold leading-tight text-[#101b25] sm:text-3xl lg:text-4xl">
              Discover refined comfort at Sylcchi Palace
            </h2>
            <p className="mb-8 max-w-md font-open-sans text-sm leading-relaxed text-gray-500 sm:text-base">
              Enjoy elegant rooms, modern facilities, and personalized service
              designed for both leisure and business travelers.
            </p>

            <div className="flex flex-col gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  {/* Icon circle */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-mulish text-base font-bold text-[#101b25] sm:text-lg">
                      {feature.title}
                    </h3>
                    <p className="font-open-sans text-sm text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Image with floating cards */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Wrapper with padding to contain the overflow from floating cards */}
            <div className="relative px-4 py-6 sm:px-10 sm:py-8 lg:px-12 lg:py-10">
              {/* Main image container */}
              <div className="relative h-80 w-64 sm:h-105 sm:w-85 lg:h-120 lg:w-130">
                {/* Main image */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                  <Image
                    src="/Gallery/room-4.webp"
                    alt="Accommodation"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 256px, (max-width: 1024px) 340px, 380px"
                  />
                </div>

                {/* Room price card - bottom left, overlapping */}
                <div className="absolute -left-3 bottom-8 z-10 w-48 rounded-xl bg-white p-3.5 shadow-lg sm:-left-8 sm:bottom-12 sm:w-56 sm:p-4 lg:-left-10 lg:bottom-14 lg:w-60 lg:p-5">
                  <h4 className="mb-1 font-mulish text-sm font-bold text-[#101b25] lg:text-base">
                    Deluxe King Suite
                  </h4>
                  <div className="mb-2.5 flex items-baseline gap-1 sm:mb-3">
                    <span className="font-mulish text-xl font-extrabold text-[#101b25] sm:text-2xl lg:text-3xl">
                      $249
                    </span>
                    <span className="font-open-sans text-xs text-gray-500 sm:text-sm">
                      / 1 night
                    </span>
                  </div>
                  <button className="rounded-md bg-primary px-3.5 py-1.5 font-mulish text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 sm:px-4 sm:py-2 sm:text-sm">
                    See availability
                  </button>
                </div>

                {/* Review card - top right, overlapping */}
                <div className="absolute -right-3 -top-4 z-10 w-44 rounded-xl bg-white p-3 shadow-lg sm:-right-8 sm:-top-2 sm:w-52 sm:p-4 lg:-right-10 lg:top-4 lg:w-56 lg:p-5">
                  <p className="mb-2 font-mulish text-xs font-bold leading-snug text-[#101b25] sm:text-sm lg:text-base">
                    Perfect stay in Sylhet with excellent rooms and service.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gray-200 sm:h-8 sm:w-8">
                      <Image
                        src="/Gallery/room-1.webp"
                        alt="Esmond Ward"
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3.5 w-3.5 fill-amber-400 text-amber-400 sm:h-4 sm:w-4"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 font-mulish text-[11px] font-semibold text-[#101b25] sm:text-xs lg:text-sm">
                    Guest Review
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
