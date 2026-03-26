-- Keep BookingPaymentStatus aligned with current application values.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'BookingPaymentStatus'
      AND e.enumlabel = 'UNPAID'
  ) THEN
    CREATE TYPE "BookingPaymentStatus_new" AS ENUM ('PENDING', 'PARTIAL', 'PAID');

    ALTER TABLE "reservations"
      ALTER COLUMN "payment_status" DROP DEFAULT;

    ALTER TABLE "reservations"
      ALTER COLUMN "payment_status" TYPE "BookingPaymentStatus_new"
      USING (
        CASE
          WHEN "payment_status"::text = 'UNPAID' THEN 'PENDING'
          WHEN "payment_status"::text = 'PAID' THEN 'PAID'
          ELSE 'PENDING'
        END
      )::"BookingPaymentStatus_new";

    DROP TYPE "BookingPaymentStatus";
    ALTER TYPE "BookingPaymentStatus_new" RENAME TO "BookingPaymentStatus";
  END IF;
END $$;

ALTER TABLE "reservations"
  ALTER COLUMN "payment_status" SET DEFAULT 'PENDING';

ALTER TABLE "reservations"
  ADD COLUMN IF NOT EXISTS "booking_code" TEXT,
  ADD COLUMN IF NOT EXISTS "deposit_rate" DECIMAL(5,2) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "deposit_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "remaining_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'reservations_booking_code_key'
  ) THEN
    CREATE UNIQUE INDEX "reservations_booking_code_key"
      ON "reservations"("booking_code");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    WHERE t.typname = 'PaymentType'
  ) THEN
    CREATE TYPE "PaymentType" AS ENUM ('DEPOSIT', 'FULL');
  END IF;
END $$;

ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS "payment_type" "PaymentType" NOT NULL DEFAULT 'DEPOSIT';

CREATE TABLE IF NOT EXISTS "checkin_otps" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "reservation_id" UUID NOT NULL,
  "channel" TEXT NOT NULL,
  "target" TEXT NOT NULL,
  "otp_hash" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "expires_at" TIMESTAMP(6) NOT NULL,
  "verified_at" TIMESTAMP(6),
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "checkin_otps_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'checkin_otps_reservation_id_fkey'
  ) THEN
    ALTER TABLE "checkin_otps"
      ADD CONSTRAINT "checkin_otps_reservation_id_fkey"
      FOREIGN KEY ("reservation_id")
      REFERENCES "reservations"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "checkin_otps_reservation_id_target_idx"
  ON "checkin_otps"("reservation_id", "target");

CREATE INDEX IF NOT EXISTS "checkin_otps_expires_at_idx"
  ON "checkin_otps"("expires_at");
