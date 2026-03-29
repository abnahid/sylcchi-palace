import status from "http-status";
import { BookingStatus, Prisma } from "../../../generated/prisma";
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
  bedType?: BedType;
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
  bedType?: BedType;
  roomTypeId?: string;
  isAvailable?: boolean;
};

type ListRoomsFilters = {
  isAvailable?: boolean;
  roomTypeId?: string;
  search?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  guests?: number;
  page: number;
  limit: number;
  priceSort?: "asc" | "desc";
};

type BedType = "King" | "Queen" | "Twin" | "Bunk";

function getBedTypeByCapacity(capacity: number): BedType {
  if (capacity <= 1) {
    return "Twin";
  }

  if (capacity === 2) {
    return "King";
  }

  if (capacity === 3) {
    return "Queen";
  }

  return "Bunk";
}

function withBedType<T extends { capacity: number; bedType: string | null }>(
  room: T,
): T & { bedType: BedType } {
  const stored = room.bedType;

  if (
    stored === "King" ||
    stored === "Queen" ||
    stored === "Twin" ||
    stored === "Bunk"
  ) {
    return {
      ...room,
      bedType: stored,
    };
  }

  return {
    ...room,
    bedType: getBedTypeByCapacity(room.capacity),
  };
}

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

  listRooms: async (filters: ListRoomsFilters) => {
    const skip = (filters.page - 1) * filters.limit;

    const where: Prisma.RoomWhereInput = {
      ...(typeof filters.isAvailable === "boolean"
        ? { isAvailable: filters.isAvailable }
        : {}),
      ...(filters.roomTypeId ? { roomTypeId: filters.roomTypeId } : {}),
      ...(typeof filters.guests === "number"
        ? { capacity: { gte: filters.guests } }
        : {}),
      ...(filters.search
        ? {
            OR: [
              {
                name: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
              {
                bedType: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
              {
                roomType: {
                  name: {
                    contains: filters.search,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {}),
      ...(filters.checkInDate && filters.checkOutDate
        ? {
            NOT: {
              reservations: {
                some: {
                  bookingStatus: {
                    in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
                  },
                  checkInDate: {
                    lt: filters.checkOutDate,
                  },
                  checkOutDate: {
                    gt: filters.checkInDate,
                  },
                },
              },
            },
          }
        : {}),
    };

    const orderBy: Prisma.RoomOrderByWithRelationInput = filters.priceSort
      ? { price: filters.priceSort }
      : { createdAt: "desc" };

    const [total, rooms] = await prisma.$transaction([
      prisma.room.count({ where }),
      prisma.room.findMany({
        where,
        include: {
          roomType: true,
          images: true,
        },
        orderBy,
        skip,
        take: filters.limit,
      }),
    ]);

    return {
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.max(1, Math.ceil(total / filters.limit)),
      },
      data: rooms.map((room) => withBedType(room)),
    };
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

    return withBedType(room);
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

    const room = await prisma.room.create({
      data: {
        name: payload.name,
        slug: uniqueSlug,
        description: payload.description,
        facilities: payload.facilities ?? [],
        rules: payload.rules ?? [],
        price: payload.price,
        capacity: payload.capacity,
        bedType: payload.bedType ?? getBedTypeByCapacity(payload.capacity),
        roomTypeId: payload.roomTypeId,
        isAvailable: payload.isAvailable ?? true,
      },
      include: {
        roomType: true,
        images: true,
      },
    });

    return withBedType(room);
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

    const resolvedBedType =
      updateData.bedType ??
      (typeof updateData.capacity === "number"
        ? getBedTypeByCapacity(updateData.capacity)
        : undefined);

    const room = await prisma.room.update({
      where: { id: roomId },
      data: {
        ...updateData,
        ...(resolvedBedType ? { bedType: resolvedBedType } : {}),
        ...(uniqueSlug ? { slug: uniqueSlug } : {}),
      },
      include: {
        roomType: true,
        images: true,
      },
    });

    return withBedType(room);
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

  getBookedDates: async (roomId: string) => {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true },
    });

    if (!room) {
      throw new AppError("Room not found", status.NOT_FOUND);
    }

    const now = new Date();
    const reservations = await prisma.reservation.findMany({
      where: {
        roomId,
        bookingStatus: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
        checkOutDate: { gt: now },
      },
      select: {
        checkInDate: true,
        checkOutDate: true,
        bookingStatus: true,
      },
      orderBy: { checkInDate: "asc" },
    });

    return reservations.map((r) => ({
      checkInDate: r.checkInDate.toISOString().split("T")[0],
      checkOutDate: r.checkOutDate.toISOString().split("T")[0],
      status: r.bookingStatus,
    }));
  },
};
