"use client";

import {
  createRoom,
  deleteRoom,
  getRoomBySlug,
  getRoomTypes,
  getRooms,
  patchRoom,
  updateRoom,
} from "@/lib/api/rooms";
import { mapApiRoomsToPrimaryRooms } from "@/lib/mappers/rooms";
import {
  paginatedRoomsResponseSchema,
  roomsResponseSchema,
} from "@/lib/schemas/room";
import type {
  PaginatedRoomsResponse,
  PrimaryRoom,
  RoomFilters,
  RoomType,
} from "@/lib/types/rooms";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_ENABLED =
  Boolean(API_BASE_URL) && process.env.NEXT_PUBLIC_ENABLE_API !== "false";

export const roomQueryKeys = {
  all: ["rooms"] as const,
  list: (filters?: RoomFilters) =>
    [...roomQueryKeys.all, "list", filters ?? {}] as const,
  detail: (slug: string) => [...roomQueryKeys.all, "detail", slug] as const,
  types: () => [...roomQueryKeys.all, "types"] as const,
};

// Server-side paginated rooms — used by RoomsList page
export function usePaginatedRooms(filters: RoomFilters) {
  return useQuery<PaginatedRoomsResponse, Error>({
    queryKey: roomQueryKeys.list(filters),
    queryFn: async () => {
      if (!API_ENABLED) {
        throw new Error("Rooms API is not configured");
      }

      const raw = await getRooms(filters);
      const parsed = paginatedRoomsResponseSchema.safeParse(raw);

      if (!parsed.success) {
        throw new Error("Invalid rooms response from API");
      }

      return {
        meta: parsed.data.meta,
        data: mapApiRoomsToPrimaryRooms(parsed.data.data),
      };
    },
    staleTime: 30_000,
    gcTime: 300_000,
    placeholderData: (prev) => prev,
  });
}

// Flat list — used by home page, room detail page, booking form
export function useRooms(options?: { enabled?: boolean }) {
  return useQuery<PrimaryRoom[], Error>({
    queryKey: roomQueryKeys.list(),
    queryFn: async () => {
      if (!API_ENABLED) {
        throw new Error("Rooms API is not configured");
      }

      const raw = await getRooms();
      const parsed = roomsResponseSchema.safeParse(raw);

      if (!parsed.success) {
        throw new Error("Invalid rooms response from API");
      }

      return mapApiRoomsToPrimaryRooms(parsed.data);
    },
    enabled: options?.enabled !== false,
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnMount: "always",
    retry: (failureCount, error) => {
      if (!API_ENABLED) return false;
      if (error.message.toLowerCase().includes("invalid rooms response"))
        return false;
      return failureCount < 2;
    },
  });
}

export function useRoomTypes() {
  return useQuery<RoomType[], Error>({
    queryKey: roomQueryKeys.types(),
    queryFn: getRoomTypes,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    enabled: API_ENABLED,
  });
}

export function useRoom(slug: string, options?: { enabled?: boolean }) {
  return useQuery<unknown, Error>({
    queryKey: roomQueryKeys.detail(slug),
    queryFn: async () => getRoomBySlug(slug),
    enabled: API_ENABLED && options?.enabled !== false && Boolean(slug),
    staleTime: 60_000,
    gcTime: 300_000,
    retry: 1,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, Record<string, unknown>>({
    mutationFn: (payload) => createRoom(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roomQueryKeys.all });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    Error,
    { id: string; payload: Record<string, unknown> }
  >({
    mutationFn: ({ id, payload }) => updateRoom(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roomQueryKeys.all });
    },
  });
}

export function usePatchRoom() {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    Error,
    { id: string; payload: Record<string, unknown> }
  >({
    mutationFn: ({ id, payload }) => patchRoom(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roomQueryKeys.all });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, { id: string }>({
    mutationFn: ({ id }) => deleteRoom(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roomQueryKeys.all });
    },
  });
}
