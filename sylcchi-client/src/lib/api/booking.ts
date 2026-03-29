import { api, toApiError } from "@/lib/api";
import type {
  BookingData,
  BookingPaymentResult,
  BookingResponse,
  CancelBookingPayload,
  CreateBookingPayload,
  PayBookingPayload,
} from "@/lib/types/booking";

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<BookingResponse<BookingData>> {
  try {
    const response = await api.post<BookingResponse<BookingData>>(
      "/bookings/create",
      payload,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function payBooking(
  payload: PayBookingPayload,
): Promise<
  BookingResponse<{ booking: BookingData; payment: BookingPaymentResult }>
> {
  try {
    const response = await api.post<
      BookingResponse<{ booking: BookingData; payment: BookingPaymentResult }>
    >("/bookings/pay", payload);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getMyBookings(): Promise<BookingResponse<BookingData[]>> {
  try {
    const response = await api.get<BookingResponse<BookingData[]>>(
      "/bookings/my",
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getBookingById(
  bookingId: string,
): Promise<BookingResponse<BookingData>> {
  try {
    const response = await api.get<BookingResponse<BookingData>>(
      `/bookings/${bookingId}`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function verifyStripePayment(
  sessionId: string,
): Promise<BookingResponse<{ updated: boolean }>> {
  try {
    const response = await api.post<BookingResponse<{ updated: boolean }>>(
      "/bookings/verify-payment",
      { sessionId },
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function cancelBooking(
  payload: CancelBookingPayload,
): Promise<BookingResponse<BookingData>> {
  try {
    const response = await api.post<BookingResponse<BookingData>>(
      "/bookings/cancel",
      payload,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}
