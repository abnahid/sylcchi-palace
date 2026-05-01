"use client";

import { useRemoveFromWishlist, useWishlist } from "@/hooks/useUserProfile";
import { ChevronRight, Heart, Star } from "lucide-react";
import Link from "next/link";

export function WishlistTabContent() {
  const { data: wishlistResponse } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const list = wishlistResponse?.data || [];

  const resolveRoomId = (room: (typeof list)[number]) =>
    room.roomId || room.room?.id || "";

  const resolveRoomSlug = (room: (typeof list)[number]) =>
    room.roomSlug || room.slug || room.room?.slug || "";

  const resolveRoomName = (room: (typeof list)[number]) =>
    room.roomName || room.room?.name || "Room";

  const resolveRoomImage = (room: (typeof list)[number]) =>
    room.roomImage || room.room?.images?.[0]?.imageUrl || "";

  const resolveRoomTag = (room: (typeof list)[number]) =>
    room.tag || room.room?.roomType?.name || "";

  const resolveRoomRating = (room: (typeof list)[number]) =>
    room.rating || room.room?.averageRating;

  const resolveRoomReviews = (room: (typeof list)[number]) =>
    room.reviews || room.room?.reviewCount;

  const resolveRoomPrice = (room: (typeof list)[number]) => {
    const price = room.price ?? room.room?.price ?? room.room?.pricePerNight;
    const numericPrice = Number(price);
    return Number.isFinite(numericPrice) ? numericPrice : 0;
  };

  const handleRemove = (roomId: string) => {
    removeFromWishlist.mutate(roomId);
  };

  const getRoomDetailPath = (room: (typeof list)[number]) => {
    const identifier = resolveRoomSlug(room) || resolveRoomId(room);
    return `/rooms/${encodeURIComponent(identifier)}`;
  };

  if (list.length === 0) {
    return (
      <div className="text-center py-20">
        <Heart size={48} className="text-[#DDEAF6] dark:text-[#17354f]/40 mx-auto mb-4" />
        <p
          className="text-[#040b11] dark:text-white text-[18px] mb-2"
          style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
        >
          Your wishlist is empty
        </p>
        <p className="text-[#808385] dark:text-[#7d8a96] text-[14px] mb-6">
          Browse rooms and save your favourites here.
        </p>
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 bg-[#235784] text-white px-6 py-3 rounded-[8px] text-[14px] hover:bg-[#1a4a6d] transition-colors"
          style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
        >
          Browse Rooms <ChevronRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[#808385] dark:text-[#7d8a96] text-[14px] mb-5">
        {list.length} saved room{list.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {list.map((room) => (
          <div
            key={room.id}
            className="bg-white dark:bg-[#101e2e] border border-[#e8edf2] dark:border-[#243443] rounded-[16px] overflow-hidden group hover:shadow-lg transition-shadow"
          >
            <div className="relative h-40 overflow-hidden bg-[#DDEAF6] dark:bg-[#17354f]/40">
              {resolveRoomImage(room) ? (
                <img
                  src={resolveRoomImage(room)}
                  alt={resolveRoomName(room)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Heart size={32} className="text-[#235784] dark:text-[#7fb3df]" />
                </div>
              )}
              {resolveRoomTag(room) && (
                <span
                  className="absolute top-3 left-3 bg-white/90 dark:bg-[#101e2e]/90 text-[#235784] dark:text-[#7fb3df] text-[11px] px-2.5 py-1 rounded-full"
                  style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
                >
                  {resolveRoomTag(room)}
                </span>
              )}
              <button
                onClick={() => handleRemove(resolveRoomId(room))}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-[#101e2e]/90 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full flex items-center justify-center transition-colors"
                title="Remove from wishlist"
                disabled={removeFromWishlist.isPending || !resolveRoomId(room)}
              >
                <Heart
                  size={15}
                  className="text-red-400"
                  style={{ fill: "#f87171" }}
                />
              </button>
            </div>
            <div className="p-4">
              <p
                className="text-[#040b11] dark:text-white text-[15px] leading-snug mb-2"
                style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
              >
                {resolveRoomName(room)}
              </p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <Star
                    size={13}
                    className="text-yellow-400"
                    style={{ fill: "#facc15" }}
                  />
                  {resolveRoomRating(room) && (
                    <>
                      <span
                        className="text-[#2c3c4a] dark:text-[#e8edf2] text-[13px]"
                        style={{
                          fontFamily: "Open Sans, sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        {resolveRoomRating(room)}
                      </span>
                      <span className="text-[#808385] dark:text-[#7d8a96] text-[12px]">
                        ({resolveRoomReviews(room) ?? 0})
                      </span>
                    </>
                  )}
                </div>
                <p
                  className="text-[#235784] dark:text-[#7fb3df] text-[16px]"
                  style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
                >
                  ${resolveRoomPrice(room)}
                  <span
                    className="text-[#808385] dark:text-[#7d8a96] text-[12px]"
                    style={{ fontWeight: 400 }}
                  >
                    /night
                  </span>
                </p>
              </div>
              <Link
                href={getRoomDetailPath(room)}
                className="flex items-center justify-center gap-1.5 w-full bg-[#DDEAF6] dark:bg-[#17354f]/40 hover:bg-[#c5d9ee] dark:hover:bg-[#17354f]/60 text-[#235784] dark:text-[#7fb3df] py-2.5 rounded-[8px] text-[13px] transition-colors"
                style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
              >
                View Room
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
