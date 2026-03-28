import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  withCredentials: true,
});

export function toApiError(error: unknown): Error {
  if (error instanceof AxiosError) {
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      "Request failed";

    return new Error(message);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("Unknown API error");
}
