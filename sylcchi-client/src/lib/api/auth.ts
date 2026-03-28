import axios from "axios";

import { api, toApiError } from "@/lib/api";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "");

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  emailVerified: boolean;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  data?: {
    user: AuthUser;
  };
};

export async function signUp(body: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/sign-up", body);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function signIn(body: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/sign-in", body);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function signOut(): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/sign-out");
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getSession(): Promise<AuthResponse> {
  try {
    const response = await api.get<AuthResponse>("/auth/session");
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function requestVerificationOtp(body: {
  email: string;
  type?: "email-verification" | "forget-password" | "sign-in";
}): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>(
      "/auth/request-verification-otp",
      body,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function verifyOtp(body: {
  email: string;
  otp: string;
}): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>("/auth/verify-otp", body);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function forgotPassword(body: {
  email: string;
}): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>(
      "/auth/forgot-password",
      body,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function resetPassword(body: {
  email: string;
  otp: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>(
      "/auth/reset-password",
      body,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function socialSignIn(
  provider: "google",
  callbackURL: string,
): Promise<{ url: string }> {
  try {
    const response = await axios.post<{ url: string }>(
      `${BACKEND_URL}/api/auth/sign-in/social`,
      { provider, callbackURL },
      { withCredentials: true },
    );
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}
