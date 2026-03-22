import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;
const prismaCliUrl = directUrl ?? databaseUrl;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env or .env.local before running Prisma commands.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use direct connection for CLI/migrations to avoid PgBouncer prepared statement issues.
    url: prismaCliUrl,
    directUrl,
  },
});
