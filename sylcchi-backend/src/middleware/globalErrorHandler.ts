/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { z } from "zod";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";
import { envVars } from "../config/env";
import { AppError } from "../errorHelpers/AppError";
import {
  handleBetterAuthError,
  isBetterAuthError,
} from "../errorHelpers/handleBetterAuthError";
import {
  handlePrismaError,
  isPrismaError,
} from "../errorHelpers/handlePrismaError";
import { handleZodError } from "../errorHelpers/handleZodError";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";

type UploadedFile = {
  path: string;
};

type RequestWithUploads = Request & {
  file?: UploadedFile;
  files?: UploadedFile[] | Record<string, UploadedFile[]>;
};

function collectUploadedPaths(files?: RequestWithUploads["files"]): string[] {
  if (!files) {
    return [];
  }

  if (Array.isArray(files)) {
    return files.map((file) => file.path).filter(Boolean);
  }

  return Object.values(files)
    .flat()
    .map((file) => file.path)
    .filter(Boolean);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Only log non-auth errors in development (auth errors are expected/handled)
  if (envVars.NODE_ENV === "development" && !isBetterAuthError(err)) {
    console.log("Error from Global Error Handler", err);
  }

  const requestWithUploads = req as RequestWithUploads;

  if (requestWithUploads.file?.path) {
    await deleteFileFromCloudinary(requestWithUploads.file.path);
  }

  const uploadedPaths = collectUploadedPaths(requestWithUploads.files);
  if (uploadedPaths.length > 0) {
    await Promise.all(
      uploadedPaths.map((path) => deleteFileFromCloudinary(path)),
    );
  }

  let errorSources: TErrorSources[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";
  let stack: string | undefined;

  if (err instanceof z.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (isBetterAuthError(err)) {
    const authError = handleBetterAuthError(err);
    statusCode = authError.statusCode;
    message = authError.message;
    stack = authError.stack;
    errorSources = [
      {
        path: "",
        message: authError.message,
      },
    ];
  } else if (isPrismaError(err)) {
    const prismaError = handlePrismaError(err);
    statusCode = prismaError.statusCode;
    message = prismaError.message;
    stack = prismaError.stack;
    errorSources = [
      {
        path: "",
        message: prismaError.message,
      },
    ];
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  } else if (err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  }

  const errorResponse: TErrorResponse = {
    success: false,
    message,
    statusCode,
    errorSources,
    error: envVars.NODE_ENV === "development" ? err : undefined,
    stack: envVars.NODE_ENV === "development" ? stack : undefined,
  };

  res.status(statusCode).json(errorResponse);
};
