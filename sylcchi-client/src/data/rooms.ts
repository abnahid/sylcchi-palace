export type HomeRoomCard = {
  id: string;
  slug: string;
  name: string;
  image: string;
  sleeps: number;
  bedLabel: string;
  price: number;
};

export const homeRoomCards: HomeRoomCard[] = [
  {
    id: "3972e44e-ad34-4233-a240-de125c1a9dfd",
    slug: "the-velvet-horizon",
    name: "The Velvet Horizon",
    image: "/Gallery/room-1.webp",
    sleeps: 2,
    bedLabel: "King bed",
    price: 229.99,
  },
  {
    id: "f120bdfd-5d8c-4eb8-88ae-c196054f8319",
    slug: "deluxe-king-suite",
    name: "Deluxe King Suite",
    image: "https://i.ibb.co/m5v2LHcP/Luxury-hotel-couple-202603250138.jpg",
    sleeps: 2,
    bedLabel: "King bed",
    price: 249.99,
  },
];

export type HomePhotoGalleryItem = {
  id: string;
  title: string;
  category: string;
  image: string;
};

export const homePhotoGalleryItems: HomePhotoGalleryItem[] = [
  {
    id: "velvet-horizon-gallery-1",
    title: "The Velvet Horizon",
    category: "Luxury",
    image: "/Gallery/room-1.webp",
  },
  {
    id: "velvet-horizon-gallery-2",
    title: "The Velvet Horizon",
    category: "Luxury",
    image: "/Gallery/room-2.webp",
  },
  {
    id: "deluxe-king-gallery-1",
    title: "Deluxe King Suite",
    category: "Luxury",
    image: "https://i.ibb.co/xSkxbfyM/Hotel-room-seating-202603250138.jpg",
  },
  {
    id: "deluxe-king-gallery-2",
    title: "Deluxe King Suite",
    category: "Luxury",
    image: "https://i.ibb.co/76v62jB/Hotel-bathroom-marble-202603250138.jpg",
  },
  {
    id: "deluxe-king-gallery-3",
    title: "Deluxe King Suite",
    category: "Luxury",
    image: "https://i.ibb.co/m5v2LHcP/Luxury-hotel-couple-202603250138.jpg",
  },
];

export const homePhotoGalleryCategories: string[] = [
  "All",
  ...new Set(homePhotoGalleryItems.map((item) => item.category)),
];
