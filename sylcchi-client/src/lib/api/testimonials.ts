import { api, toApiError } from "@/lib/api";

export async function getTestimonials(): Promise<unknown> {
  try {
    const response = await api.get<unknown>("/testimonials");
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}
