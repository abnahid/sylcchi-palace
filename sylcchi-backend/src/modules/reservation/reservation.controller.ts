import { Request, Response } from "express";
import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { ReservationService } from "./reservation.service";

type GuestDetailInput = {
  name: string;
  email: string;
  phone: string;
};

function asBodyObject(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") {
    throw new AppError("Request body is required", status.BAD_REQUEST);
  }

  return body as Record<string, unknown>;
}

function getRequestPayload(req: Request): Record<string, unknown> {
  if (req.body && typeof req.body === "object") {
    return req.body as Record<string, unknown>;
  }

  return Object.fromEntries(
    Object.entries(req.query).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}

function getRedirectFlag(req: Request, body: Record<string, unknown>): boolean {
  const queryValue =
    typeof req.query.redirect === "string"
      ? req.query.redirect.toLowerCase()
      : undefined;

  const bodyValue =
    typeof body.redirect === "string"
      ? body.redirect.toLowerCase()
      : typeof body.redirect === "boolean"
        ? String(body.redirect)
        : undefined;

  const normalized = bodyValue ?? queryValue;
  return normalized === "true" || normalized === "1";
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

function parseDate(value: string, key: string): Date {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(`${key} must be a valid date`, status.BAD_REQUEST);
  }

  return parsed;
}

function getGuestDetails(obj: Record<string, unknown>): GuestDetailInput[] {
  const value = obj.guestDetails;

  if (!Array.isArray(value)) {
    throw new AppError("guestDetails must be an array", status.BAD_REQUEST);
  }

  const list = value.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new AppError(
        `guestDetails[${index}] must be an object`,
        status.BAD_REQUEST,
      );
    }

    const guest = item as Record<string, unknown>;
    const name = typeof guest.name === "string" ? guest.name.trim() : "";
    const email = typeof guest.email === "string" ? guest.email.trim() : "";
    const phone = typeof guest.phone === "string" ? guest.phone.trim() : "";

    if (!name || !email || !phone) {
      throw new AppError(
        `guestDetails[${index}] must include name, email and phone`,
        status.BAD_REQUEST,
      );
    }

    return {
      name,
      email,
      phone,
    };
  });

  if (!list[0]) {
    throw new AppError(
      "At least one guest detail is required",
      status.BAD_REQUEST,
    );
  }

  return list;
}

function getCreatePaymentMethod(
  obj: Record<string, unknown>,
): "stripe" | "sslcommerz" | "pay_later" {
  const method = getRequiredString(obj, "paymentMethod").toLowerCase();

  if (
    method !== "stripe" &&
    method !== "sslcommerz" &&
    method !== "pay_later"
  ) {
    throw new AppError(
      "paymentMethod must be stripe, sslcommerz or pay_later",
      status.BAD_REQUEST,
    );
  }

  return method;
}

function getOptionalPayMethod(
  obj: Record<string, unknown>,
): "stripe" | "sslcommerz" | undefined {
  const raw = getOptionalString(obj, "paymentMethod");
  if (!raw) {
    return undefined;
  }

  const method = raw.toLowerCase();
  if (method !== "stripe" && method !== "sslcommerz") {
    throw new AppError(
      "paymentMethod must be stripe or sslcommerz",
      status.BAD_REQUEST,
    );
  }

  return method;
}

function getAccessContext(req: Request, body?: Record<string, unknown>) {
  const guestEmailQuery =
    typeof req.query.guestEmail === "string" &&
    req.query.guestEmail.trim() !== ""
      ? req.query.guestEmail.trim()
      : undefined;

  const guestEmailBody =
    body && typeof body.guestEmail === "string" && body.guestEmail.trim() !== ""
      ? body.guestEmail.trim()
      : undefined;

  return {
    userId: req.user?.id,
    role: req.user?.role,
    guestEmail: guestEmailBody ?? guestEmailQuery,
  };
}

export const ReservationController = {
  createBooking: async (req: Request, res: Response) => {
    const body = asBodyObject(req.body);

    const roomId = getRequiredString(body, "roomId");
    const checkInDate = parseDate(
      getRequiredString(body, "checkInDate"),
      "checkInDate",
    );
    const checkOutDate = parseDate(
      getRequiredString(body, "checkOutDate"),
      "checkOutDate",
    );
    const guests = getRequiredPositiveInt(body, "guests");
    const guestDetails = getGuestDetails(body);
    const paymentMethod = getCreatePaymentMethod(body);

    const result = await ReservationService.createBooking({
      roomId,
      userId: req.user?.id,
      checkInDate,
      checkOutDate,
      guests,
      guestDetails,
      paymentMethod,
    });

    res.status(status.CREATED).json({
      success: true,
      message: "Booking created successfully",
      data: result,
    });
  },

  payBooking: async (req: Request, res: Response) => {
    const body = getRequestPayload(req);
    const bookingId = getRequiredString(body, "bookingId");
    const shouldRedirect = getRedirectFlag(req, body);

    const actionRaw = getOptionalString(body, "action")?.toLowerCase();
    let action: "initiate" | "confirm" | "callback" | undefined;

    if (actionRaw) {
      if (
        actionRaw !== "initiate" &&
        actionRaw !== "confirm" &&
        actionRaw !== "callback"
      ) {
        throw new AppError(
          "action must be initiate, confirm or callback",
          status.BAD_REQUEST,
        );
      }
      action = actionRaw;
    }

    const gatewayStatusRaw = getOptionalString(
      body,
      "gatewayStatus",
    )?.toLowerCase();
    let gatewayStatus: "success" | "failed" | "cancel" | undefined;

    if (gatewayStatusRaw) {
      if (
        gatewayStatusRaw !== "success" &&
        gatewayStatusRaw !== "failed" &&
        gatewayStatusRaw !== "cancel"
      ) {
        throw new AppError(
          "gatewayStatus must be success, failed or cancel",
          status.BAD_REQUEST,
        );
      }
      gatewayStatus = gatewayStatusRaw;
    }

    const result = await ReservationService.payBooking(
      {
        bookingId,
        paymentMethod: getOptionalPayMethod(body),
        action,
        gatewayStatus,
        transactionId: getOptionalString(body, "transactionId"),
      },
      getAccessContext(req, body),
    );

    const paymentData = result.payment as Record<string, unknown> | undefined;
    const checkoutUrl =
      paymentData && typeof paymentData.checkoutUrl === "string"
        ? paymentData.checkoutUrl
        : undefined;

    if (shouldRedirect && checkoutUrl) {
      res.redirect(status.SEE_OTHER, checkoutUrl);
      return;
    }

    res.status(status.OK).json({
      success: true,
      message: "Booking payment handled successfully",
      data: result,
    });
  },

  getBookingById: async (req: Request, res: Response) => {
    const bookingId = req.params.id;

    if (!bookingId || bookingId.trim() === "") {
      throw new AppError("Booking id is required", status.BAD_REQUEST);
    }

    const result = await ReservationService.getBookingById(
      bookingId.trim(),
      getAccessContext(req),
    );

    res.status(status.OK).json({
      success: true,
      message: "Booking retrieved successfully",
      data: result,
    });
  },

  cancelBooking: async (req: Request, res: Response) => {
    const body = asBodyObject(req.body);
    const bookingId = getRequiredString(body, "bookingId");

    const result = await ReservationService.cancelBooking(
      bookingId,
      getAccessContext(req, body),
      getOptionalString(body, "reason"),
    );

    res.status(status.OK).json({
      success: true,
      message: "Booking cancelled successfully",
      data: result,
    });
  },
};
