import { Request, Response } from "express";
import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { RoomService } from "./room.service";

function asBodyObject(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") {
    throw new AppError("Request body is required", status.BAD_REQUEST);
  }

  return body as Record<string, unknown>;
}

function getRequiredString(obj: Record<string, unknown>, key: string): string {
  const value = obj[key];

  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(`${key} is required`, status.BAD_REQUEST);
  }

  return value.trim();
}

function getRequiredPositiveNumber(
  obj: Record<string, unknown>,
  key: string,
): number {
  const value = obj[key];

  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    throw new AppError(`${key} must be a positive number`, status.BAD_REQUEST);
  }

  return value;
}

function getRequiredPositiveInt(
  obj: Record<string, unknown>,
  key: string,
): number {
  const value = obj[key];

  if (
    typeof value !== "number" ||
    Number.isNaN(value) ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new AppError(`${key} must be a positive integer`, status.BAD_REQUEST);
  }

  return value;
}

export const RoomController = {
  createRoom: async (req: Request, res: Response) => {
    const body = asBodyObject(req.body);

    const name = getRequiredString(body, "name");
    const roomTypeId = getRequiredString(body, "roomTypeId");
    const price = getRequiredPositiveNumber(body, "price");
    const capacity = getRequiredPositiveInt(body, "capacity");

    const description =
      typeof body.description === "string" && body.description.trim() !== ""
        ? body.description.trim()
        : undefined;

    const isAvailable =
      typeof body.isAvailable === "boolean" ? body.isAvailable : undefined;

    const result = await RoomService.createRoom({
      name,
      roomTypeId,
      price,
      capacity,
      description,
      isAvailable,
    });

    res.status(status.CREATED).json({
      success: true,
      message: "Room created successfully",
      data: result,
    });
  },
};
