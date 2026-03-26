import { Request, Response } from "express";
import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { CheckinService } from "./checkin.service";

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

function getOptionalDate(
  obj: Record<string, unknown>,
  key: string,
): Date | undefined {
  const raw = getOptionalString(obj, key);

  if (!raw) {
    return undefined;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(`${key} must be a valid date`, status.BAD_REQUEST);
  }

  return date;
}

function getOptionalPaymentMethod(
  obj: Record<string, unknown>,
): "stripe" | "sslcommerz" | undefined {
  const raw = getOptionalString(obj, "paymentMethod");
  if (!raw) {
    return undefined;
  }

  const normalized = raw.toLowerCase();
  if (normalized !== "stripe" && normalized !== "sslcommerz") {
    throw new AppError(
      "paymentMethod must be stripe or sslcommerz",
      status.BAD_REQUEST,
    );
  }

  return normalized;
}

function getOptionalDocumentTypes(
  obj: Record<string, unknown>,
): string[] | undefined {
  const raw = obj.documentTypes;

  if (raw === undefined || raw === null) {
    return undefined;
  }

  if (Array.isArray(raw)) {
    return raw
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();

    if (trimmed.length === 0) {
      return undefined;
    }

    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);

        if (Array.isArray(parsed)) {
          return parsed
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
        }
      } catch {
        throw new AppError(
          "documentTypes must be valid JSON array",
          status.BAD_REQUEST,
        );
      }
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  throw new AppError(
    "documentTypes must be a string or string[]",
    status.BAD_REQUEST,
  );
}

export const CheckinController = {
  uploadDocuments: async (req: Request, res: Response) => {
    const body = asBodyObject(req.body);

    const files = (
      (req.files as
        | Array<{
            buffer: Buffer;
            mimetype: string;
            originalname: string;
          }>
        | undefined) ?? []
    ).filter(
      (file) =>
        file &&
        Buffer.isBuffer(file.buffer) &&
        typeof file.mimetype === "string" &&
        typeof file.originalname === "string",
    );

    const result = await CheckinService.uploadCheckinDocuments({
      checkinToken: getRequiredString(body, "checkinToken"),
      files,
      documentTypes: getOptionalDocumentTypes(body),
    });

    res.status(status.CREATED).json({
      success: true,
      message: "Check-in documents uploaded successfully",
      data: result,
    });
  },

  lookupBooking: async (req: Request, res: Response) => {
    const body = asBodyObject(req.body);

    const result = await CheckinService.lookupBooking({
      bookingCode: getRequiredString(body, "bookingCode"),
      identity:
        getOptionalString(body, "email") ??
        getOptionalString(body, "phone") ??
        getRequiredString(body, "identity"),
    });

    res.status(status.OK).json({
      success: true,
      message: "Booking verified. OTP sent",
      data: result,
    });
  },

  verifyOtp: async (req: Request, res: Response) => {
    const body = asBodyObject(req.body);

    const result = await CheckinService.verifyOtp({
      bookingCode: getRequiredString(body, "bookingCode"),
      identity:
        getOptionalString(body, "email") ??
        getOptionalString(body, "phone") ??
        getRequiredString(body, "identity"),
      otp: getRequiredString(body, "otp"),
    });

    res.status(status.OK).json({
      success: true,
      message: "OTP verified successfully",
      data: result,
    });
  },

  completeCheckin: async (req: Request, res: Response) => {
    const body = asBodyObject(req.body);

    const result = await CheckinService.completeCheckin({
      checkinToken: getRequiredString(body, "checkinToken"),
      identityType: getOptionalString(body, "identityType"),
      identityNumber: getOptionalString(body, "identityNumber"),
      arrivalTime: getOptionalDate(body, "arrivalTime"),
      notes: getOptionalString(body, "notes"),
      paymentMethod: getOptionalPaymentMethod(body),
    });

    res.status(status.OK).json({
      success: true,
      message: result.requiresPayment
        ? "Payment required before check-in"
        : "Online check-in completed successfully",
      data: result,
    });
  },
};
