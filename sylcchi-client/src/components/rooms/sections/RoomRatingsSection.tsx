"use client";

import { useRoomReviews } from "@/hooks/useReviews";
import { Loader2, Star } from "lucide-react";

type RoomRatingsSectionProps = {
  roomId: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  location: "Location",
  comfort: "Comfort",
  service: "Service",
  pricing: "Pricing",
};

const RoomRatingsSection = ({ roomId }: RoomRatingsSectionProps) => {
  const { data, isLoading } = useRoomReviews(roomId);

  if (isLoading) {
    return (
      <section className="bg-[#f7fafd] dark:bg-[#0a1622] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-[#808385] dark:text-[#7d8a96]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading ratings...
          </div>
        </div>
      </section>
    );
  }

  if (!data || data.stats.total === 0) {
    return (
      <section className="bg-[#f7fafd] dark:bg-[#0a1622] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl rounded-lg bg-white dark:bg-[#101e2e] p-6 shadow-[0_2px_24px_0_rgba(30,49,66,0.08)] dark:shadow-none">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-[#d9e3ee] dark:text-[#3a4a5a]" />
              <div>
                <p className="font-mulish text-base font-bold text-[#101b25] dark:text-white">
                  No reviews yet
                </p>
                <p className="font-open-sans text-sm text-[#5b6774] dark:text-[#9aa5b0]">
                  Be the first to share your experience at this room.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const { stats, reviews } = data;

  // Calculate average per category from all reviews
  const categoryAverages =
    reviews.length > 0
      ? {
          location:
            reviews.reduce((sum, r) => sum + r.locationRating, 0) /
            reviews.length,
          comfort:
            reviews.reduce((sum, r) => sum + r.comfortRating, 0) /
            reviews.length,
          service:
            reviews.reduce((sum, r) => sum + r.serviceRating, 0) /
            reviews.length,
          pricing:
            reviews.reduce((sum, r) => sum + r.pricingRating, 0) /
            reviews.length,
        }
      : { location: 0, comfort: 0, service: 0, pricing: 0 };

  return (
    <section className="bg-[#f7fafd] dark:bg-[#0a1622] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl rounded-lg bg-white dark:bg-[#101e2e] p-12 shadow-[0_2px_24px_0_rgba(30,49,66,0.08)] dark:shadow-none">
          <div className="flex items-end gap-3">
            <p className="font-mulish text-5xl font-extrabold text-[#101b25] dark:text-white">
              {stats.averageRating.toFixed(1)}
              <span className="text-base font-normal text-[#5b6774] dark:text-[#9aa5b0]">/5</span>
            </p>
            <p className="pb-1 font-open-sans text-sm text-[#5b6774] dark:text-[#9aa5b0]">
              Based on {stats.total} review{stats.total !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {Object.entries(categoryAverages).map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-[74px_1fr_30px] items-center gap-3"
              >
                <span className="font-open-sans text-sm text-[#5b6774] dark:text-[#9aa5b0]">
                  {CATEGORY_LABELS[key]}
                </span>
                <div className="h-1.5 rounded-full bg-[#d9e3ee] dark:bg-[#243443]">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${(value / 5) * 100}%` }}
                  />
                </div>
                <span className="text-right font-open-sans text-sm text-[#5b6774] dark:text-[#9aa5b0]">
                  {value.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoomRatingsSection;
