import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const requiredKeys = ["DATABASE_URL"] as const;

type RequiredEnvKey = (typeof requiredKeys)[number];

type EnvVars = {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  DATABASE_URL: string;
  DIRECT_URL: string;
  JWT_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  FRONTEND_URL: string;
  TRUSTED_ORIGINS: string[];
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  SMTP_HOST?: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM: string;
  SUPPORT_EMAIL: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLIC_KEY?: string;
  STRIPE_CURRENCY: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_CHECKOUT_SUCCESS_URL?: string;
  STRIPE_CHECKOUT_CANCEL_URL?: string;
  SSLCOMMERZ_STORE_ID?: string;
  SSLCOMMERZ_STORE_PASSWORD?: string;
  SSLCOMMERZ_API_URL: string;
  BOOKING_MAX_STAY_NIGHTS: number;
};

function getRequired(key: RequiredEnvKey): string {
  const value = process.env[key];

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function parseNodeEnv(value: string): EnvVars["NODE_ENV"] {
  if (value === "development" || value === "test" || value === "production") {
    return value;
  }

  return "development";
}

function parsePort(value: string): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 5000;
  }

  return parsed;
}

function parsePositiveInt(value: string, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
}

function isValidOrigin(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function parseTrustedOrigins(
  raw: string | undefined,
  defaults: string[],
): string[] {
  const fromEnv = (raw ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const combined = [...fromEnv, ...defaults]
    .filter((origin) => isValidOrigin(origin))
    .map((origin) => origin.replace(/\/$/, ""));

  return Array.from(new Set(combined));
}

const betterAuthUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:5000";
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
const smtpFrom = process.env.SMTP_FROM ?? "no-reply@sylcchi.local";

export const envVars: EnvVars = {
  NODE_ENV: parseNodeEnv(process.env.NODE_ENV ?? "development"),
  PORT: parsePort(process.env.PORT ?? "5000"),
  DATABASE_URL: getRequired("DATABASE_URL"),
  DIRECT_URL: process.env.DIRECT_URL ?? getRequired("DATABASE_URL"),
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret-change-me",
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "30d",
  BETTER_AUTH_URL: betterAuthUrl,
  BETTER_AUTH_SECRET:
    process.env.BETTER_AUTH_SECRET ?? "dev-better-auth-secret-change-me",
  FRONTEND_URL: frontendUrl,
  TRUSTED_ORIGINS: parseTrustedOrigins(process.env.TRUSTED_ORIGINS, [
    betterAuthUrl,
    frontendUrl,
  ]),
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parsePort(process.env.SMTP_PORT ?? "587"),
  SMTP_SECURE: parseBoolean(process.env.SMTP_SECURE, false),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: smtpFrom,
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL ?? smtpFrom,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
  STRIPE_CURRENCY: process.env.STRIPE_CURRENCY ?? "usd",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_CHECKOUT_SUCCESS_URL: process.env.STRIPE_CHECKOUT_SUCCESS_URL,
  STRIPE_CHECKOUT_CANCEL_URL: process.env.STRIPE_CHECKOUT_CANCEL_URL,
  SSLCOMMERZ_STORE_ID: process.env.SSLCOMMERZ_STORE_ID,
  SSLCOMMERZ_STORE_PASSWORD: process.env.SSLCOMMERZ_STORE_PASSWORD,
  SSLCOMMERZ_API_URL:
    process.env.SSLCOMMERZ_API_URL ?? "https://sandbox.sslcommerz.com",
  BOOKING_MAX_STAY_NIGHTS: parsePositiveInt(
    process.env.BOOKING_MAX_STAY_NIGHTS ?? "11",
    11,
  ),
};
