ALTER TABLE "reviews"
ADD COLUMN "location_rating" INTEGER,
ADD COLUMN "comfort_rating" INTEGER,
ADD COLUMN "service_rating" INTEGER,
ADD COLUMN "pricing_rating" INTEGER;

UPDATE "reviews"
SET
  "location_rating" = "rating",
  "comfort_rating" = "rating",
  "service_rating" = "rating",
  "pricing_rating" = "rating";

ALTER TABLE "reviews"
ALTER COLUMN "location_rating" SET NOT NULL,
ALTER COLUMN "comfort_rating" SET NOT NULL,
ALTER COLUMN "service_rating" SET NOT NULL,
ALTER COLUMN "pricing_rating" SET NOT NULL;

ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_rating_range_check" CHECK ("rating" BETWEEN 1 AND 5),
ADD CONSTRAINT "reviews_location_rating_range_check" CHECK ("location_rating" BETWEEN 1 AND 5),
ADD CONSTRAINT "reviews_comfort_rating_range_check" CHECK ("comfort_rating" BETWEEN 1 AND 5),
ADD CONSTRAINT "reviews_service_rating_range_check" CHECK ("service_rating" BETWEEN 1 AND 5),
ADD CONSTRAINT "reviews_pricing_rating_range_check" CHECK ("pricing_rating" BETWEEN 1 AND 5);
