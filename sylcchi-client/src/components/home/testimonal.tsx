"use client";

import type { Testimonial } from "@/lib/schemas/testimonial";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const fallbackTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Betty Randal",
    rating: 5,
    title: "Very cozy room close to everything",
    review:
      "Consequat interdum varius sit amet mattis vulputate enim nulla. Posuere morbi leo urna molestie at elementum eu facilisis sed. Diam phasellus vestibulum lorem sed risus ultricies tristique.",
    dateOfStay: "July 2021",
  },
  {
    id: "2",
    name: "John Smith",
    rating: 5,
    title: "Amazing experience and great staff",
    review:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation.",
    dateOfStay: "August 2022",
  },
  {
    id: "3",
    name: "Sarah Johnson",
    rating: 4,
    title: "Perfect location for exploring the city",
    review:
      "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam feugiat vitae ultricies eget tempor sit amet ante.",
    dateOfStay: "March 2023",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function Testimonial() {
  const [current, setCurrent] = useState(0);
  const items = fallbackTestimonials;

  const prev = () => setCurrent((c) => (c === 0 ? items.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === items.length - 1 ? 0 : c + 1));

  const active = items[current];

  return (
    <section className="py-12 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
          {/* Image */}
          <div className="w-full shrink-0 lg:w-[45%]">
            <div className="overflow-hidden rounded-xl">
              <Image
                src="/assets/homa-hero.webp"
                alt="Sylcchi Palace"
                width={600}
                height={500}
                className="h-87.5 w-full object-cover lg:h-112.5"
              />
            </div>
          </div>

          {/* Content */}
          <div className="w-full">
            <h2 className="mb-8 font-mulish text-2xl font-extrabold text-[#101b25] sm:text-3xl lg:text-4xl">
              What our guests say
            </h2>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <StarRating rating={active.rating} />

              <p className="mt-4 font-open-sans text-sm text-gray-500">
                <span className="font-semibold text-gray-800">
                  Date of stay:{" "}
                </span>
                {active.dateOfStay}
              </p>

              <h3 className="mt-3 font-mulish text-lg font-bold text-[#101b25]">
                {active.title}
              </h3>

              <p className="mt-2 font-open-sans text-sm leading-relaxed text-gray-500">
                {active.review}
              </p>

              <p className="mt-5 font-open-sans text-sm italic text-gray-600">
                {active.name}
              </p>
            </div>

            {/* Slider controls */}
            <div className="mt-6 flex gap-2">
              <button
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-md bg-[#101b25] text-white transition-colors hover:bg-[#101b25]/90"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
