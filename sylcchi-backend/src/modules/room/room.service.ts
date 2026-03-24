import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

type CreateRoomPayload = {
  name: string;
  description?: string;
  price: number;
  capacity: number;
  roomTypeId: string;
  isAvailable?: boolean;
};

export const RoomService = {
  createRoom: async (payload: CreateRoomPayload) => {
    const roomType = await prisma.roomType.findUnique({
      where: { id: payload.roomTypeId },
      select: { id: true },
    });

    if (!roomType) {
      throw new AppError("Room type not found", status.NOT_FOUND);
    }

    return prisma.room.create({
      data: {
        name: payload.name,
        description: payload.description,
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
};
