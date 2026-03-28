import RoomDetailClient from "@/components/rooms/RoomDetailClient";
import { getRooms } from "@/lib/api/rooms";
import { mapApiRoomsToPrimaryRooms } from "@/lib/mappers/rooms";
import { roomsResponseSchema } from "@/lib/schemas/room";
import type { PrimaryRoom } from "@/lib/types/rooms";
import { notFound } from "next/navigation";

type RoomDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const fallbackRooms: PrimaryRoom[] = [
  {
    id: "fallback-1",
    name: "Deluxe King Suite",
    slug: "deluxe-king-suite",
    description:
      "Spacious premium suite featuring a panoramic sea view, private balcony, marble en-suite bathroom, and dedicated seating area.",
    facilities: [
      "King-size bed",
      "Free High-speed WiFi",
      "Minibar",
      "55-inch Smart TV",
      "Room Service",
      "Free Parking",
    ],
    rules: [
      "Check-in from 14:00",
      "Check-out by 11:00",
      "No smoking indoors",
      "Pets not allowed",
      "Government-issued ID required",
    ],
    price: "249.99",
    capacity: 2,
    bedType: "King",
    roomTypeId: "fallback-luxury",
    isAvailable: true,
    createdAt: "2026-03-24T20:39:19.750Z",
    updatedAt: "2026-03-24T20:39:19.750Z",
    roomType: {
      id: "fallback-luxury",
      name: "Luxury",
    },
    images: [
      {
        id: "fallback-image-1",
        roomId: "fallback-1",
        imageUrl: "/Gallery/room-1.webp",
        createdAt: "2026-03-24T20:39:19.750Z",
      },
      {
        id: "fallback-image-2",
        roomId: "fallback-1",
        imageUrl: "/Gallery/room-2.webp",
        createdAt: "2026-03-24T20:39:19.750Z",
      },
      {
        id: "fallback-image-3",
        roomId: "fallback-1",
        imageUrl: "/Gallery/room-3.webp",
        createdAt: "2026-03-24T20:39:19.750Z",
      },
    ],
  },
];

const getSourceRooms = async (): Promise<PrimaryRoom[]> => {
  try {
    const raw = await getRooms();
    const parsed = roomsResponseSchema.safeParse(raw);

    if (parsed.success && parsed.data.length > 0) {
      return mapApiRoomsToPrimaryRooms(parsed.data);
    }
  } catch {
    // Keep fallback data when API is unavailable.
  }

  return fallbackRooms;
};

export async function generateStaticParams() {
  const sourceRooms = await getSourceRooms();
  return sourceRooms.map((room) => ({ slug: room.slug }));
}

export default async function Page({ params }: RoomDetailPageProps) {
  const { slug } = await params;
  const sourceRooms = await getSourceRooms();

  const room = sourceRooms.find((item) => item.slug === slug);

  if (!room) {
    notFound();
  }

  const otherRooms = sourceRooms.filter((item) => item.slug !== room.slug);

  return <RoomDetailClient room={room} otherRooms={otherRooms} />;
}
