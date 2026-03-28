"use client";

import {
  forgotPassword,
  getSession,
  requestVerificationOtp,
  resetPassword,
  signIn,
  signOut,
  signUp,
  verifyOtp,
} from "@/lib/api/auth";
import type { AuthResponse, AuthUser } from "@/lib/api/auth";
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
    staleTime: 60_000,
    gcTime: 300_000,
    retry: false,
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
