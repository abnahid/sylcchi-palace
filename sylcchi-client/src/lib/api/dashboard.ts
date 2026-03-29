import { api, toApiError } from "@/lib/api";
import type {
  AddRoomImagesByUrlPayload,
  AdminUserListResponse,
  AdminUserResponse,
  AllBookingsParams,
  AllBookingsResponse,
  CheckinCompletePayload,
  CheckinCompleteResponse,
  CheckinLookupPayload,
  CheckinLookupResponse,
  CheckinVerifyOtpPayload,
  CheckinVerifyOtpResponse,
  CompleteRefundPayload,
  CreateRoomTypePayload,
  DashboardStatsResponse,
  PaymentsListParams,
  PaymentsListResponse,
  RefundResponse,
  RevenueAnalyticsResponse,
  RoomImagesResponse,
  RoomTypeResponse,
  UpdateUserPayload,
} from "@/lib/types/dashboard";

// ── Statistics ──

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  try {
    const response = await api.get<DashboardStatsResponse>(
      "/statistics/dashboard",
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getRevenueAnalytics(
  months = 12,
): Promise<RevenueAnalyticsResponse> {
  try {
    const response = await api.get<RevenueAnalyticsResponse>(
      `/statistics/revenue?months=${months}`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

// ── User management (admin) ──

export async function getUsers(): Promise<AdminUserListResponse> {
  try {
    const response = await api.get<AdminUserListResponse>("/users");
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getUserById(id: string): Promise<AdminUserResponse> {
  try {
    const response = await api.get<AdminUserResponse>(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<AdminUserResponse> {
  try {
    const response = await api.patch<AdminUserResponse>(
      `/users/${id}`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function deleteUser(id: string): Promise<AdminUserResponse> {
  try {
    const response = await api.delete<AdminUserResponse>(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

// ── Room types (admin) ──

export async function createRoomType(
  payload: CreateRoomTypePayload,
): Promise<RoomTypeResponse> {
  try {
    const response = await api.post<RoomTypeResponse>("/rooms/types", payload);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

// ── Room images ──

export async function getRoomImages(
  roomId: string,
): Promise<RoomImagesResponse> {
  try {
    const response = await api.get<RoomImagesResponse>(
      `/rooms/${roomId}/images`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function addRoomImagesByUrl(
  roomId: string,
  payload: AddRoomImagesByUrlPayload,
): Promise<RoomImagesResponse> {
  try {
    const response = await api.post<RoomImagesResponse>(
      `/rooms/${roomId}/images/urls`,
      payload,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function uploadRoomImages(
  roomId: string,
  formData: FormData,
): Promise<RoomImagesResponse> {
  try {
    const response = await api.post<RoomImagesResponse>(
      `/rooms/${roomId}/images/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function deleteRoomImage(
  roomId: string,
  imageId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/rooms/${roomId}/images/${imageId}`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

// ── Payments (admin) ──

export async function getPayments(
  params?: PaymentsListParams,
): Promise<PaymentsListResponse> {
  try {
    const query: Record<string, string> = {};
    if (params?.page) query.page = String(params.page);
    if (params?.limit) query.limit = String(params.limit);
    if (params?.status) query.status = params.status;
    if (params?.paymentMethod) query.paymentMethod = params.paymentMethod;
    if (params?.search) query.search = params.search;

    const response = await api.get<PaymentsListResponse>("/payments", {
      params: query,
    });
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

// ── All bookings (admin) ──

export async function getAllBookings(
  params?: AllBookingsParams,
): Promise<AllBookingsResponse> {
  try {
    const query: Record<string, string> = {};
    if (params?.page) query.page = String(params.page);
    if (params?.limit) query.limit = String(params.limit);
    if (params?.status) query.status = params.status;
    if (params?.paymentStatus) query.paymentStatus = params.paymentStatus;
    if (params?.search) query.search = params.search;

    const response = await api.get<AllBookingsResponse>("/bookings/all", {
      params: query,
    });
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

// ── Refunds (admin) ──

export async function completeRefund(
  payload: CompleteRefundPayload,
): Promise<RefundResponse> {
  try {
    const response = await api.post<RefundResponse>(
      "/bookings/refund/complete",
      payload,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

// ── Check-in ──

export async function checkinLookup(
  payload: CheckinLookupPayload,
): Promise<CheckinLookupResponse> {
  try {
    const response = await api.post<CheckinLookupResponse>(
      "/checkin/lookup",
      {
        bookingCode: payload.bookingCode,
        email: payload.identity,
      },
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function checkinVerifyOtp(
  payload: CheckinVerifyOtpPayload,
): Promise<CheckinVerifyOtpResponse> {
  try {
    const response = await api.post<CheckinVerifyOtpResponse>(
      "/checkin/verify-otp",
      {
        bookingCode: payload.bookingCode,
        email: payload.identity,
        otp: payload.otp,
      },
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function checkinComplete(
  payload: CheckinCompletePayload,
): Promise<CheckinCompleteResponse> {
  try {
    const response = await api.post<CheckinCompleteResponse>(
      "/checkin/complete",
      payload,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function checkoutGuest(
  reservationId: string,
): Promise<{ success: boolean; message: string; data: unknown }> {
  try {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: unknown;
    }>("/checkin/checkout", { reservationId });
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getCheckinStatus(
  reservationId: string,
): Promise<{ success: boolean; message: string; data: unknown }> {
  try {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: unknown;
    }>(`/checkin/status/${reservationId}`);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function uploadCheckinDocuments(
  formData: FormData,
): Promise<{ success: boolean; message: string; data: { urls: string[] } }> {
  try {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: { urls: string[] };
    }>("/checkin/upload-documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}
