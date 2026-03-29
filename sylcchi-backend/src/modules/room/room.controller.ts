import { Request, Response } from "express";
import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { RoomService } from "./room.service";

const ALLOWED_BED_TYPES = ["King", "Queen", "Twin", "Bunk"] as const;
const ROOMS_PER_PAGE = 6;

type BedType = (typeof ALLOWED_BED_TYPES)[number];
type PriceSort = "asc" | "desc";

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

function getOptionalString(
  obj: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = obj[key];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError(`${key} must be a string`, status.BAD_REQUEST);
  }

  return value.trim() === "" ? undefined : value.trim();
}

function getOptionalBedType(
  obj: Record<string, unknown>,
  key: string,
): BedType | undefined {
  const value = getOptionalString(obj, key);

  if (!value) {
    return undefined;
  }

  if (!ALLOWED_BED_TYPES.includes(value as BedType)) {
    throw new AppError(
      `${key} must be one of: ${ALLOWED_BED_TYPES.join(", ")}`,
      status.BAD_REQUEST,
    );
  }

  return value as BedType;
}

function getOptionalPositiveNumber(
  obj: Record<string, unknown>,
  key: string,
): number | undefined {
  const value = obj[key];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    throw new AppError(`${key} must be a positive number`, status.BAD_REQUEST);
  }

  return value;
}

function getOptionalPositiveInt(
  obj: Record<string, unknown>,
  key: string,
): number | undefined {
  const value = obj[key];

  if (value === undefined || value === null) {
    return undefined;
  }

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

function getOptionalBoolean(
  obj: Record<string, unknown>,
  key: string,
): boolean | undefined {
  const value = obj[key];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw new AppError(`${key} must be a boolean`, status.BAD_REQUEST);
  }

  return value;
}

function getOptionalStringList(
  obj: Record<string, unknown>,
  key: string,
): string[] | undefined {
  const value = obj[key];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  if (Array.isArray(value)) {
    const list = value.map((item) => {
      if (typeof item !== "string") {
        throw new AppError(
          `${key} must contain only strings`,
          status.BAD_REQUEST,
        );
      }

      return item.trim();
    });

    return list.filter((item) => item.length > 0);
  }

  throw new AppError(
    `${key} must be a comma-separated string or string array`,
    status.BAD_REQUEST,
  );
}

function parseQueryBoolean(value: unknown, key: string): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError(
      `${key} query must be true or false`,
      status.BAD_REQUEST,
    );
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  throw new AppError(`${key} query must be true or false`, status.BAD_REQUEST);
}

function parseQueryPositiveInt(
  value: unknown,
  key: string,
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError(
      `${key} query must be a positive integer`,
      status.BAD_REQUEST,
    );
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(
      `${key} query must be a positive integer`,
      status.BAD_REQUEST,
    );
  }

  return parsed;
}

function parseQueryDate(value: unknown, key: string): Date | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError(`${key} query must be a valid date`, status.BAD_REQUEST);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(`${key} query must be a valid date`, status.BAD_REQUEST);
  }

  return parsed;
}

function parseQueryPriceSort(value: unknown): PriceSort | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError(
      "priceSort query must be asc or desc",
      status.BAD_REQUEST,
    );
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "asc" || normalized === "desc") {
    return normalized;
  }

  throw new AppError("priceSort query must be asc or desc", status.BAD_REQUEST);
}

export const RoomController = {
  listRoomTypes: async (_req: Request, res: Response) => {
    const result = await RoomService.listRoomTypes();

    res.status(status.OK).json({
      success: true,
      message: "Room types retrieved successfully",
      data: result,
    });
  },

  createRoomType: async (req: Request, res: Response) => {
    const body = asBodyObject(req.body);
    const name = getRequiredString(body, "name");

    const result = await RoomService.createRoomType(name);

    res.status(status.CREATED).json({
      success: true,
      message: "Room type created successfully",
      data: result,
    });
  },

  listRooms: async (req: Request, res: Response) => {
    const isAvailable = parseQueryBoolean(req.query.isAvailable, "isAvailable");

    const roomTypeId =
      typeof req.query.roomTypeId === "string" &&
      req.query.roomTypeId.trim() !== ""
        ? req.query.roomTypeId.trim()
        : undefined;

    const search =
      typeof req.query.search === "string" && req.query.search.trim() !== ""
        ? req.query.search.trim()
        : undefined;

    const checkInDate = parseQueryDate(req.query.checkInDate, "checkInDate");
    const checkOutDate = parseQueryDate(req.query.checkOutDate, "checkOutDate");
    const guests = parseQueryPositiveInt(req.query.guests, "guests");
    const page = parseQueryPositiveInt(req.query.page, "page") ?? 1;
    const limit = parseQueryPositiveInt(req.query.limit, "limit") ?? ROOMS_PER_PAGE;
    const priceSort = parseQueryPriceSort(req.query.priceSort);

    if ((checkInDate && !checkOutDate) || (!checkInDate && checkOutDate)) {
      throw new AppError(
        "checkInDate and checkOutDate queries are required together",
        status.BAD_REQUEST,
      );
    }

    if (checkInDate && checkOutDate && checkOutDate <= checkInDate) {
      throw new AppError(
        "checkOutDate must be after checkInDate",
        status.BAD_REQUEST,
      );
    }

    const result = await RoomService.listRooms({
      isAvailable,
      roomTypeId,
      search,
      checkInDate,
      checkOutDate,
      guests,
      page,
      limit,
      priceSort,
    });

    res.status(status.OK).json({
      success: true,
      message: "Rooms retrieved successfully",
      data: result,
    });
  },

  getSingleRoom: async (req: Request, res: Response) => {
    const slug = req.params.slug;

    if (!slug || slug.trim() === "") {
      throw new AppError("Room slug is required", status.BAD_REQUEST);
    }

    const result = await RoomService.getSingleRoom(slug.trim());

    res.status(status.OK).json({
      success: true,
      message: "Room retrieved successfully",
      data: result,
    });
  },

  createRoom: async (req: Request, res: Response) => {
    const body = asBodyObject(req.body);

    const name = getRequiredString(body, "name");
    const slug = getOptionalString(body, "slug");
    const roomTypeId = getRequiredString(body, "roomTypeId");
    const price = getRequiredPositiveNumber(body, "price");
    const capacity = getRequiredPositiveInt(body, "capacity");

    const description =
      typeof body.description === "string" && body.description.trim() !== ""
        ? body.description.trim()
        : undefined;
    const facilities = getOptionalStringList(body, "facilities");
    const rules = getOptionalStringList(body, "rules");

    const isAvailable =
      typeof body.isAvailable === "boolean" ? body.isAvailable : undefined;
    const bedType = getOptionalBedType(body, "bedType");

    const result = await RoomService.createRoom({
      name,
      slug,
      roomTypeId,
      price,
      capacity,
      description,
      facilities,
      rules,
      isAvailable,
      bedType,
    });

    res.status(status.CREATED).json({
      success: true,
      message: "Room created successfully",
      data: result,
    });
  },

  updateRoom: async (req: Request, res: Response) => {
    const roomId = req.params.id;

    if (!roomId || roomId.trim() === "") {
      throw new AppError("Room id is required", status.BAD_REQUEST);
    }

    const body = asBodyObject(req.body);

    const updatePayload = {
      name: getOptionalString(body, "name"),
      slug: getOptionalString(body, "slug"),
      description: getOptionalString(body, "description"),
      facilities: getOptionalStringList(body, "facilities"),
      rules: getOptionalStringList(body, "rules"),
      price: getOptionalPositiveNumber(body, "price"),
      capacity: getOptionalPositiveInt(body, "capacity"),
      roomTypeId: getOptionalString(body, "roomTypeId"),
      isAvailable: getOptionalBoolean(body, "isAvailable"),
      bedType: getOptionalBedType(body, "bedType"),
    };

    const hasAnyField = Object.values(updatePayload).some(
      (value) => value !== undefined,
    );

    if (!hasAnyField) {
      throw new AppError(
        "At least one field is required to update room",
        status.BAD_REQUEST,
      );
    }

    const result = await RoomService.updateRoom(roomId, updatePayload);

    res.status(status.OK).json({
      success: true,
      message: "Room updated successfully",
      data: result,
    });
  },

  deleteRoom: async (req: Request, res: Response) => {
    const roomId = req.params.id;

    if (!roomId || roomId.trim() === "") {
      throw new AppError("Room id is required", status.BAD_REQUEST);
    }

    await RoomService.deleteRoom(roomId);

    res.status(status.OK).json({
      success: true,
      message: "Room deleted successfully",
    });
  },

  getBookedDates: async (req: Request, res: Response) => {
    const roomId = req.params.roomId;

    if (!roomId || roomId.trim() === "") {
      throw new AppError("Room ID is required", status.BAD_REQUEST);
    }

    const result = await RoomService.getBookedDates(roomId.trim());

    res.status(status.OK).json({
      success: true,
      message: "Booked dates retrieved successfully",
      data: result,
    });
  },
};
