"use client";

import RoomCard, { type RoomCardData } from "@/components/home/RoomCard";
import { useRooms } from "@/hooks/useRooms";
import Link from "next/link";
import { useMemo } from "react";

const RoomsSection = () => {
  const { data: rooms = [] } = useRooms();

  const roomsDictionary: Array<RoomCardData & { slug: string }> = useMemo(
    () =>
      rooms.slice(0, 3).map((room) => ({
        id: room.id,
        slug: room.slug,
        name: room.name,
        image: room.images[0]?.imageUrl ?? "/Gallery/room-1.webp",
        sleeps: room.capacity,
        bedLabel: `${room.bedType} bed`,
        price: Number.parseFloat(room.price),
      })),
    [rooms],
  );

  return (
    <section className="bg-[#f7fafd] dark:bg-[#0a1622] py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-mulish text-3xl font-extrabold text-[#101b25] dark:text-white sm:text-4xl">
            Our rooms & suites
          </h2>

          <Link
            href="/rooms"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-6 py-3 font-mulish text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View rooms
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roomsDictionary.map((card) => (
            <Link href={`/rooms/${card.slug}`} key={card.id} className="block">
              <RoomCard room={card} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoomsSection;
