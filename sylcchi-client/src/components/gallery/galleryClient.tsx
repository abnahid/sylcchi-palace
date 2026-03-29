"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useRooms } from "@/hooks/useRooms";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function GalleryClient() {
  const { data: rooms = [], isLoading } = useRooms();

  const galleryItems = useMemo(
    () =>
      rooms.flatMap((room) =>
        room.images.map((image) => ({
          id: image.id,
          title: room.name,
          category: room.roomType.name,
          image: image.imageUrl,
        })),
      ),
    [rooms],
  );

  const roomGalleryCategories = useMemo(
    () => ["All", ...new Set(galleryItems.map((item) => item.category))],
    [galleryItems],
  );

  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  const filteredItems =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-mulish text-2xl font-extrabold text-[#101b25] sm:text-3xl lg:text-4xl">
            Photos of Sylcchi Palace
          </h2>

          <div className="flex flex-wrap gap-3">
            {roomGalleryCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-md px-3 py-2 font-mulish text-sm font-semibold transition-colors ${
                  activeCategory === category
                    ? "bg-secondary text-primary"
                    : "text-gray-500 hover:text-primary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm"
              >
                <Skeleton className="h-64 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm"
            >
              <div className="relative h-64 w-full">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImage({ src: item.image, title: item.title })
                  }
                  className="block h-full w-full"
                  aria-label={`Open ${item.title} image`}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </button>
              </div>

              <div className="p-4">
                <p className="font-mulish text-lg font-bold text-[#101b25]">
                  {item.title}
                </p>
                <p className="mt-1 font-open-sans text-sm text-[#5b6774]">
                  {item.category}
                </p>
              </div>
            </article>
          ))}
        </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedImage.title} preview`}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#101b25]"
            aria-label="Close image preview"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative h-[85vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedImage.src}
              alt={selectedImage.title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </section>
  );
}
