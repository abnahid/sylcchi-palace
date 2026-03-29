"use client";

import {
  addRoomImagesByUrl,
  checkinComplete,
  checkinLookup,
  checkinVerifyOtp,
  checkoutGuest,
  completeRefund,
  createRoomType,
  deleteRoomImage,
  deleteUser,
  getAllBookings,
  getDashboardStats,
  getPayments,
  getRevenueAnalytics,
  getRoomImages,
  getUsers,
  updateUser,
  uploadRoomImages,
} from "@/lib/api/dashboard";
import { createRoom, deleteRoom, getRooms, getRoomTypes, patchRoom } from "@/lib/api/rooms";
import type {
  AddRoomImagesByUrlPayload,
  AdminBookingData,
  AdminUserListResponse,
  AllBookingsParams,
  CheckinCompletePayload,
  CheckinLookupPayload,
  CheckinVerifyOtpPayload,
  CompleteRefundPayload,
  CreateRoomTypePayload,
  DashboardStatsResponse,
  PaymentRecord,
  PaymentsListParams,
  PrimaryRoom,
  PrimaryRoomImage,
  RevenueDataPoint,
  RoomType,
  RoomsListResponse,
  UpdateRoomPayload,
  UpdateUserPayload,
  UserProfile,
  BookingData,
} from "@/lib/types/dashboard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Query keys ──

export const dashboardKeys = {
  all: ["dashboard"] as const,
  users: () => [...dashboardKeys.all, "users"] as const,
  rooms: (params?: Record<string, string>) =>
    [...dashboardKeys.all, "rooms", params] as const,
  roomTypes: () => [...dashboardKeys.all, "roomTypes"] as const,
  roomImages: (roomId: string) =>
    [...dashboardKeys.all, "roomImages", roomId] as const,
  bookings: () => [...dashboardKeys.all, "bookings"] as const,
  payments: () => [...dashboardKeys.all, "payments"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  revenue: (months: number) => [...dashboardKeys.all, "revenue", months] as const,
  overview: () => [...dashboardKeys.all, "overview"] as const,
};

// ── Users (admin) ──

export function useAdminUsers() {
  return useQuery<UserProfile[], Error>({
    queryKey: dashboardKeys.users(),
    queryFn: async () => {
      const response = await getUsers();
      return response.data.data;
    },
    staleTime: 60_000,
    gcTime: 300_000,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<
    UserProfile,
    Error,
    { id: string; payload: UpdateUserPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const response = await updateUser(id, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.users() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, Error, string>({
    mutationFn: async (id) => {
      const response = await deleteUser(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.users() });
    },
  });
}

// ── Rooms ──

export function useDashboardRooms(params?: Record<string, string>) {
  return useQuery<RoomsListResponse["data"], Error>({
    queryKey: dashboardKeys.rooms(params),
    queryFn: async () => {
      const response = (await getRooms(params)) as RoomsListResponse;
      return response.data;
    },
    staleTime: 30_000,
    gcTime: 300_000,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, Record<string, unknown>>({
    mutationFn: async (payload) => {
      return await createRoom(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.rooms() });
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
    mutationFn: async ({ id, payload }) => {
      return await patchRoom(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.rooms() });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: async (id) => {
      return await deleteRoom(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.rooms() });
    },
  });
}

// ── Room Types ──

export function useDashboardRoomTypes() {
  return useQuery<RoomType[], Error>({
    queryKey: dashboardKeys.roomTypes(),
    queryFn: getRoomTypes,
    staleTime: 60_000,
  });
}

export function useCreateRoomType() {
  const queryClient = useQueryClient();

  return useMutation<RoomType, Error, CreateRoomTypePayload>({
    mutationFn: async (payload) => {
      const response = await createRoomType(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.roomTypes() });
    },
  });
}

// ── Room Images ──

export function useRoomImages(roomId: string) {
  return useQuery<PrimaryRoomImage[], Error>({
    queryKey: dashboardKeys.roomImages(roomId),
    queryFn: async () => {
      const response = await getRoomImages(roomId);
      return response.data;
    },
    enabled: Boolean(roomId),
    staleTime: 30_000,
  });
}

export function useAddRoomImagesByUrl() {
  const queryClient = useQueryClient();

  return useMutation<
    PrimaryRoomImage[],
    Error,
    { roomId: string; payload: AddRoomImagesByUrlPayload }
  >({
    mutationFn: async ({ roomId, payload }) => {
      const response = await addRoomImagesByUrl(roomId, payload);
      return response.data;
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.roomImages(roomId),
      });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.rooms() });
    },
  });
}

export function useUploadRoomImages() {
  const queryClient = useQueryClient();

  return useMutation<
    PrimaryRoomImage[],
    Error,
    { roomId: string; formData: FormData }
  >({
    mutationFn: async ({ roomId, formData }) => {
      const response = await uploadRoomImages(roomId, formData);
      return response.data;
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.roomImages(roomId),
      });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.rooms() });
    },
  });
}

export function useDeleteRoomImage() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { roomId: string; imageId: string }>({
    mutationFn: async ({ roomId, imageId }) => {
      await deleteRoomImage(roomId, imageId);
    },
    onSuccess: (_, { roomId }) => {
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.roomImages(roomId),
      });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.rooms() });
    },
  });
}

// ── Statistics ──

export function useDashboardStats() {
  return useQuery<DashboardStatsResponse["data"], Error>({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      const response = await getDashboardStats();
      return response.data;
    },
    staleTime: 60_000,
    gcTime: 300_000,
  });
}

export function useRevenueAnalytics(months = 12) {
  return useQuery<RevenueDataPoint[], Error>({
    queryKey: dashboardKeys.revenue(months),
    queryFn: async () => {
      const response = await getRevenueAnalytics(months);
      return response.data;
    },
    staleTime: 60_000,
    gcTime: 300_000,
  });
}

// ── Payments (admin) ──

export function usePayments(params?: PaymentsListParams) {
  return useQuery<
    { meta: { total: number; page: number; limit: number; totalPages: number }; data: PaymentRecord[] },
    Error
  >({
    queryKey: [...dashboardKeys.payments(), params],
    queryFn: async () => {
      const response = await getPayments(params);
      return response.data;
    },
    staleTime: 30_000,
    gcTime: 300_000,
  });
}

// ── Bookings (admin — all bookings) ──

export function useAllBookings(params?: AllBookingsParams) {
  return useQuery<
    { meta: { total: number; page: number; limit: number; totalPages: number }; data: AdminBookingData[] },
    Error
  >({
    queryKey: [...dashboardKeys.bookings(), params],
    queryFn: async () => {
      const response = await getAllBookings(params);
      return response.data;
    },
    staleTime: 30_000,
    gcTime: 300_000,
  });
}

// ── Refunds (admin) ──

export function useCompleteRefund() {
  const queryClient = useQueryClient();

  return useMutation<BookingData, Error, CompleteRefundPayload>({
    mutationFn: async (payload) => {
      const response = await completeRefund(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.bookings() });
    },
  });
}

// ── Check-in ──

export function useCheckinLookup() {
  return useMutation({
    mutationFn: async (payload: CheckinLookupPayload) => {
      const response = await checkinLookup(payload);
      return response.data;
    },
  });
}

export function useCheckinVerifyOtp() {
  return useMutation({
    mutationFn: async (payload: CheckinVerifyOtpPayload) => {
      return await checkinVerifyOtp(payload);
    },
  });
}

export function useCheckinComplete() {
  return useMutation({
    mutationFn: async (payload: CheckinCompletePayload) => {
      const response = await checkinComplete(payload);
      return response.data;
    },
  });
}

export function useCheckoutGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationId: string) => {
      const response = await checkoutGuest(reservationId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.bookings() });
    },
  });
}
