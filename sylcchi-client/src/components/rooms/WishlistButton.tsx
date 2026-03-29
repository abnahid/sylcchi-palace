"use client";

import { useSession } from "@/hooks/useAuth";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlist,
} from "@/hooks/useUserProfile";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

type WishlistButtonProps = {
  roomId: string;
  className?: string;
};

export default function WishlistButton({
  roomId,
  className = "",
}: WishlistButtonProps) {
  const router = useRouter();
  const { data: user } = useSession();
  const { data: wishlistData } = useWishlist();
  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  const getWishlistItemRoomId = (item: {
    roomId?: string;
    room?: { id?: string };
  }) => item.roomId || item.room?.id || "";

  const isInWishlist = wishlistData?.data?.some(
    (item) => getWishlistItemRoomId(item) === roomId,
  );
  const isLoading = addMutation.isPending || removeMutation.isPending;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    if (isInWishlist) {
      removeMutation.mutate(roomId);
    } else {
      addMutation.mutate({ roomId });
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className={`flex items-center justify-center rounded-full p-2 transition-all ${
        isInWishlist
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-white/80 text-gray-500 hover:bg-white hover:text-red-500"
      } backdrop-blur-sm disabled:opacity-50 ${className}`}
    >
      <Heart size={18} className={isInWishlist ? "fill-current" : ""} />
    </button>
  );
}
