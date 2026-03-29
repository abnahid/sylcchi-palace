"use client";

import { useRemoveFromWishlist, useWishlist } from "@/hooks/useUserProfile";
import { ChevronRight, Heart, Star } from "lucide-react";
import Link from "next/link";

export function WishlistTabContent() {
  const { data: wishlistResponse } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const list = wishlistResponse?.data || [];

  const handleRemove = (roomId: string) => {
    removeFromWishlist.mutate(roomId);
  };

  const getRoomDetailPath = (room: (typeof list)[number]) => {
    const identifier = room.roomSlug || room.slug || room.roomId;
    return `/rooms/${encodeURIComponent(identifier)}`;
  };

  if (list.length === 0) {
    return (
      <div className="text-center py-20">
        <Heart size={48} className="text-[#DDEAF6] mx-auto mb-4" />
        <p
          className="text-[#040b11] text-[18px] mb-2"
          style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
        >
          Your wishlist is empty
        </p>
        <p className="text-[#808385] text-[14px] mb-6">
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
      <p className="text-[#808385] text-[14px] mb-5">
        {list.length} saved room{list.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {list.map((room) => (
          <div
            key={room.id}
            className="bg-white border border-[#e8edf2] rounded-[16px] overflow-hidden group hover:shadow-lg transition-shadow"
          >
            <div className="relative h-40 overflow-hidden bg-[#DDEAF6]">
              {room.roomImage ? (
                <img
                  src={room.roomImage}
                  alt={room.roomName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Heart size={32} className="text-[#235784]" />
                </div>
              )}
              {room.tag && (
                <span
                  className="absolute top-3 left-3 bg-white/90 text-[#235784] text-[11px] px-2.5 py-1 rounded-full"
                  style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
                >
                  {room.tag}
                </span>
              )}
              <button
                onClick={() => handleRemove(room.roomId)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors"
                title="Remove from wishlist"
                disabled={removeFromWishlist.isPending}
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
                className="text-[#040b11] text-[15px] leading-snug mb-2"
                style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
              >
                {room.roomName}
              </p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <Star
                    size={13}
                    className="text-yellow-400"
                    style={{ fill: "#facc15" }}
                  />
                  {room.rating && (
                    <>
                      <span
                        className="text-[#2c3c4a] text-[13px]"
                        style={{
                          fontFamily: "Open Sans, sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        {room.rating}
                      </span>
                      <span className="text-[#808385] text-[12px]">
                        ({room.reviews})
                      </span>
                    </>
                  )}
                </div>
                <p
                  className="text-[#235784] text-[16px]"
                  style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
                >
                  ${room.price}
                  <span
                    className="text-[#808385] text-[12px]"
                    style={{ fontWeight: 400 }}
                  >
                    /night
                  </span>
                </p>
              </div>
              <Link
                href={getRoomDetailPath(room)}
                className="flex items-center justify-center gap-1.5 w-full bg-[#DDEAF6] hover:bg-[#c5d9ee] text-[#235784] py-2.5 rounded-[8px] text-[13px] transition-colors"
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
