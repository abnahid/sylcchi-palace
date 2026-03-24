-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "facilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "rules" TEXT[] DEFAULT ARRAY[]::TEXT[];
