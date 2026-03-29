"use client";

import {
  useReviewEligibility,
  useRoomReviews,
  useSubmitReview,
} from "@/hooks/useReviews";
import type { ReviewRatings } from "@/lib/types/review";
import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  LogIn,
  MessageSquare,
  Star,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type RoomCommentsSectionProps = {
  roomId: string;
};

const RATING_CATEGORIES: { key: keyof ReviewRatings; label: string }[] = [
  { key: "location", label: "Location" },
  { key: "comfort", label: "Comfort" },
  { key: "service", label: "Service" },
  { key: "pricing", label: "Pricing" },
];

function StarRating({
  value,
  onChange,
  readonly,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={
            readonly
              ? "cursor-default"
              : "cursor-pointer transition-transform hover:scale-110"
          }
        >
          <Star
            size={16}
            className={
              star <= value ? "fill-amber-400 text-amber-400" : "text-gray-200"
            }
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(value: string): string {
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}

const RoomCommentsSection = ({ roomId }: RoomCommentsSectionProps) => {
  const { data, isLoading } = useRoomReviews(roomId);
  const { data: eligibility } = useReviewEligibility(roomId);
  const submitMutation = useSubmitReview(roomId);

  const [ratings, setRatings] = useState<ReviewRatings>({
    location: 0,
    comfort: 0,
    service: 0,
    pricing: 0,
  });
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const reviews = data?.reviews ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const hasAllRatings = Object.values(ratings).every((v) => v >= 1);
    if (!hasAllRatings) {
      setFormError("Please rate all categories (1-5 stars each).");
      return;
    }

    try {
      await submitMutation.mutateAsync({
        ratings,
        comment: comment.trim() || undefined,
      });
      setSubmitted(true);
      setComment("");
      setRatings({ location: 0, comfort: 0, service: 0, pricing: 0 });
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to submit review.",
      );
    }
  };

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Reviews list */}
        <h2 className="font-mulish text-3xl font-extrabold text-[#101b25]">
          Guest Reviews
          {data && data.stats.total > 0 && (
            <span className="ml-2 font-open-sans text-base font-normal text-[#5b6774]">
              ({data.stats.total})
            </span>
          )}
        </h2>

        {isLoading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-[#808385]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-dashed border-[#d7e4f1] p-6">
            <MessageSquare className="h-6 w-6 text-[#d9e3ee]" />
            <p className="font-open-sans text-sm text-[#5b6774]">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        ) : (
          <div className="mt-6 max-w-3xl space-y-4">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="border-l-2 border-[#d7e4f1] bg-white p-8 shadow-[0_1px_14px_0_rgba(30,49,66,0.08)]"
              >
                <div className="flex gap-4">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#DDEAF6]">
                    {review.user.image ? (
                      <Image
                        src={review.user.image}
                        alt={review.user.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User size={22} className="text-[#235784]" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-mulish text-base font-bold text-[#101b25]">
                        {review.user.name}
                      </h3>
                      <span className="font-open-sans text-xs text-[#8d98a5]">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <StarRating value={review.rating} readonly />
                      <span className="font-open-sans text-xs font-bold text-[#5b6774]">
                        {review.rating}/5
                      </span>
                    </div>

                    {review.comment && (
                      <p className="mt-3 font-open-sans text-sm leading-relaxed text-[#5b6774]">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Review form */}
        <h2 className="mt-10 font-mulish text-3xl font-extrabold text-[#101b25]">
          Leave a Review
        </h2>

        {submitted && (
          <div className="mt-4 flex max-w-3xl items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle className="h-4 w-4" /> Your review has been submitted
            successfully!
          </div>
        )}

        {eligibility?.reason === "LOGIN_REQUIRED" && (
          <div className="mt-4 max-w-3xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="flex items-center gap-2 font-open-sans text-sm text-amber-700">
              <LogIn className="h-4 w-4" />
              Please{" "}
              <Link
                href="/login"
                className="font-bold underline hover:text-amber-900"
              >
                sign in
              </Link>{" "}
              to leave a review.
            </p>
          </div>
        )}

        {eligibility?.reason === "NO_COMPLETED_BOOKING" && (
          <div className="mt-4 max-w-3xl rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="font-open-sans text-sm text-blue-700">
              {eligibility.message}
            </p>
          </div>
        )}

        {eligibility?.canSubmit && !submitted && (
          <form onSubmit={handleSubmit} className="mt-5 max-w-3xl space-y-5">
            {/* Rating categories */}
            <div className="grid grid-cols-1 gap-4 rounded-lg border border-[#e8edf2] bg-[#f7fafd] p-4 sm:grid-cols-2">
              {RATING_CATEGORIES.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="font-open-sans text-sm text-[#5b6774]">
                    {label}
                  </span>
                  <StarRating
                    value={ratings[key]}
                    onChange={(v) =>
                      setRatings((prev) => ({ ...prev, [key]: v }))
                    }
                  />
                </div>
              ))}
            </div>

            {/* Comment */}
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience (optional)..."
              className="w-full resize-none rounded-md border border-[#cbd4de] bg-white px-4 py-3 font-open-sans text-sm outline-none focus:border-primary"
            />

            {formError && (
              <p className="flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" /> {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 font-mulish text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default RoomCommentsSection;
