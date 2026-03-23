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
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  SMTP_HOST?: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM: string;
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

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
}

export const envVars: EnvVars = {
  NODE_ENV: parseNodeEnv(process.env.NODE_ENV ?? "development"),
  PORT: parsePort(process.env.PORT ?? "5000"),
  DATABASE_URL: getRequired("DATABASE_URL"),
  DIRECT_URL: process.env.DIRECT_URL ?? getRequired("DATABASE_URL"),
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret-change-me",
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "30d",
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:5000",
  BETTER_AUTH_SECRET:
    process.env.BETTER_AUTH_SECRET ?? "dev-better-auth-secret-change-me",
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parsePort(process.env.SMTP_PORT ?? "587"),
  SMTP_SECURE: parseBoolean(process.env.SMTP_SECURE, false),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM ?? "no-reply@sylcchi.local",
};
