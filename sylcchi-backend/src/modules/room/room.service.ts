import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

type CreateRoomPayload = {
  name: string;
  slug?: string;
  description?: string;
  facilities?: string[];
  rules?: string[];
  price: number;
  capacity: number;
  roomTypeId: string;
  isAvailable?: boolean;
};

type UpdateRoomPayload = {
  name?: string;
  slug?: string;
  description?: string;
  facilities?: string[];
  rules?: string[];
  price?: number;
  capacity?: number;
  roomTypeId?: string;
  isAvailable?: boolean;
};

function toSlug(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "room";
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function getUniqueRoomSlug(
  base: string,
  excludeRoomId?: string,
): Promise<string> {
  let candidate = base;
  let suffix = 2;

  // Keep suffixing until slug becomes unique.
  while (true) {
    const existing = await prisma.room.findFirst({
      where: {
        slug: candidate,
        ...(excludeRoomId ? { NOT: { id: excludeRoomId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export const RoomService = {
  listRoomTypes: async () => {
    return prisma.roomType.findMany({
      orderBy: {
        name: "asc",
      },
    });
  },

  createRoomType: async (name: string) => {
    const existing = await prisma.roomType.findUnique({
      where: { name },
      select: { id: true },
    });

    if (existing) {
      throw new AppError("Room type already exists", status.CONFLICT);
    }

    return prisma.roomType.create({
      data: { name },
    });
  },

  listRooms: async (filters: {
    isAvailable?: boolean;
    roomTypeId?: string;
  }) => {
    return prisma.room.findMany({
      where: {
        ...(typeof filters.isAvailable === "boolean"
          ? { isAvailable: filters.isAvailable }
          : {}),
        ...(filters.roomTypeId ? { roomTypeId: filters.roomTypeId } : {}),
      },
      include: {
        roomType: true,
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  getSingleRoom: async (slug: string) => {
    let room = await prisma.room.findUnique({
      where: { slug },
      include: {
        roomType: true,
        images: true,
      },
    });

    // Backward compatibility for existing UUID-based room URLs.
    if (!room && isUuid(slug)) {
      room = await prisma.room.findUnique({
        where: { id: slug },
        include: {
          roomType: true,
          images: true,
        },
      });
    }

    if (!room) {
      throw new AppError("Room not found", status.NOT_FOUND);
    }

    return room;
  },

  createRoom: async (payload: CreateRoomPayload) => {
    const roomType = await prisma.roomType.findUnique({
      where: { id: payload.roomTypeId },
      select: { id: true },
    });

    if (!roomType) {
      throw new AppError("Room type not found", status.NOT_FOUND);
    }

    const baseSlug = toSlug(payload.slug ?? payload.name);
    const uniqueSlug = await getUniqueRoomSlug(baseSlug);

    return prisma.room.create({
      data: {
        name: payload.name,
        slug: uniqueSlug,
        description: payload.description,
        facilities: payload.facilities ?? [],
        rules: payload.rules ?? [],
        price: payload.price,
        capacity: payload.capacity,
        roomTypeId: payload.roomTypeId,
        isAvailable: payload.isAvailable ?? true,
      },
      include: {
        roomType: true,
        images: true,
      },
    });
  },

  updateRoom: async (roomId: string, payload: UpdateRoomPayload) => {
    const existingRoom = await prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true },
    });

    if (!existingRoom) {
      throw new AppError("Room not found", status.NOT_FOUND);
    }

    if (payload.roomTypeId) {
      const roomType = await prisma.roomType.findUnique({
        where: { id: payload.roomTypeId },
        select: { id: true },
      });

      if (!roomType) {
        throw new AppError("Room type not found", status.NOT_FOUND);
      }
    }

    const { slug, ...updateData } = payload;

    const uniqueSlug =
      typeof slug === "string" && slug.trim() !== ""
        ? await getUniqueRoomSlug(toSlug(slug), roomId)
        : undefined;

    return prisma.room.update({
      where: { id: roomId },
      data: {
        ...updateData,
        ...(uniqueSlug ? { slug: uniqueSlug } : {}),
      },
      include: {
        roomType: true,
        images: true,
      },
    });
  },

  deleteRoom: async (roomId: string) => {
    const existingRoom = await prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true },
    });

    if (!existingRoom) {
      throw new AppError("Room not found", status.NOT_FOUND);
    }

    await prisma.room.delete({
      where: { id: roomId },
    });

    return null;
  },
};
