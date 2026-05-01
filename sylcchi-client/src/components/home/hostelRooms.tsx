"use client";

import RoomCard, { type RoomCardData } from "@/components/home/RoomCard";
import { homeRoomCards } from "@/data/rooms";
import Link from "next/link";

// button rounded-md bg-secondary px-6 py-3 font-mulish font-bold text-primary transition-colors hover:bg-secondary/90

export default function HostelRooms() {
  const roomCards: Array<RoomCardData & { slug: string }> = homeRoomCards;

  return (
    <section className="py-12 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 className="font-mulish text-2xl font-extrabold text-[#101b25] dark:text-[#e8edf2] sm:text-3xl lg:text-4xl">
            Sylcchi Palace rooms
          </h2>
          <Link
            href="/rooms"
            className="rounded-md bg-secondary px-6 py-3 font-mulish font-bold text-primary transition-colors hover:bg-secondary/90"
          >
            View all rooms
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:auto-rows-fr">
          {roomCards.map((room) => (
            <Link
              href={`/rooms/${room.slug}`}
              key={room.id}
              className="block h-full"
            >
              <RoomCard room={room} />
            </Link>
          ))}

          {/* Stay Longer Save More CTA */}
          <div className="flex h-full min-h-95 flex-col justify-between rounded-md bg-primary p-8 text-primary-foreground">
            <div>
              <h3 className="mb-3 font-mulish text-3xl font-extrabold leading-tight sm:text-4xl">
                Stay Longer, Save More
              </h3>
              <p className="mb-7 max-w-70 font-open-sans text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
                It&apos;s simple: the longer you stay, the more you save!
              </p>

              <div className="border-l border-primary-foreground/80 pl-4">
                <p className="font-open-sans text-sm leading-6 text-primary-foreground/90 sm:text-base">
                  Save up to <span className="font-bold">20%</span> off the
                  nightly rate on stays between 7-14 nights
                </p>
                <p className="mt-4 font-open-sans text-sm leading-6 text-primary-foreground/90 sm:text-base">
                  Save up to <span className="font-bold">30%</span> off the
                  nightly rate on stays between 14-29 nights
                </p>
              </div>
            </div>

            <Link
              href="/rooms"
              className="mt-7 inline-flex w-fit rounded-md bg-secondary px-6 py-3 font-mulish font-bold text-primary transition-colors hover:bg-secondary/90"
            >
              Choose room
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
