import type { ErrorRequestHandler } from "express";
import { AppError } from "./AppError";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next,
) => {
  const appError =
    err instanceof AppError
      ? err
      : new AppError("Internal Server Error", 500, false);

  res.status(appError.statusCode).json({
    success: false,
    message: appError.message,
    error: {
      name: err.name ?? "Error",
      isOperational: appError.isOperational,
    },
  });
};
