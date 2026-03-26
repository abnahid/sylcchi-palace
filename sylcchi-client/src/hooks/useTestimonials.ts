"use client";

import { getTestimonials } from "@/lib/api/testimonials";
import {
  testimonialsResponseSchema,
  type TestimonialsResponse,
} from "@/lib/schemas/testimonial";
import { useQuery } from "@tanstack/react-query";

export const testimonialQueryKeys = {
  all: ["testimonials"] as const,
  list: () => [...testimonialQueryKeys.all, "list"] as const,
};

export function useTestimonials() {
  return useQuery<TestimonialsResponse, Error>({
    queryKey: testimonialQueryKeys.list(),
    queryFn: async () => {
      const raw = await getTestimonials();
      const parsed = testimonialsResponseSchema.safeParse(raw);

      if (!parsed.success) {
        throw new Error("Invalid testimonials response from API");
      }

      return parsed.data;
    },
    staleTime: 60_000,
    gcTime: 300_000,
    retry: (failureCount, error) => {
      if (
        error.message.toLowerCase().includes("invalid testimonials response")
      ) {
        return false;
      }

      return failureCount < 2;
    },
  });
}
