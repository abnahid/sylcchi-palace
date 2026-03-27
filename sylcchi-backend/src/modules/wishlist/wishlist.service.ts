import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

export const WishlistService = {
  addToWishlist: async (params: { userId: string; roomId: string }) => {
    const room = await prisma.room.findUnique({
      where: { id: params.roomId },
      select: { id: true },
    });

    if (!room) {
      throw new AppError("Room not found", status.NOT_FOUND);
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_roomId: {
          userId: params.userId,
          roomId: params.roomId,
        },
      },
      select: { id: true },
    });

    if (existing) {
      return {
        action: "already_exists" as const,
        wishlist: existing,
      };
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        userId: params.userId,
        roomId: params.roomId,
      },
      select: {
        id: true,
        userId: true,
        roomId: true,
        createdAt: true,
      },
    });

    return {
      action: "created" as const,
      wishlist,
    };
  },

  listMyWishlist: async (userId: string) => {
    return prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        roomId: true,
        createdAt: true,
        room: {
          select: {
            id: true,
            name: true,
            slug: true,
            bedType: true,
            capacity: true,
            price: true,
            isAvailable: true,
            roomType: {
              select: {
                id: true,
                name: true,
              },
            },
            images: {
              select: {
                id: true,
                imageUrl: true,
              },
              take: 1,
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });
  },

  removeFromWishlist: async (params: { userId: string; roomId: string }) => {
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_roomId: {
          userId: params.userId,
          roomId: params.roomId,
        },
      },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError("Wishlist item not found", status.NOT_FOUND);
    }

    await prisma.wishlist.delete({
      where: {
        userId_roomId: {
          userId: params.userId,
          roomId: params.roomId,
        },
      },
    });

    return null;
  },
};
