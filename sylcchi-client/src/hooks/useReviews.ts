"use client";

import {
  getReviewEligibility,
  getRoomReviews,
  submitReview,
} from "@/lib/api/review";
import type {
  Review,
  ReviewEligibility,
  ReviewStats,
  SubmitReviewPayload,
  SubmitReviewResponse,
} from "@/lib/types/review";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const reviewQueryKeys = {
  all: ["reviews"] as const,
  room: (roomId: string) => [...reviewQueryKeys.all, "room", roomId] as const,
  eligibility: (roomId: string) =>
    [...reviewQueryKeys.all, "eligibility", roomId] as const,
};

export function useRoomReviews(roomId: string) {
  return useQuery<{ stats: ReviewStats; reviews: Review[] }, Error>({
    queryKey: reviewQueryKeys.room(roomId),
    queryFn: async () => {
      const res = await getRoomReviews(roomId);
      return res.data;
    },
    enabled: Boolean(roomId),
    staleTime: 60_000,
  });
}

export function useReviewEligibility(roomId: string) {
  return useQuery<ReviewEligibility, Error>({
    queryKey: reviewQueryKeys.eligibility(roomId),
    queryFn: async () => {
      const res = await getReviewEligibility(roomId);
      return res.data;
    },
    enabled: Boolean(roomId),
    staleTime: 60_000,
    retry: false,
  });
}

export function useSubmitReview(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation<SubmitReviewResponse, Error, SubmitReviewPayload>({
    mutationFn: (payload) => submitReview(roomId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reviewQueryKeys.room(roomId),
      });
      queryClient.invalidateQueries({
        queryKey: reviewQueryKeys.eligibility(roomId),
      });
    },
  });
}
