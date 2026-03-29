"use client";

import {
  cancelBooking,
  createBooking,
  getBookingById,
  getMyBookings,
  payBooking,
} from "@/lib/api/booking";
import type {
  BookingData,
  BookingPaymentResult,
  CancelBookingPayload,
  CreateBookingPayload,
  PayBookingPayload,
} from "@/lib/types/booking";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const bookingQueryKeys = {
  all: ["booking"] as const,
  myList: () => [...bookingQueryKeys.all, "my"] as const,
  details: (bookingId: string) =>
    [...bookingQueryKeys.all, "details", bookingId] as const,
};

export function useMyBookings() {
  return useQuery<BookingData[], Error>({
    queryKey: bookingQueryKeys.myList(),
    queryFn: async () => {
      const response = await getMyBookings();
      return response.data;
    },
    staleTime: 30_000,
    gcTime: 300_000,
    retry: 1,
  });
}

export function useBookingById(bookingId?: string) {
  return useQuery<BookingData, Error>({
    queryKey: bookingQueryKeys.details(bookingId ?? ""),
    queryFn: async () => {
      if (!bookingId) {
        throw new Error("Booking id is required");
      }

      const response = await getBookingById(bookingId);
      return response.data;
    },
    enabled: Boolean(bookingId),
    staleTime: 30_000,
    gcTime: 300_000,
    retry: 1,
  });
}

export function useCreateBooking() {
  return useMutation<BookingData, Error, CreateBookingPayload>({
    mutationFn: async (payload) => {
      const response = await createBooking(payload);
      return response.data;
    },
  });
}

export function usePayBooking() {
  return useMutation<
    { booking: BookingData; payment: BookingPaymentResult },
    Error,
    PayBookingPayload
  >({
    mutationFn: async (payload) => {
      const response = await payBooking(payload);
      return response.data;
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation<BookingData, Error, CancelBookingPayload>({
    mutationFn: async (payload) => {
      const response = await cancelBooking(payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(bookingQueryKeys.details(data.id), data);
      queryClient.invalidateQueries({ queryKey: bookingQueryKeys.all });
    },
  });
}
