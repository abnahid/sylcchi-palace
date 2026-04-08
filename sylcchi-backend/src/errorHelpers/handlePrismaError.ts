import status from "http-status";
import { AppError } from "./AppError";

type PrismaErrorCode = string;

interface PrismaError extends Error {
  code?: PrismaErrorCode;
  meta?: Record<string, unknown>;
  clientVersion?: string;
}

/**
 * Maps Prisma error codes to user-friendly messages
 * Distinguishes between connection, validation, constraint, and other errors
 */
export function handlePrismaError(err: PrismaError): AppError {
  const code = err.code || "";
  const meta = err.meta || {};
  const isDev = process.env.NODE_ENV === "development";

  // Network / Connection Errors
  if (
    code === "P1000" ||
    err.message?.includes("getaddrinfo ENOTFOUND") ||
    err.message?.includes("connect ECONNREFUSED")
  ) {
    return new AppError(
      "Database connection failed. Please check if the database server is running and network is stable.",
      status.SERVICE_UNAVAILABLE,
      true,
    );
  }

  if (code === "P1001") {
    return new AppError(
      "Cannot reach the database server. It might be down or unreachable. Please try again later.",
      status.SERVICE_UNAVAILABLE,
      true,
    );
  }

  if (code === "P1002") {
    return new AppError(
      "The database server has timed out. Please try again.",
      status.REQUEST_TIMEOUT,
      true,
    );
  }

  // Authentication / Permission Errors
  if (code === "P1003") {
    return new AppError(
      "Database authentication failed. Invalid credentials or insufficient permissions.",
      status.INTERNAL_SERVER_ERROR,
      true,
    );
  }

  // Query / Schema Errors
  if (code === "P2007") {
    return new AppError(
      "Data type mismatch or invalid field value. Please check your input.",
      status.BAD_REQUEST,
      true,
    );
  }

  if (code === "P2025") {
    return new AppError(
      "The requested resource was not found.",
      status.NOT_FOUND,
      true,
    );
  }

  // Unique constraint violation
  if (code === "P2002") {
    const field = (meta.target as string[] | undefined)?.[0] || "field";
    return new AppError(
      `A record with this ${field} already exists. Please use a different value.`,
      status.CONFLICT,
      true,
    );
  }

  // Foreign key constraint violation
  if (code === "P2003") {
    return new AppError(
      "Invalid reference to related data. Please ensure all referenced records exist.",
      status.BAD_REQUEST,
      true,
    );
  }

  // Required field missing
  if (code === "P2011") {
    const field = (meta.column_name as string | undefined) || "field";
    return new AppError(
      `Required field ${field} is missing. Please provide all required information.`,
      status.BAD_REQUEST,
      true,
    );
  }

  // Transaction / Concurrency Errors
  if (code === "P2028") {
    return new AppError(
      "Database is too busy to process your request. Please try again in a moment.",
      status.SERVICE_UNAVAILABLE,
      true,
    );
  }

  if (code === "P2034") {
    return new AppError(
      "Transaction conflict: another request modified the data simultaneously. Please retry your action.",
      status.CONFLICT,
      true,
    );
  }

  // Migration / Schema Drift
  if (
    code === "P5007" ||
    err.message?.includes("schema drift") ||
    err.message?.includes("migration history")
  ) {
    return new AppError(
      "Database schema is out of sync. This is a server-side issue. Please contact support.",
      status.INTERNAL_SERVER_ERROR,
      true,
    );
  }

  // Generic validation error
  if (err.message?.includes("Unknown field")) {
    return new AppError(
      "Invalid field in request. Please check your input and try again.",
      status.BAD_REQUEST,
      true,
    );
  }

  // Catch-all for other Prisma errors
  if (code.startsWith("P")) {
    return new AppError(
      isDev
        ? `Database error (${code}): ${err.message}`
        : "A database error occurred. Please try again.",
      status.INTERNAL_SERVER_ERROR,
      true,
    );
  }

  // Non-Prisma Error
  return new AppError(
    isDev ? err.message : "An unexpected error occurred. Please try again.",
    status.INTERNAL_SERVER_ERROR,
    true,
  );
}

export function isPrismaError(err: unknown): err is PrismaError {
  return (
    err instanceof Error &&
    ((typeof (err as PrismaError).code === "string" &&
      (err as PrismaError).code.startsWith("P")) ||
      err.name === "PrismaClientKnownRequestError" ||
      err.name === "PrismaClientValidationError" ||
      err.name === "PrismaClientRustPanicError")
  );
}
