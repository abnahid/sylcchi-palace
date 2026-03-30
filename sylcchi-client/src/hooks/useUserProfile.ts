"use client";

import type { AuthUser } from "@/lib/api/auth";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
} from "@/lib/api/user";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "@/lib/api/wishlist";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const userQueryKeys = {
  all: ["user"] as const,
  profile: () => [...userQueryKeys.all, "profile"] as const,
};

export const wishlistQueryKeys = {
  all: ["wishlist"] as const,
  list: () => [...wishlistQueryKeys.all, "list"] as const,
};

export function useUserProfile() {
  return useQuery({
    queryKey: userQueryKeys.profile(),
    queryFn: getUserProfile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
    },
  });
}

export function useUploadProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => uploadProfileImage(formData),
    onSuccess: (res) => {
      const newImageUrl = res.data?.image;

      // Immediately update session cache so Navbar avatar refreshes instantly
      if (newImageUrl) {
        queryClient.setQueryData<AuthUser | null>(
          ["auth", "session"],
          (old) => (old ? { ...old, image: newImageUrl } : old),
        );
      }

      queryClient.invalidateQueries({ queryKey: userQueryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
    },
  });
}

export function useWishlist() {
  return useQuery({
    queryKey: wishlistQueryKeys.list(),
    queryFn: getWishlist,
    staleTime: 3 * 60 * 1000,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.list() });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.list() });
    },
  });
}
