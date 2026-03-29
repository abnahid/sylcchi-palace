export interface WishlistItem {
  id: string;
  roomId?: string;
  roomSlug?: string;
  slug?: string;
  roomName?: string;
  roomImage?: string;
  price?: number | string;
  rating?: number;
  reviews?: number;
  tag?: string;
  createdAt: string;
  room?: {
    id?: string;
    slug?: string;
    name?: string;
    price?: number | string;
    pricePerNight?: number;
    averageRating?: number;
    reviewCount?: number;
    roomType?: {
      name?: string;
    };
    images?: Array<{
      imageUrl?: string;
    }>;
  };
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
