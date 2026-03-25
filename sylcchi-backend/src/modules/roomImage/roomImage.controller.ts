import { Request, Response } from "express";
import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { RoomImageService } from "./roomImage.service";

type UploadableImageFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
};

function getRequiredParam(value: string | undefined, label: string): string {
  if (!value || value.trim() === "") {
    throw new AppError(`${label} is required`, status.BAD_REQUEST);
  }

  return value.trim();
}

function asBodyObject(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") {
    throw new AppError("Request body is required", status.BAD_REQUEST);
  }

  return body as Record<string, unknown>;
}

function getImageUrlsFromBody(body: Record<string, unknown>): string[] {
  const value = body.imageUrls;

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  if (Array.isArray(value)) {
    const urls = value.map((item) => {
      if (typeof item !== "string") {
        throw new AppError(
          "imageUrls must contain only strings",
          status.BAD_REQUEST,
        );
      }

      return item.trim();
    });

    return urls.filter((item) => item.length > 0);
  }

  throw new AppError(
    "imageUrls must be a comma-separated string or string array",
    status.BAD_REQUEST,
  );
}

export const RoomImageController = {
  listRoomImages: async (req: Request, res: Response) => {
    const roomId = getRequiredParam(req.params.roomId, "Room id");
    const result = await RoomImageService.listRoomImages(roomId);

    res.status(status.OK).json({
      success: true,
      message: "Room images retrieved successfully",
      data: result,
    });
  },

  addRoomImageUrls: async (req: Request, res: Response) => {
    const roomId = getRequiredParam(req.params.roomId, "Room id");
    const body = asBodyObject(req.body);
    const imageUrls = getImageUrlsFromBody(body);

    const result = await RoomImageService.addRoomImageUrls(roomId, imageUrls);

    res.status(status.CREATED).json({
      success: true,
      message: "Room image URLs added successfully",
      data: result,
    });
  },

  uploadRoomImages: async (req: Request, res: Response) => {
    const roomId = getRequiredParam(req.params.roomId, "Room id");

    const files = (
      (req.files as UploadableImageFile[] | undefined) ?? []
    ).filter(
      (file) =>
        file &&
        Buffer.isBuffer(file.buffer) &&
        typeof file.mimetype === "string" &&
        typeof file.originalname === "string",
    );

    const result = await RoomImageService.uploadRoomImages(roomId, files);

    res.status(status.CREATED).json({
      success: true,
      message: "Room images uploaded successfully",
      data: result,
    });
  },

  updateRoomImageUrl: async (req: Request, res: Response) => {
    const roomId = getRequiredParam(req.params.roomId, "Room id");
    const imageId = getRequiredParam(req.params.imageId, "Image id");
    const body = asBodyObject(req.body);
    const imageUrl = body.imageUrl;

    if (typeof imageUrl !== "string" || imageUrl.trim() === "") {
      throw new AppError("imageUrl is required", status.BAD_REQUEST);
    }

    const result = await RoomImageService.updateRoomImageUrl(
      roomId,
      imageId,
      imageUrl,
    );

    res.status(status.OK).json({
      success: true,
      message: "Room image URL updated successfully",
      data: result,
    });
  },

  deleteRoomImage: async (req: Request, res: Response) => {
    const roomId = getRequiredParam(req.params.roomId, "Room id");
    const imageId = getRequiredParam(req.params.imageId, "Image id");

    await RoomImageService.deleteRoomImage(roomId, imageId);

    res.status(status.OK).json({
      success: true,
      message: "Room image deleted successfully",
    });
  },
};
