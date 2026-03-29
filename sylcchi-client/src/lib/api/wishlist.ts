import { api, toApiError } from "@/lib/api";
import type {
  AddToWishlistPayload,
  AddWishlistResponse,
  WishlistResponse,
} from "@/lib/types/wishlist";

export async function getWishlist(): Promise<WishlistResponse> {
  try {
    const response = await api.get<WishlistResponse>("/wishlist");
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function addToWishlist(
  payload: AddToWishlistPayload,
): Promise<AddWishlistResponse> {
  try {
    const response = await api.post<AddWishlistResponse>("/wishlist", payload);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function removeFromWishlist(
  roomId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/wishlist/${roomId}`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}
