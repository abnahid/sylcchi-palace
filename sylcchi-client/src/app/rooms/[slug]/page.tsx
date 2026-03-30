import RoomDetailClient from "@/components/rooms/RoomDetailClient";
import { getRoomBySlug, getRooms } from "@/lib/api/rooms";
import {
  mapApiRoomToPrimaryRoom,
  mapApiRoomsToPrimaryRooms,
} from "@/lib/mappers/rooms";
import { roomSchema, roomsResponseSchema } from "@/lib/schemas/room";
import type { PrimaryRoom } from "@/lib/types/rooms";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 60;

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

const tryParseSingleRoom = (raw: unknown) => {
  const candidates = [
    raw,
    (raw as { data?: unknown } | null)?.data,
    (raw as { data?: { data?: unknown } } | null)?.data?.data,
  ];

  for (const candidate of candidates) {
    const parsed = roomSchema.safeParse(candidate);
    if (parsed.success) {
      return parsed.data;
    }
  }

  return null;
};

const getSingleRoom = async (value: string): Promise<PrimaryRoom | null> => {
  try {
    const raw = await getRoomBySlug(value);
    const parsed = tryParseSingleRoom(raw);

    if (!parsed) return null;
    return mapApiRoomToPrimaryRoom(parsed);
  } catch {
    return null;
  }
};

const findRoomBySlugOrId = (rooms: PrimaryRoom[], value: string) => {
  return rooms.find((item) => item.slug === value || item.id === value);
};

export async function generateStaticParams() {
  const sourceRooms = await getSourceRooms();
  return sourceRooms.map((room) => ({ slug: room.slug }));
}

export async function generateMetadata({
  params,
}: RoomDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const identifier = decodeURIComponent(slug);

  const room =
    (await getSingleRoom(identifier)) ??
    findRoomBySlugOrId(await getSourceRooms(), identifier);

  if (!room) {
    return { title: "Room Not Found" };
  }

  return {
    title: `${room.name} — Room Details`,
    description: `Book the ${room.name} at Sylcchi Palace, Sylhet. ${room.description.slice(0, 140)}`,
    alternates: { canonical: `/rooms/${room.slug}` },
    openGraph: {
      title: `${room.name} | Sylcchi Palace`,
      description: room.description.slice(0, 160),
      images: room.images[0]
        ? [{ url: room.images[0].imageUrl, alt: room.name }]
        : undefined,
    },
  };
}

export default async function Page({ params }: RoomDetailPageProps) {
  const { slug } = await params;
  const identifier = decodeURIComponent(slug);
  const sourceRooms = await getSourceRooms();

  const room =
    (await getSingleRoom(identifier)) ??
    findRoomBySlugOrId(sourceRooms, identifier);

  if (!room) {
    notFound();
  }

  const otherRooms = sourceRooms.filter((item) => item.slug !== room.slug);

  return <RoomDetailClient room={room} otherRooms={otherRooms} />;
}
