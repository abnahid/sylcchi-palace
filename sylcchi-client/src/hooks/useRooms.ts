"use client";

import { getRooms } from "@/lib/api/rooms";
import { roomsResponseSchema, type RoomsResponse } from "@/lib/schemas/room";
import { useQuery } from "@tanstack/react-query";

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
      const raw = await getRooms();
      const parsed = roomsResponseSchema.safeParse(raw);

      if (!parsed.success) {
        throw new Error("Invalid rooms response from API");
      }

      return parsed.data;
    },
    enabled: options?.enabled,
    staleTime: 60_000,
    gcTime: 300_000,
    retry: (failureCount, error) => {
      if (error.message.toLowerCase().includes("invalid rooms response")) {
        return false;
      }

      return failureCount < 2;
    },
  });
}
