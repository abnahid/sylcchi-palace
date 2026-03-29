import { api, toApiError } from "@/lib/api";
import type {
  UpdateProfilePayload,
  UpdateProfileResponse,
  UserResponse,
} from "@/lib/types/user";

export async function getUserProfile(): Promise<UserResponse> {
  try {
    const response = await api.get<UserResponse>("/users/profile");
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateUserProfile(
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResponse> {
  try {
    const response = await api.patch<UpdateProfileResponse>(
      "/users/profile",
      payload,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}
