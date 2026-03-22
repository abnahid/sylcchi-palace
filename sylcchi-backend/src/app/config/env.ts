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

export const envVars: EnvVars = {
  NODE_ENV: parseNodeEnv(process.env.NODE_ENV ?? "development"),
  PORT: parsePort(process.env.PORT ?? "5000"),
  DATABASE_URL: getRequired("DATABASE_URL"),
  DIRECT_URL: process.env.DIRECT_URL ?? getRequired("DATABASE_URL"),
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret-change-me",
};
