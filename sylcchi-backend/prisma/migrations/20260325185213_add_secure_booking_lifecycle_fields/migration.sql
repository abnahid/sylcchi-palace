/*
  Warnings:

  - You are about to drop the column `status` on the `reservations` table. All the data in the column will be lost.
  - Added the required column `base_price` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guest_details` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nights` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vat` to the `reservations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingPaymentStatus" AS ENUM ('PAID', 'UNPAID');

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'PAY_LATER';

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_user_id_fkey";

-- DropIndex
DROP INDEX "reservations_status_idx";

-- AlterTable
ALTER TABLE "reservations" DROP COLUMN "status",
ADD COLUMN     "base_price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "booking_status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "expires_at" TIMESTAMP(6),
ADD COLUMN     "guest_details" JSONB NOT NULL,
ADD COLUMN     "nights" INTEGER NOT NULL,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL,
ADD COLUMN     "payment_status" "BookingPaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "vat" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL;

-- DropEnum
DROP TYPE "ReservationStatus";

-- CreateIndex
CREATE INDEX "reservations_booking_status_idx" ON "reservations"("booking_status");

-- CreateIndex
CREATE INDEX "reservations_payment_status_idx" ON "reservations"("payment_status");

-- CreateIndex
CREATE INDEX "reservations_expires_at_idx" ON "reservations"("expires_at");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
