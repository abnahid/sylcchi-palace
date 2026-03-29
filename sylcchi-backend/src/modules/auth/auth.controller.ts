import { Request, Response } from "express";
import status from "http-status";
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
      const setCookies = responseHeaders.getSetCookie?.() ?? [];
      const singleSetCookie = responseHeaders.get("set-cookie");

      if (setCookies.length === 0 && singleSetCookie) {
        setCookies.push(singleSetCookie);
      }

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

    const { headers: _headers, ...responseData } = result as typeof result & {
      headers?: Headers;
    };

    res.status(201).json({
      success: true,
      message: "Sign-up completed",
      data: responseData,
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

    const { headers: _headers, ...responseData } = result as typeof result & {
      headers?: Headers;
    };

    res.status(200).json({
      success: true,
      message: "Sign-in completed",
      data: responseData,
    });
  },

  signOut: async (req: Request, res: Response) => {
    const result = await AuthService.signOut(toWebHeaders(req));

    forwardCookies(result, res);

    res.status(200).json({
      success: true,
      message: "Signed out successfully",
    });
  },

  getSession: async (req: Request, res: Response) => {
    const session = await AuthService.getSession(toWebHeaders(req));

    if (!session) {
      res.status(200).json({
        success: true,
        message: "No active session",
        data: null,
      });
      return;
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

    const { headers: _headers, ...responseData } = result as typeof result & {
      headers?: Headers;
    };

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: responseData,
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
