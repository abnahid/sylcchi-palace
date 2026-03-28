import type { Room as ApiRoom } from "@/lib/schemas/room";
import type { PrimaryRoom } from "@/lib/types/rooms";

const FALLBACK_IMAGES = [
  "/Gallery/room-1.webp",
  "/Gallery/room-2.webp",
  "/Gallery/room-3.webp",
];

const normalizeImageUrl = (url: string) =>
  url.replace("https://i.ibb.co.com/", "https://i.ibb.co/");

export const mapApiRoomToPrimaryRoom = (room: ApiRoom): PrimaryRoom => {
  const now = new Date().toISOString();

  const sourceImages =
    room.images.length > 0
      ? room.images.slice(0, 3).map((image) => normalizeImageUrl(image))
      : FALLBACK_IMAGES;

  return {
    id: room.id,
    name: room.name,
    slug: room.slug ?? room.id,
    description:
      room.description ??
      "Comfortable room designed for a relaxing stay with modern amenities.",
    facilities: room.facilities,
    rules: room.rules,
    price: String(room.pricePerNight),
    capacity: room.capacity,
    bedType: room.bedType ?? (room.capacity > 1 ? "Double" : "Single"),
    roomTypeId: room.roomType?.id ?? "api-room-type",
    isAvailable: room.isAvailable,
    createdAt: room.createdAt ?? now,
    updatedAt: room.updatedAt ?? now,
    roomType: {
      id: room.roomType?.id ?? "api-room-type",
      name: room.roomType?.name ?? "Standard",
    },
    images: sourceImages.map((imageUrl, index) => ({
      id: `${room.id}-image-${index}`,
      roomId: room.id,
      imageUrl,
      createdAt: now,
    })),
  };
};

export const mapApiRoomsToPrimaryRooms = (rooms: ApiRoom[]) =>
  rooms.map((room) => mapApiRoomToPrimaryRoom(room));
