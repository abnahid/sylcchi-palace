import { NextFunction, Request, RequestHandler, Response } from "express";
import status from "http-status";
import { AppError } from "../errorHelpers/AppError";
import { getAuth } from "../lib/auth";

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

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: toWebHeaders(req),
  });

  if (session) {
    req.user = session.user as Express.Request["user"];
    req.session = session.session as Express.Request["session"];

    next();
    return;
  }

  throw new AppError("Authentication required", status.UNAUTHORIZED);
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: toWebHeaders(req),
  });

  if (session) {
    req.user = session.user as Express.Request["user"];
    req.session = session.session as Express.Request["session"];
  }

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
