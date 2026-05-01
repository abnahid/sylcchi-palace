"use client";

import type { PrimaryRoom } from "@/lib/types/rooms";
import { BedDouble, Check, ShieldCheck, Users } from "lucide-react";

type RoomInfoSectionProps = {
  room: PrimaryRoom;
};

const RoomInfoSection = ({ room }: RoomInfoSectionProps) => {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#5b6774] dark:text-[#9aa5b0]">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-4 w-4 text-primary" /> {room.capacity} Sleeps
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-primary" /> 1 full bed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BedDouble className="h-4 w-4 text-primary" /> 1{" "}
          {room.bedType.toLowerCase()} bed
        </span>
      </div>

      <p className="mt-5 font-open-sans text-base leading-relaxed text-[#5b6774] dark:text-[#9aa5b0]">
        {room.description}
      </p>
      <p className="mt-4 font-open-sans text-base leading-relaxed text-[#5b6774] dark:text-[#9aa5b0]">
        Parturient montes nascetur ridiculus mus mauris vitae. Et netus et
        malesuada fames ac turpis egestas. Enim lobortis scelerisque fermentum
        dui faucibus in ornare quam viverra orci.
      </p>

      <h2 className="mt-10 font-mulish text-3xl font-extrabold text-[#101b25] dark:text-white">
        Room facilities
      </h2>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {room.facilities.map((facility) => (
          <div
            key={facility}
            className="flex items-center gap-2.5 text-[#5b6774] dark:text-[#9aa5b0]"
          >
            <Check className="h-4 w-4 text-primary" />
            <span className="font-open-sans text-sm">{facility}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-mulish text-3xl font-extrabold text-[#101b25] dark:text-white">
        Hostel rules
      </h2>
      <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {room.rules.map((rule) => (
          <div key={rule} className="flex items-start gap-2.5">
            <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
            <p className="font-open-sans text-sm leading-relaxed text-[#5b6774] dark:text-[#9aa5b0]">
              {rule}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomInfoSection;
