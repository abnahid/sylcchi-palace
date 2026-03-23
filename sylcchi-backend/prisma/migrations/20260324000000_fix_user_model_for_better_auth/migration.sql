-- AlterTable: Remove unused password column, rename is_verified to emailVerified, add image
ALTER TABLE "users" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- Copy existing verification data
UPDATE "users" SET "emailVerified" = "is_verified";

-- Drop old column
ALTER TABLE "users" DROP COLUMN "is_verified";
ALTER TABLE "users" DROP COLUMN "password";

-- Add image field for Better Auth (profile picture from OAuth)
ALTER TABLE "users" ADD COLUMN "image" TEXT;
