export type GalleryCategory =
  | "All"
  | "Apartment"
  | "Standard Room"
  | "Kitchen"
  | "Living Room";

export interface GalleryItem {
  id: number;
  title: string;
  category: GalleryCategory;
  image: string;
}

export const galleryCategories: GalleryCategory[] = [
  "All",
  "Apartment",
  "Standard Room",
  "Kitchen",
  "Living Room",
];

export const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: "Luxury Apartment View",
    category: "Apartment",
    image: "/Gallery/room-1.webp",
  },
  {
    id: 2,
    title: "Poolside Lounge",
    category: "Living Room",
    image: "/Gallery/room-2.webp",
  },
  {
    id: 3,
    title: "Beachfront Resort",
    category: "Standard Room",
    image: "/Gallery/room-3.webp",
  },
  {
    id: 4,
    title: "Fine Dining Experience",
    category: "Kitchen",
    image: "/Gallery/room-4.webp",
  },
  {
    id: 5,
    title: "Deluxe Suite",
    category: "Apartment",
    image: "/Gallery/room-5.webp",
  },
  {
    id: 6,
    title: "Standard Comfort Room",
    category: "Standard Room",
    image: "/Gallery/room-6.webp",
  },
  {
    id: 7,
    title: "Modern Kitchen",
    category: "Kitchen",
    image: "/Gallery/room-7.webp",
  },
];
