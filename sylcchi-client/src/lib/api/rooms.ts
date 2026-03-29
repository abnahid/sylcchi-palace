import { api, toApiError } from "@/lib/api";
import type { RoomFilters, RoomType } from "@/lib/types/rooms";

export async function getRooms(filters?: RoomFilters): Promise<unknown> {
  try {
    const params: Record<string, string> = {};

    if (filters?.page) params.page = String(filters.page);
    if (filters?.limit) params.limit = String(filters.limit);
    if (filters?.search) params.search = filters.search;
    if (filters?.guests) params.guests = String(filters.guests);
    if (filters?.roomTypeId) params.roomTypeId = filters.roomTypeId;
    if (filters?.checkInDate) params.checkInDate = filters.checkInDate;
    if (filters?.checkOutDate) params.checkOutDate = filters.checkOutDate;
    if (filters?.priceSort) params.priceSort = filters.priceSort;
    if (filters?.isAvailable !== undefined)
      params.isAvailable = String(filters.isAvailable);

    const response = await api.get<unknown>("/rooms", { params });
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getRoomTypes(): Promise<RoomType[]> {
  try {
    const response = await api.get<{
      success: boolean;
      data: RoomType[];
    }>("/rooms/types");
    return response.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getRoomBySlug(slug: string): Promise<unknown> {
  try {
    const response = await api.get<unknown>(`/rooms/${slug}`);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export interface BookedDateRange {
  checkInDate: string;
  checkOutDate: string;
  status: string;
}

export async function getRoomBookedDates(
  roomId: string,
): Promise<BookedDateRange[]> {
  try {
    const response = await api.get<{
      success: boolean;
      data: BookedDateRange[];
    }>(`/rooms/${roomId}/booked-dates`);
    return response.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function createRoom(
  payload: Record<string, unknown>,
): Promise<unknown> {
  try {
    const response = await api.post<unknown>("/rooms", payload);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateRoom(
  id: string,
  payload: Record<string, unknown>,
): Promise<unknown> {
  try {
    const response = await api.put<unknown>(`/rooms/${id}`, payload);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function patchRoom(
  id: string,
  payload: Record<string, unknown>,
): Promise<unknown> {
  try {
    const response = await api.patch<unknown>(`/rooms/${id}`, payload);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function deleteRoom(id: string): Promise<unknown> {
  try {
    const response = await api.delete<unknown>(`/rooms/${id}`);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}
