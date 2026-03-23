import { Request, Response } from "express";
import status from "http-status";
import jwt from "jsonwebtoken";
import { envVars } from "../../config/env";
import { AppError } from "../../errorHelpers/AppError";
import { AuthService } from "./auth.service";

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

function toWebHeaders(req: Request): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.set(key, value);
    }
  }
  return headers;
}

function forwardCookies(apiResponse: unknown, res: Response): void {
  if (
    apiResponse &&
    typeof apiResponse === "object" &&
    "headers" in apiResponse
  ) {
    const responseHeaders = (apiResponse as { headers?: Headers }).headers;
    if (responseHeaders) {
      const setCookies = responseHeaders.getSetCookie?.();
      if (setCookies) {
        for (const cookie of setCookies) {
          res.append("Set-Cookie", cookie);
        }
      }
    }
  }
}

export const AuthController = {
  signUp: async (req: Request, res: Response) => {
    const body = asBodyObject(req.body);
    const name = getRequiredString(body, "name");
    const email = getRequiredString(body, "email");
    const password = getRequiredString(body, "password");

    const result = await AuthService.signUp(
      { name, email, password },
      toWebHeaders(req),
    );

    forwardCookies(result, res);

    res.status(201).json({
      success: true,
      message: "Sign-up completed",
      data: result,
    });
  },

  signIn: async (req: Request, res: Response) => {
    const body = asBodyObject(req.body);
    const email = getRequiredString(body, "email");
    const password = getRequiredString(body, "password");

    const result = await AuthService.signIn(
      { email, password },
      toWebHeaders(req),
    );

    forwardCookies(result, res);

    res.status(200).json({
      success: true,
      message: "Sign-in completed",
      data: result,
    });
  },

  signOut: async (req: Request, res: Response) => {
    let userId: string | undefined;
    const authHeader = req.headers.authorization;

    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice("Bearer ".length).trim();
      try {
        const decoded = jwt.verify(token, envVars.JWT_SECRET);
        if (
          decoded &&
          typeof decoded !== "string" &&
          typeof decoded.sub === "string"
        ) {
          userId = decoded.sub;
        }
      } catch {
        userId = undefined;
      }
    }

    const result = await AuthService.signOut(toWebHeaders(req), userId);

    forwardCookies(result, res);

    res.status(200).json({
      success: true,
      message: "Signed out successfully",
    });
  },

  getSession: async (req: Request, res: Response) => {
    const session = await AuthService.getSession(toWebHeaders(req));

    if (!session) {
      throw new AppError("Not authenticated", status.UNAUTHORIZED);
    }

    res.status(200).json({
      success: true,
      message: "Session retrieved",
      data: session,
    });
  },

  requestVerificationOtp: async (req: Request, res: Response) => {
    const body = asBodyObject(req.body);
    const email = getRequiredString(body, "email");
    const type =
      typeof body.type === "string" && body.type.trim() !== ""
        ? body.type.trim()
        : "email-verification";

    const result = await AuthService.requestVerificationOtp(email, type);

    res.status(200).json({
      success: true,
      message: "Verification OTP sent to your email",
      data: result,
    });
  },

  verifyEmailOtp: async (req: Request, res: Response) => {
    const body = asBodyObject(req.body);
    const email = getRequiredString(body, "email");
    const otp = getRequiredString(body, "otp");

    const result = await AuthService.verifyEmailOtp(
      { email, otp },
      toWebHeaders(req),
    );

    forwardCookies(result, res);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: result,
    });
  },

  refreshToken: async (req: Request, res: Response) => {
    const body = asBodyObject(req.body);
    const refreshToken = getRequiredString(body, "refreshToken");

    const result = await AuthService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  },

  forgotPassword: async (req: Request, res: Response) => {
    const body = asBodyObject(req.body);
    const email = getRequiredString(body, "email");

    const result = await AuthService.requestVerificationOtp(
      email,
      "forget-password",
    );

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
      data: result,
    });
  },

  resetPassword: async (req: Request, res: Response) => {
    const body = asBodyObject(req.body);
    const email = getRequiredString(body, "email");
    const otp = getRequiredString(body, "otp");
    const password = getRequiredString(body, "password");

    const result = await AuthService.resetPassword({ email, otp, password });

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: result,
    });
  },
};
