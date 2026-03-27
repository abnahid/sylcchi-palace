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

const baseRoom: PrimaryRoom = {
  id: "f120bdfd-5d8c-4eb8-88ae-c196054f8319",
  name: "Deluxe King Suite",
  slug: "deluxe-king-suite",
  description:
    "Spacious premium suite featuring a panoramic sea view, private balcony, marble en-suite bathroom, and dedicated seating area.",
  facilities: [
    "King-size bed",
    "Free High-speed WiFi",
    "Minibar",
    "55-inch Smart TV",
    "Room Service",
    "Free Parking",
  ],
  rules: [
    "Check-in from 14:00",
    "Check-out by 11:00",
    "No smoking indoors",
    "Pets not allowed",
    "Government-issued ID required",
  ],
  price: "249.99",
  capacity: 2,
  bedType: "King",
  roomTypeId: "b11039cb-884e-4436-b1d2-feb65fc99667",
  isAvailable: true,
  createdAt: "2026-03-24T20:39:19.750Z",
  updatedAt: "2026-03-24T20:39:19.750Z",
  roomType: {
    id: "b11039cb-884e-4436-b1d2-feb65fc99667",
    name: "Luxury",
  },
  images: [
    {
      id: "d2a9f7c1-3b4e-4d8a-8c1f-6b7e2a9c5d44",
      roomId: "f120bdfd-5d8c-4eb8-88ae-c196054f8319",
      imageUrl:
        "https://i.ibb.co.com/m5v2LHcP/Luxury-hotel-couple-202603250138.jpg",
      createdAt: "2026-03-25T03:09:41.000Z",
    },
    {
      id: "a7d3c2b1-5e8f-4d2a-9b1c-7f6e3d2c1a99",
      roomId: "f120bdfd-5d8c-4eb8-88ae-c196054f8319",
      imageUrl:
        "https://i.ibb.co.com/xSkxbfyM/Hotel-room-seating-202603250138.jpg",
      createdAt: "2026-03-25T03:08:30.000Z",
    },
    {
      id: "c3b8c4f2-6c2f-4c5b-9a72-1d9a4f7e8b61",
      roomId: "f120bdfd-5d8c-4eb8-88ae-c196054f8319",
      imageUrl:
        "https://i.ibb.co.com/76v62jB/Hotel-bathroom-marble-202603250138.jpg",
      createdAt: "2026-03-25T03:07:40.000Z",
    },
  ],
};

// Primary editable dataset: duplicated 3 times as requested.
export const primaryRooms: PrimaryRoom[] = [1, 2, 3].map((index) => {
  const roomId = `${baseRoom.id}-${index}`;

  return {
    ...baseRoom,
    id: roomId,
    slug: `${baseRoom.slug}-${index}`,
    name: `${baseRoom.name} ${index}`,
    images: baseRoom.images.map((image) => ({
      ...image,
      id: `${image.id}-${index}`,
      roomId,
    })),
  };
});

export type RoomGalleryItem = {
  id: string;
  title: string;
  category: string;
  image: string;
};

export const roomGalleryItems: RoomGalleryItem[] = primaryRooms.flatMap(
  (room) =>
    room.images.map((image) => ({
      id: image.id,
      title: room.name,
      category: room.roomType.name,
      image: image.imageUrl,
    })),
);

export const roomGalleryCategories = [
  "All",
  ...new Set(roomGalleryItems.map((item) => item.category)),
];

export type HomeRoomCard = {
  id: string;
  name: string;
  image: string;
  sleeps: number;
  bedLabel: string;
  price: number;
};

export const homeRoomCards: HomeRoomCard[] = primaryRooms.map((room) => ({
  id: room.id,
  name: room.name,
  image: room.images[0]?.imageUrl ?? "/assets/homa-hero.webp",
  sleeps: room.capacity,
  bedLabel: `${room.bedType} bed`,
  price: Number.parseFloat(room.price),
}));
