import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_API_URL is not set. API calls may fail.");
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = window.localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
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
