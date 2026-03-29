import { api, toApiError } from "@/lib/api";
import type {
  ReviewEligibilityResponse,
  RoomReviewsResponse,
  SubmitReviewPayload,
  SubmitReviewResponse,
} from "@/lib/types/review";

export async function getRoomReviews(
  roomId: string,
): Promise<RoomReviewsResponse> {
  try {
    const response = await api.get<RoomReviewsResponse>(
      `/rooms/${roomId}/reviews`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getReviewEligibility(
  roomId: string,
): Promise<ReviewEligibilityResponse> {
  try {
    const response = await api.get<ReviewEligibilityResponse>(
      `/rooms/${roomId}/reviews/eligibility`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function submitReview(
  roomId: string,
  payload: SubmitReviewPayload,
): Promise<SubmitReviewResponse> {
  try {
    const response = await api.post<SubmitReviewResponse>(
      `/rooms/${roomId}/reviews`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}
