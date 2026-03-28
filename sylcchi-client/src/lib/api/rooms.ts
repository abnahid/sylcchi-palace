import { api, toApiError } from "@/lib/api";

export async function getRooms(): Promise<unknown> {
  try {
    const response = await api.get<unknown>("/rooms");
    return response.data;
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
