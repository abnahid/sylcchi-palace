import { Request, Response } from "express";
import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { UserService } from "./user.service";

function asBodyObject(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") {
    throw new AppError("Request body is required", status.BAD_REQUEST);
  }

  return body as Record<string, unknown>;
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

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
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

function getOptionalRole(
  obj: Record<string, unknown>,
  key: string,
): "CUSTOMER" | "MANAGER" | "ADMIN" | undefined {
  const raw = getOptionalString(obj, key);
  if (!raw) {
    return undefined;
  }

  const normalized = raw.toUpperCase();
  if (
    normalized !== "CUSTOMER" &&
    normalized !== "MANAGER" &&
    normalized !== "ADMIN"
  ) {
    throw new AppError(
      "role must be CUSTOMER, MANAGER or ADMIN",
      status.BAD_REQUEST,
    );
  }

  return normalized;
}

function parseQueryPositiveInt(value: unknown, defaultValue: number): number {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== "string") {
    throw new AppError("Invalid numeric query value", status.BAD_REQUEST);
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(
      "Query value must be a positive integer",
      status.BAD_REQUEST,
    );
  }

  return parsed;
}

function parseQueryBoolean(value: unknown): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new AppError("Invalid boolean query value", status.BAD_REQUEST);
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") {
    return true;
  }

  if (normalized === "false" || normalized === "0") {
    return false;
  }

  throw new AppError(
    "Boolean query must be true/false/1/0",
    status.BAD_REQUEST,
  );
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getOptionalBio(
  obj: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = getOptionalString(obj, key);
  if (!value) return undefined;

  if (value.length > 36) {
    throw new AppError("bio must be 36 characters or less", status.BAD_REQUEST);
  }

  return value;
}

function getOptionalWebsite(
  obj: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = getOptionalString(obj, key);
  if (!value) return undefined;

  if (value.length > 255) {
    throw new AppError(
      "website must be 255 characters or less",
      status.BAD_REQUEST,
    );
  }

  if (!isValidUrl(value)) {
    throw new AppError("website must be a valid URL", status.BAD_REQUEST);
  }

  return value;
}

function getOptionalLocation(
  obj: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = getOptionalString(obj, key);
  if (!value) return undefined;

  if (value.length > 100) {
    throw new AppError(
      "location must be 100 characters or less",
      status.BAD_REQUEST,
    );
  }

  return value;
}

function getOptionalNationality(
  obj: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = getOptionalString(obj, key);
  if (!value) return undefined;

  if (value.length > 100) {
    throw new AppError(
      "nationality must be 100 characters or less",
      status.BAD_REQUEST,
    );
  }

  return value;
}

export const UserController = {
  getMyProfile: async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new AppError("Authentication required", status.UNAUTHORIZED);
    }

    const result = await UserService.getUserById(req.user.id);

    res.status(status.OK).json({
      success: true,
      message: "Profile retrieved successfully",
      data: result,
    });
  },

  updateMyProfile: async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new AppError("Authentication required", status.UNAUTHORIZED);
    }

    const body = asBodyObject(req.body);

    if (body.role !== undefined) {
      throw new AppError(
        "You are not allowed to update role",
        status.FORBIDDEN,
      );
    }

    const payload = {
      name: getOptionalString(body, "name"),
      phone: getOptionalString(body, "phone"),
      image: getOptionalString(body, "image"),
      location: getOptionalLocation(body, "location"),
      website: getOptionalWebsite(body, "website"),
      nationality: getOptionalNationality(body, "nationality"),
      bio: getOptionalBio(body, "bio"),
    };

    const hasAnyField = Object.values(payload).some(
      (value) => value !== undefined,
    );

    if (!hasAnyField) {
      throw new AppError(
        "At least one field is required to update profile",
        status.BAD_REQUEST,
      );
    }

    const result = await UserService.updateMyProfile(req.user.id, payload);

    res.status(status.OK).json({
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  },

  listUsers: async (req: Request, res: Response) => {
    const roleRaw =
      typeof req.query.role === "string" ? req.query.role.trim() : undefined;

    let role: "CUSTOMER" | "MANAGER" | "ADMIN" | undefined;
    if (roleRaw) {
      const normalized = roleRaw.toUpperCase();
      if (
        normalized !== "CUSTOMER" &&
        normalized !== "MANAGER" &&
        normalized !== "ADMIN"
      ) {
        throw new AppError(
          "role query must be CUSTOMER, MANAGER or ADMIN",
          status.BAD_REQUEST,
        );
      }
      role = normalized;
    }

    const search =
      typeof req.query.search === "string" && req.query.search.trim() !== ""
        ? req.query.search.trim()
        : undefined;

    const page = parseQueryPositiveInt(req.query.page, 1);
    const limitRaw = parseQueryPositiveInt(req.query.limit, 20);
    const limit = Math.min(limitRaw, 100);

    const emailVerified = parseQueryBoolean(req.query.emailVerified);

    const result = await UserService.listUsers({
      search,
      role,
      emailVerified,
      page,
      limit,
    });

    res.status(status.OK).json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  },

  getUserById: async (req: Request, res: Response) => {
    const userId = req.params.id;

    if (!userId || userId.trim() === "") {
      throw new AppError("User id is required", status.BAD_REQUEST);
    }

    const result = await UserService.getUserById(userId.trim());

    res.status(status.OK).json({
      success: true,
      message: "User retrieved successfully",
      data: result,
    });
  },

  updateUser: async (req: Request, res: Response) => {
    const userId = req.params.id;

    if (!userId || userId.trim() === "") {
      throw new AppError("User id is required", status.BAD_REQUEST);
    }

    const body = asBodyObject(req.body);

    const payload = {
      name: getOptionalString(body, "name"),
      phone: getOptionalString(body, "phone"),
      role: getOptionalRole(body, "role"),
      emailVerified: getOptionalBoolean(body, "emailVerified"),
      image: getOptionalString(body, "image"),
    };

    const hasAnyField = Object.values(payload).some(
      (value) => value !== undefined,
    );

    if (!hasAnyField) {
      throw new AppError(
        "At least one field is required to update user",
        status.BAD_REQUEST,
      );
    }

    const result = await UserService.updateUser(userId.trim(), payload);

    res.status(status.OK).json({
      success: true,
      message: "User updated successfully",
      data: result,
    });
  },

  deleteUser: async (req: Request, res: Response) => {
    const userId = req.params.id;

    if (!userId || userId.trim() === "") {
      throw new AppError("User id is required", status.BAD_REQUEST);
    }

    await UserService.deleteUser(userId.trim(), req.user?.id);

    res.status(status.OK).json({
      success: true,
      message: "User deleted successfully",
      data: null,
    });
  },
};
