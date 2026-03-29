"use client";

import type { AuthResponse, AuthUser } from "@/lib/api/auth";
import {
  forgotPassword,
  getSession,
  requestVerificationOtp,
  resetPassword,
  signIn,
  signOut,
  signUp,
  socialSignIn,
  verifyOtp,
} from "@/lib/api/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const authQueryKeys = {
  all: ["auth"] as const,
  session: () => [...authQueryKeys.all, "session"] as const,
};

export function useSession() {
  return useQuery<AuthUser | null, Error>({
    queryKey: authQueryKeys.session(),
    queryFn: async () => {
      try {
        const res = await getSession();
        return res.data?.user ?? null;
      } catch {
        return null;
      }
    },
    staleTime: 0,
    gcTime: 300_000,
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, { email: string; password: string }>({
    mutationFn: (body) => signIn(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
    },
  });
}

export function useSignUp() {
  return useMutation<
    AuthResponse,
    Error,
    { name: string; email: string; password: string }
  >({
    mutationFn: (body) => signUp(body),
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error>({
    mutationFn: () => signOut(),
    onSuccess: async () => {
      queryClient.setQueryData(authQueryKeys.session(), null);
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
    },
  });
}

export function useRequestOtp() {
  return useMutation<
    AuthResponse,
    Error,
    {
      email: string;
      type?: "email-verification" | "forget-password" | "sign-in";
    }
  >({
    mutationFn: (body) => requestVerificationOtp(body),
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, { email: string; otp: string }>({
    mutationFn: (body) => verifyOtp(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useForgotPassword() {
  return useMutation<AuthResponse, Error, { email: string }>({
    mutationFn: (body) => forgotPassword(body),
  });
}

export function useResetPassword() {
  return useMutation<
    AuthResponse,
    Error,
    { email: string; otp: string; password: string }
  >({
    mutationFn: (body) => resetPassword(body),
  });
}

export function useSocialSignIn() {
  return useMutation<
    { url: string },
    Error,
    { provider: "google"; callbackURL: string }
  >({
    mutationFn: ({ provider, callbackURL }) =>
      socialSignIn(provider, callbackURL),
  });
}
