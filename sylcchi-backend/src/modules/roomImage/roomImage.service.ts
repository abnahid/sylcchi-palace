import status from "http-status";
import {
  deleteFileFromCloudinary,
  uploadBufferToCloudinary,
} from "../../config/cloudinary.config";
import { buildUniqueFileName } from "../../config/multer.config";
import { AppError } from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

const MAX_IMAGES_PER_ROOM = 3;

type UploadableImageFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

async function ensureRoomExists(roomId: string): Promise<void> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { id: true },
  });

  if (!room) {
    throw new AppError("Room not found", status.NOT_FOUND);
  }
}

async function ensureImageLimitNotExceeded(
  roomId: string,
  incomingCount: number,
): Promise<void> {
  const currentCount = await prisma.roomImage.count({
    where: { roomId },
  });

  if (currentCount + incomingCount > MAX_IMAGES_PER_ROOM) {
    throw new AppError(
      `Each room can have at most ${MAX_IMAGES_PER_ROOM} images`,
      status.BAD_REQUEST,
    );
  }
}

export const RoomImageService = {
  listRoomImages: async (roomId: string) => {
    await ensureRoomExists(roomId);

    return prisma.roomImage.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
    });
  },

  addRoomImageUrls: async (roomId: string, imageUrls: string[]) => {
    await ensureRoomExists(roomId);

    const normalizedUrls = imageUrls
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (normalizedUrls.length === 0) {
      throw new AppError(
        "At least one image URL is required",
        status.BAD_REQUEST,
      );
    }

    await ensureImageLimitNotExceeded(roomId, normalizedUrls.length);

    const created = await prisma.$transaction(async (tx) => {
      const currentCount = await tx.roomImage.count({
        where: { roomId },
      });

      if (currentCount + normalizedUrls.length > MAX_IMAGES_PER_ROOM) {
        throw new AppError(
          `Each room can have at most ${MAX_IMAGES_PER_ROOM} images`,
          status.BAD_REQUEST,
        );
      }

      return Promise.all(
        normalizedUrls.map((imageUrl) =>
          tx.roomImage.create({
            data: {
              roomId,
              imageUrl,
            },
          }),
        ),
      );
    });

    return created;
  },

  uploadRoomImages: async (roomId: string, files: UploadableImageFile[]) => {
    await ensureRoomExists(roomId);

    if (files.length === 0) {
      throw new AppError(
        "At least one image file is required",
        status.BAD_REQUEST,
      );
    }

    await ensureImageLimitNotExceeded(roomId, files.length);

    const uploaded = await Promise.all(
      files.map((file) =>
        uploadBufferToCloudinary(file.buffer, {
          folder: `sylcchi/rooms/${roomId}`,
          filename: buildUniqueFileName(file.originalname),
          resourceType: "image",
          optimizeImage: true,
        }),
      ),
    );

    try {
      const created = await prisma.$transaction(async (tx) => {
        const currentCount = await tx.roomImage.count({
          where: { roomId },
        });

        if (currentCount + uploaded.length > MAX_IMAGES_PER_ROOM) {
          throw new AppError(
            `Each room can have at most ${MAX_IMAGES_PER_ROOM} images`,
            status.BAD_REQUEST,
          );
        }

        return Promise.all(
          uploaded.map((item) =>
            tx.roomImage.create({
              data: {
                roomId,
                imageUrl: item.secureUrl,
              },
            }),
          ),
        );
      });

      return created;
    } catch (error) {
      await Promise.allSettled(
        uploaded.map((item) => deleteFileFromCloudinary(item.secureUrl)),
      );

      throw error;
    }
  },

  updateRoomImageUrl: async (
    roomId: string,
    imageId: string,
    imageUrl: string,
  ) => {
    await ensureRoomExists(roomId);

    const normalizedUrl = imageUrl.trim();

    if (normalizedUrl.length === 0) {
      throw new AppError("imageUrl is required", status.BAD_REQUEST);
    }

    const existing = await prisma.roomImage.findFirst({
      where: {
        id: imageId,
        roomId,
      },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError("Room image not found", status.NOT_FOUND);
    }

    return prisma.roomImage.update({
      where: { id: imageId },
      data: { imageUrl: normalizedUrl },
    });
  },

  deleteRoomImage: async (roomId: string, imageId: string) => {
    const roomImage = await prisma.roomImage.findFirst({
      where: {
        id: imageId,
        roomId,
      },
    });

    if (!roomImage) {
      throw new AppError("Room image not found", status.NOT_FOUND);
    }

    await prisma.roomImage.delete({
      where: { id: imageId },
    });

    await deleteFileFromCloudinary(roomImage.imageUrl);

    return null;
  },
};
