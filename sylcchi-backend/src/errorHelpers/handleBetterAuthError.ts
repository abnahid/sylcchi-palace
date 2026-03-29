import { AppError } from "./AppError";

/**
 * Better Auth APIError structure:
 * {
 *   status: string (e.g., 'UNAUTHORIZED', 'BAD_REQUEST')
 *   body: { message: string, code: string }
 *   statusCode: number
 *   headers: object
 * }
 */

type BetterAuthError = {
  status?: string;
  body?: {
    message?: string;
    code?: string;
  };
  statusCode?: number;
  headers?: Record<string, unknown>;
};

/**
 * Type guard to check if error is a Better Auth APIError
 */
export function isBetterAuthError(err: unknown): err is BetterAuthError {
  if (!err || typeof err !== "object") return false;
  const e = err as Record<string, unknown>;
  return (
    typeof e.status === "string" &&
    typeof e.statusCode === "number" &&
    e.body &&
    typeof e.body === "object" &&
    "message" in (e.body as Record<string, unknown>)
  );
}

/**
 * Map Better Auth error codes to readable user messages
 */
function mapAuthErrorCode(code: string | undefined): string {
  const codeMap: Record<string, string> = {
    INVALID_EMAIL_OR_PASSWORD: "Invalid email or password",
    USER_NOT_FOUND: "User not found",
    EMAIL_ALREADY_EXISTS: "Email already registered",
    PASSWORD_TOO_WEAK: "Password does not meet security requirements",
    INVALID_EMAIL_FORMAT: "Invalid email format",
    VERIFICATION_FAILED: "Email verification failed",
    SESSION_EXPIRED: "Session has expired, please sign in again",
    UNAUTHORIZED: "Unauthorized access",
    INVALID_PASSWORD: "Invalid password",
  };

  return codeMap[code ?? ""] || "Authentication error";
}

/**
 * Handle Better Auth APIError and convert to AppError
 */
export function handleBetterAuthError(err: BetterAuthError): AppError {
  const message =
    err.body?.message ||
    mapAuthErrorCode(err.body?.code) ||
    "Authentication failed";
  const statusCode = err.statusCode || 401;

  return new AppError(message, statusCode);
}
