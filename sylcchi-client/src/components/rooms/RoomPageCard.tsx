import WishlistButton from "@/components/rooms/WishlistButton";
import type { PrimaryRoom } from "@/lib/types/rooms";
import { BedDouble, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type RoomPageCardProps = {
  room: PrimaryRoom;
};

export default function RoomPageCard({ room }: RoomPageCardProps) {
  const nightlyPrice = Number.parseFloat(room.price) || 0;
  const weeklyPrice = Math.round(nightlyPrice * 7);
  const primaryImage = room.images[0]?.imageUrl ?? "/Gallery/room-1.webp";
  const roomDetailsHref = `/rooms/${room.slug}`;

  return (
    <article className="group relative overflow-hidden rounded-md bg-white shadow-[0px_0px_30px_0px_rgba(47,76,88,0.06)] transition-shadow hover:shadow-[0px_10px_35px_0px_rgba(47,76,88,0.14)]">
      <Link
        href={roomDetailsHref}
        aria-label={`View details for ${room.name}`}
        className="absolute inset-0 z-10 rounded-md"
      />

      <div className="flex flex-col md:flex-row">
        <div className="relative h-52 w-full  md:w-72 lg:w-80">
          <Image
            src={primaryImage}
            alt={room.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 320px"
          />
          <WishlistButton
            roomId={room.id}
            className="absolute top-3 right-3 z-20 shadow-sm"
          />
        </div>

        <div className="relative z-20 flex flex-1 flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-mulish text-2xl font-extrabold leading-tight text-[#101b25]">
              {room.name}
            </h3>
            <p className="mt-4.5 max-w-xl font-open-sans text-sm leading-6 text-[#5b6774]">
              {room.description}
            </p>

            <div className="mt-6.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#617080]">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-4 w-4" /> {room.capacity} Sleeps
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BedDouble className="h-4 w-4" /> 1 {room.bedType.toLowerCase()}{" "}
                bed
              </span>
            </div>
          </div>

          <div className="flex min-w-44 flex-col items-start gap-7 lg:items-end">
            <div className="text-left lg:text-right space-y-7">
              <p className="font-mulish text-4xl font-extrabold text-[#101b25]">
                ${Math.round(nightlyPrice)}
                <span className="ml-1 font-open-sans text-base font-normal text-[#707884]">
                  / 1 night
                </span>
              </p>
              <p className="mt-1 font-mulish text-xl font-extrabold text-[#101b25]">
                ${weeklyPrice}
                <span className="ml-1 font-open-sans text-sm font-normal text-[#707884]">
                  / 7 nights
                </span>
              </p>
            </div>

            <Link
              href={roomDetailsHref}
              className="rounded-md bg-primary px-5 py-2.5 font-mulish text-sm font-semibold text-white transition-colors hover:bg-[#1f4f79]"
            >
              Book now
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
