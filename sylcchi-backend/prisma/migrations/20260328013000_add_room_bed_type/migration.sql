ALTER TABLE "rooms"
ADD COLUMN "bed_type" TEXT;

UPDATE "rooms"
SET "bed_type" = CASE
  WHEN "capacity" <= 1 THEN 'Twin'
  WHEN "capacity" = 2 THEN 'King'
  WHEN "capacity" = 3 THEN 'Queen'
  ELSE 'Bunk'
END
WHERE "bed_type" IS NULL;
