-- AlterTable
ALTER TABLE "checkin_otps" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" VARCHAR(36),
ADD COLUMN     "location" VARCHAR(100),
ADD COLUMN     "nationality" VARCHAR(100),
ADD COLUMN     "website" VARCHAR(255);
