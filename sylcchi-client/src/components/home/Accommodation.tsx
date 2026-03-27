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
            {/* Main image container */}
            <div className="relative h-100 w-[320px] sm:h-120 sm:w-137.5">
              {/* Main image - clipped top and bottom */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <Image
                  src="/Gallery/room-4.webp"
                  alt="Accommodation"
                  fill
                  className="object-cover"
                  sizes="380px"
                />
              </div>

              {/* Room price card - bottom left, overlapping */}
              <div className="absolute -left-8 bottom-12 z-10 w-56 rounded-xl bg-white p-4 shadow-lg sm:-left-20 sm:bottom-16 sm:w-64 sm:p-5">
                <h4 className="mb-1 font-mulish text-sm font-bold text-[#101b25] sm:text-base">
                  Deluxe King Suite
                </h4>
                <div className="mb-3 flex items-baseline gap-1">
                  <span className="font-mulish text-2xl font-extrabold text-[#101b25] sm:text-3xl">
                    $249
                  </span>
                  <span className="font-open-sans text-sm text-gray-500">
                    / 1 night
                  </span>
                </div>
                <button className="rounded-md bg-primary px-4 py-2 font-mulish text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 sm:text-sm">
                  See availability
                </button>
              </div>

              {/* Review card - top right, overlapping */}
              <div className="absolute -right-4 -top-4 z-10 w-52 rounded-xl bg-white p-4 shadow-lg sm:-right-20 sm:top-10 sm:w-60 sm:p-5">
                <p className="mb-2 font-mulish text-sm font-bold leading-snug text-[#101b25] sm:text-base">
                  Perfect stay in Sylhet with excellent rooms and service.
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
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
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-1 font-mulish text-xs font-semibold text-[#101b25] sm:text-sm">
                  Guest Review
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
