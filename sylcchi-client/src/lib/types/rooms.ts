export interface RoomFilters {
  page?: number;
  search?: string;
  guests?: number;
  roomTypeId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  priceSort?: "asc" | "desc";
  isAvailable?: boolean;
}

export interface RoomType {
  id: string;
  name: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedRoomsResponse {
  meta: PaginationMeta;
  data: PrimaryRoom[];
}

export interface PrimaryRoomImage {
  id: string;
  roomId: string;
  imageUrl: string;
  createdAt: string;
}

export interface PrimaryRoom {
  id: string;
  name: string;
  slug: string;
  description: string;
  facilities: string[];
  rules: string[];
  price: string;
  capacity: number;
  bedType: string;
  roomTypeId: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  roomType: {
    id: string;
    name: string;
  };
  images: PrimaryRoomImage[];
}
