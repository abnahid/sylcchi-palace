import { BedDouble, UserRound } from "lucide-react";
import Image from "next/image";
import { BsArrowRight } from "react-icons/bs";

export type RoomCardData = {
  id: string;
  name: string;
  image: string;
  sleeps: number;
  bedLabel: string;
  price: number;
};

type RoomCardProps = {
  room: RoomCardData;
};

export default function RoomCard({ room }: RoomCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md bg-card shadow-[0px_2px_22px_0px_rgba(47,76,88,0.08)] ring-1 ring-black/5 transition-shadow hover:shadow-md">
      <div className="relative h-70 w-full">
        <Image
          src={room.image}
          alt={room.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />

        <div className="absolute right-0 bottom-10 rounded-l-md bg-white px-3.5 py-2.5 text-sm shadow-sm">
          <span className="font-mulish text-[22px] font-extrabold text-foreground">
            ${room.price}
          </span>
          <span className="ml-1  text-[#707884]">/ 1 night</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-3 font-mulish text-[22px] leading-tight font-extrabold text-foreground">
          {room.name}
        </h3>

        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2  text-[#4e5a69]">
          <span className="flex items-center gap-1">
            <UserRound size={14} /> {room.sleeps} Sleeps
          </span>
          <span className="flex items-center gap-1">
            <BedDouble size={14} /> {room.bedLabel}
          </span>
        </div>

        <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          See availability <BsArrowRight size={14} />
        </span>
      </div>
    </article>
  );
}
