"use client";

import { bookingSteps } from "@/components/rooms/sections/room-detail-data";
import Image from "next/image";

type RoomBookingStepsSectionProps = {
  imageSrc: string;
  onImageError: () => void;
};

const RoomBookingStepsSection = ({
  imageSrc,
  onImageError,
}: RoomBookingStepsSectionProps) => {
  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="mb-8 font-mulish text-3xl font-extrabold text-[#101b25] sm:text-4xl">
              Stages of booking a room
            </h2>

            <div className="space-y-6">
              {bookingSteps.map((step) => (
                <div key={step.num} className="flex gap-4 sm:gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-primary">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="font-mulish text-lg font-bold text-[#101b25]">
                      {step.title}
                    </h4>
                    <p className="mt-2 font-open-sans text-sm leading-relaxed text-[#5b6774] sm:text-[15px]">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl">
            <div className="relative h-80 sm:h-105">
              <Image
                src={imageSrc}
                alt="Booking stages"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                onError={onImageError}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoomBookingStepsSection;
