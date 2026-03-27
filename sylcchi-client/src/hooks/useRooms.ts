"use client";

import { getRooms } from "@/lib/api/rooms";
import { roomsResponseSchema, type RoomsResponse } from "@/lib/schemas/room";
import { useQuery } from "@tanstack/react-query";

const API_ENABLED = process.env.NEXT_PUBLIC_ENABLE_API === "true";

const fallbackRooms: RoomsResponse = [
  {
    id: "6-bed-shared",
    name: "Bed in 6-Bed Room with Shared Bathroom",
    slug: "6-bed-shared",
    pricePerNight: 18,
    capacity: 1,
    images: ["/assets/homa-hero.webp"],
    facilities: ["Free WiFi", "Air Conditioning"],
    rules: ["No smoking"],
    isAvailable: true,
  },
  {
    id: "double-private",
    name: "Double Room with Private Bathroom",
    slug: "double-private",
    pricePerNight: 35,
    capacity: 2,
    images: ["/assets/homa-hero.webp"],
    facilities: ["Free WiFi", "Private Bathroom"],
    rules: ["No smoking"],
    isAvailable: true,
  },
];

export const roomQueryKeys = {
  all: ["rooms"] as const,
  list: () => [...roomQueryKeys.all, "list"] as const,
};

type UseRoomsOptions = {
  enabled?: boolean;
};

export function useRooms(options?: UseRoomsOptions) {
  return useQuery<RoomsResponse, Error>({
    queryKey: roomQueryKeys.list(),
    queryFn: async () => {
      if (!API_ENABLED) {
        return fallbackRooms;
      }

      const raw = await getRooms();
      const parsed = roomsResponseSchema.safeParse(raw);

      if (!parsed.success) {
        throw new Error("Invalid rooms response from API");
      }

      return parsed.data;
    },
    enabled: API_ENABLED && options?.enabled !== false,
    initialData: fallbackRooms,
    staleTime: 60_000,
    gcTime: 300_000,
    retry: (failureCount, error) => {
      if (!API_ENABLED) {
        return false;
      }

      if (error.message.toLowerCase().includes("invalid rooms response")) {
        return false;
      }

      return failureCount < 2;
    },
  });
}
