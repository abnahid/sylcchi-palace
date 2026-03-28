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
