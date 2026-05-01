"use client";

import RoomCard from "@/components/home/RoomCard";
import Link from "next/link";

type RelatedRoomCard = {
  id: string;
  slug: string;
  name: string;
  image: string;
  sleeps: number;
  bedLabel: string;
  price: number;
};

type RoomOtherRoomsSectionProps = {
  roomCards: RelatedRoomCard[];
};

const RoomOtherRoomsSection = ({ roomCards }: RoomOtherRoomsSectionProps) => {
  return (
    <section className="bg-[#f7fafd] dark:bg-[#0a1622] py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-mulish text-3xl font-extrabold text-[#101b25] dark:text-white sm:text-4xl">
            Other rooms
          </h2>
          <Link
            href="/rooms"
            className="font-mulish text-sm font-bold text-primary hover:underline"
          >
            View all rooms
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roomCards.map((card) => (
            <Link href={`/rooms/${card.slug}`} key={card.id} className="block">
              <RoomCard room={card} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoomOtherRoomsSection;
