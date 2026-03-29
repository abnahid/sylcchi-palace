export interface WishlistItem {
  id: string;
  roomId: string;
  roomSlug?: string;
  slug?: string;
  roomName: string;
  roomImage?: string;
  price: number;
  rating?: number;
  reviews?: number;
  tag?: string;
  createdAt: string;
}

export interface WishlistResponse {
  success: boolean;
  message: string;
  data?: WishlistItem[];
}

export interface AddToWishlistPayload {
  roomId: string;
}

export interface RemoveFromWishlistPayload {
  roomId: string;
}

export type AddWishlistResponse = {
  success: boolean;
  message: string;
  data?: WishlistItem;
};
