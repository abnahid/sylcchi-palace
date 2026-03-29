"use client";

import Breadcrumb from "@/components/Breadcrumb";
import WishlistButton from "@/components/rooms/WishlistButton";
import RoomBookingSidebar from "@/components/rooms/sections/RoomBookingSidebar";
import RoomBookingStepsSection from "@/components/rooms/sections/RoomBookingStepsSection";
import RoomCommentsSection from "@/components/rooms/sections/RoomCommentsSection";
import RoomGallerySection from "@/components/rooms/sections/RoomGallerySection";
import RoomInfoSection from "@/components/rooms/sections/RoomInfoSection";
import RoomOtherRoomsSection from "@/components/rooms/sections/RoomOtherRoomsSection";
import RoomRatingsSection from "@/components/rooms/sections/RoomRatingsSection";
import type { PrimaryRoom } from "@/lib/types/rooms";
import { useEffect, useMemo, useState } from "react";

type RoomDetailClientProps = {
  room: PrimaryRoom;
  otherRooms: PrimaryRoom[];
};

export default function RoomDetailClient({
  room,
  otherRooms,
}: RoomDetailClientProps) {
  const nightlyPrice = Number.parseFloat(room.price) || 0;

  const fallbackGallery = [
    "/Gallery/room-1.webp",
    "/Gallery/room-2.webp",
    "/Gallery/room-3.webp",
  ];

  const initialGallery = useMemo(() => {
    const fromRoom = [...room.images]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(0, 3)
      .map((item) => item.imageUrl);

    return [
      fromRoom[0] ?? fallbackGallery[0],
      fromRoom[1] ?? fallbackGallery[1],
      fromRoom[2] ?? fallbackGallery[2],
    ];
  }, [room.images]);

  const [gallery, setGallery] = useState<string[]>(initialGallery);

  useEffect(() => {
    setGallery(initialGallery);
  }, [initialGallery]);

  const handleGalleryImageError = (index: number) => {
    setGallery((previous) => {
      if (previous[index] === fallbackGallery[index]) {
        return previous;
      }

      const next = [...previous];
      next[index] = fallbackGallery[index];
      return next;
    });
  };

  const roomCards = otherRooms.slice(0, 3).map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    image: item.images[0]?.imageUrl ?? "/Gallery/room-1.webp",
    sleeps: item.capacity,
    bedLabel: `${item.bedType} bed`,
    price: Number.parseFloat(item.price),
  }));

  return (
    <main>
      <Breadcrumb
        title={room.name}
        items={[
          { label: "Home", href: "/" },
          { label: "Rooms", href: "/rooms" },
          { label: room.name },
        ]}
      />

      <section className="bg-white py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <RoomGallerySection
              roomName={room.name}
              gallery={gallery}
              onImageError={handleGalleryImageError}
            />
            <WishlistButton
              roomId={room.id}
              className="absolute top-4 right-4 z-10 shadow-md"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
            <RoomInfoSection room={room} />
            <RoomBookingSidebar
              roomId={room.id}
              roomSlug={room.slug}
              roomName={room.name}
              nightlyPrice={nightlyPrice}
            />
          </div>
        </div>
      </section>
      <RoomRatingsSection roomId={room.id} />
      <RoomCommentsSection roomId={room.id} />
      <RoomOtherRoomsSection roomCards={roomCards} />
      <RoomBookingStepsSection
        imageSrc={gallery[2]}
        onImageError={() => handleGalleryImageError(2)}
      />
    </main>
  );
}
