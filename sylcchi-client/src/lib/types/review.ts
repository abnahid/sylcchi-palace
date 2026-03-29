export interface ReviewRatings {
  location: number;
  comfort: number;
  service: number;
  pricing: number;
}

export interface Review {
  id: string;
  rating: number;
  locationRating: number;
  comfortRating: number;
  serviceRating: number;
  pricingRating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

export interface ReviewStats {
  total: number;
  averageRating: number;
}

export interface RoomReviewsResponse {
  success: boolean;
  message: string;
  data: {
    stats: ReviewStats;
    reviews: Review[];
  };
}

export interface ReviewEligibility {
  canSubmit: boolean;
  reason: "ELIGIBLE" | "LOGIN_REQUIRED" | "NO_COMPLETED_BOOKING";
  message: string;
}

export interface ReviewEligibilityResponse {
  success: boolean;
  message: string;
  data: ReviewEligibility;
}

export interface SubmitReviewPayload {
  ratings: ReviewRatings;
  comment?: string;
}

export interface SubmitReviewResponse {
  success: boolean;
  message: string;
  data: {
    review: Review;
    action: "created" | "updated";
  };
}
