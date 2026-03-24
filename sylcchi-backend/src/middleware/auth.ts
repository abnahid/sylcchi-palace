import { NextFunction, Request, RequestHandler, Response } from "express";
import status from "http-status";
import jwt from "jsonwebtoken";
import { envVars } from "../config/env";
import { AppError } from "../errorHelpers/AppError";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      user?:
        | {
            id: string;
            name: string;
            email: string;
            role: string;
            emailVerified: boolean;
            image?: string | null | undefined;
          }
        | undefined;
      session?:
        | {
            id: string;
            userId: string;
            token: string;
            expiresAt: Date;
          }
        | undefined;
    }
  }
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

function getBearerToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;

  if (typeof authHeader !== "string") {
    return undefined;
  }

  const prefix = "Bearer ";
  if (!authHeader.startsWith(prefix)) {
    return undefined;
  }

  const token = authHeader.slice(prefix.length).trim();
  return token || undefined;
}

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const session = await auth.api.getSession({
    headers: toWebHeaders(req),
  });

  if (session) {
    req.user = session.user as Express.Request["user"];
    req.session = session.session as Express.Request["session"];

    next();
    return;
  }

  // Fallback for API clients (e.g. Postman) that send JWT bearer tokens.
  const accessToken = getBearerToken(req);

  if (!accessToken) {
    throw new AppError("Authentication required", status.UNAUTHORIZED);
  }

  let subject: string | undefined;

  try {
    const decoded = jwt.verify(accessToken, envVars.JWT_SECRET);

    if (!decoded || typeof decoded === "string") {
      throw new AppError("Invalid access token", status.UNAUTHORIZED);
    }

    if (decoded.type !== "access") {
      throw new AppError("Invalid token type", status.UNAUTHORIZED);
    }

    if (typeof decoded.sub !== "string") {
      throw new AppError("Invalid token subject", status.UNAUTHORIZED);
    }

    subject = decoded.sub;
  } catch {
    throw new AppError("Invalid or expired access token", status.UNAUTHORIZED);
  }

  const user = await prisma.user.findUnique({
    where: { id: subject },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      image: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", status.UNAUTHORIZED);
  }

  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: String(user.role),
    emailVerified: user.emailVerified,
    image: user.image,
  };

  req.session = undefined;

  next();
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Authentication required", status.UNAUTHORIZED);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        "You do not have permission to access this resource",
        status.FORBIDDEN,
      );
    }

    next();
  };
};

export const USER_ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  CUSTOMER: "CUSTOMER",
} as const;

export const routeAccess: {
  public: RequestHandler;
  admin: RequestHandler[];
  manager: RequestHandler[];
  adminOrManager: RequestHandler[];
} = {
  public: (_req, _res, next) => next(),
  admin: [requireAuth, requireRole(USER_ROLES.ADMIN)],
  manager: [requireAuth, requireRole(USER_ROLES.MANAGER)],
  adminOrManager: [
    requireAuth,
    requireRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  ],
};
