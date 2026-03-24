/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `rooms` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "rooms_slug_key" ON "rooms"("slug");
