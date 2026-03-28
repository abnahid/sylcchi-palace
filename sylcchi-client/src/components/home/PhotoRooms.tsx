"use client";

import {
  homePhotoGalleryCategories,
  homePhotoGalleryItems,
} from "@/data/rooms";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function PhotoRooms() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? homePhotoGalleryItems
      : homePhotoGalleryItems.filter(
          (item) => item.category === activeCategory,
        );

  // Show max 5 items in the grid layout
  const displayItems = filtered.slice(0, 5);

  return (
    <section className="py-12 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header with title and category tabs */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-mulish text-2xl font-extrabold text-[#101b25] sm:text-3xl lg:text-4xl">
            Photos of our rooms
          </h2>
          <div className="flex flex-wrap gap-4">
            {homePhotoGalleryCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`font-mulish text-sm font-semibold transition-colors ${
                  activeCategory === category
                    ? "text-primary underline underline-offset-4"
                    : "text-gray-500 hover:text-primary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid - matching the screenshot layout */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
          {/* Left tall image */}
          {displayItems[0] && (
            <div className="relative md:row-span-2 overflow-hidden rounded-lg min-h-75 md:min-h-0">
              <Image
                src={displayItems[0].image}
                alt={displayItems[0].title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          )}

          {/* Top middle image */}
          {displayItems[1] && (
            <div className="relative overflow-hidden rounded-lg min-h-50">
              <Image
                src={displayItems[1].image}
                alt={displayItems[1].title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          )}

          {/* Top right tall image */}
          {displayItems[2] && (
            <div className="relative md:row-span-2 overflow-hidden rounded-lg min-h-75 md:min-h-0">
              <Image
                src={displayItems[2].image}
                alt={displayItems[2].title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          )}

          {/* Bottom middle image with "View all photos" button */}
          {displayItems[3] && (
            <div className="relative overflow-hidden rounded-lg min-h-50">
              <Image
                src={displayItems[3].image}
                alt={displayItems[3].title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-x-0 bottom-0 flex justify-center p-4">
                <Link
                  href="/gallery"
                  className="rounded-md bg-secondary px-6 py-3 font-mulish font-bold text-primary transition-colors hover:bg-secondary/90"
                >
                  View all photos
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
