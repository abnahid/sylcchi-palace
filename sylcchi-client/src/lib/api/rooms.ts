import { api, toApiError } from "@/lib/api";

export async function getRooms(): Promise<unknown> {
  try {
    const response = await api.get<unknown>("/rooms");
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}
