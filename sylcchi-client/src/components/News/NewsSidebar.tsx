"use client";

import {
  getRecommendedNews,
  instagramPhotos,
  newsCategories,
  newsTags,
} from "@/data/news";
import { ChevronRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type NewsSidebarProps = {
  excludeSlug?: string;
  activeCategory?: string;
  activeTag?: string;
  searchTerm?: string;
  onCategoryChange?: (category?: string) => void;
  onTagChange?: (tag?: string) => void;
  onSearchTermChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onClearFilters?: () => void;
};

export default function NewsSidebar({
  excludeSlug,
  activeCategory,
  activeTag,
  searchTerm,
  onCategoryChange,
  onTagChange,
  onSearchTermChange,
  onSearchSubmit,
  onClearFilters,
}: NewsSidebarProps) {
  const recommended = getRecommendedNews(excludeSlug);

  return (
    <aside className="space-y-8">
      <div className="flex">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm ?? ""}
          onChange={(event) => onSearchTermChange?.(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearchSubmit?.();
            }
          }}
          className="flex-1 rounded-l-lg border border-[#e0e0e0] px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={onSearchSubmit}
          className="rounded-r-lg bg-primary px-4 text-white transition-colors hover:bg-[#1a4a6d]"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </div>

      <div>
        <h3 className="mb-4 font-mulish text-xl font-bold text-[#040b11]">
          Categories
        </h3>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => onCategoryChange?.(undefined)}
            className={`w-full rounded-md px-4 py-2.5 text-left text-base transition-colors ${
              !activeCategory
                ? "bg-primary text-white"
                : "text-[#2c3c4a] hover:bg-[#f7fafd]"
            }`}
          >
            All
          </button>

          {newsCategories.map((category) => {
            const active = activeCategory === category;

            return (
              <button
                type="button"
                onClick={() => onCategoryChange?.(category)}
                key={category}
                className={`w-full rounded-md px-4 py-2.5 text-left text-base transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "text-[#2c3c4a] hover:bg-[#f7fafd]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-mulish text-xl font-bold text-[#040b11]">
          Recommended articles
        </h3>
        <div className="space-y-4">
          {recommended.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.slug}`}
              className="flex gap-3"
            >
              <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={item.coverImage}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div>
                <p className="font-mulish text-sm leading-5 text-[#040b11]">
                  {item.title}
                </p>
                <p className="font-open-sans text-xs text-[#808385]">
                  {item.date}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-mulish text-xl font-bold text-[#040b11]">
          Tag
        </h3>
        <div className="flex flex-wrap gap-2">
          {newsTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagChange?.(activeTag === tag ? undefined : tag)}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                activeTag === tag
                  ? "bg-primary text-white"
                  : "text-[#2c3c4a] hover:text-primary"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {(activeCategory || activeTag || (searchTerm && searchTerm.trim())) && (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-3 text-sm font-semibold text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div>
        <h3 className="mb-3 font-mulish text-xl font-bold text-[#040b11]">
          Subscribe to our mailing list
        </h3>
        <div className="flex">
          <input
            type="email"
            placeholder="Email address"
            className="flex-1 rounded-l-lg border border-[#e0e0e0] px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            className="rounded-r-lg bg-primary px-4 text-white transition-colors hover:bg-[#1a4a6d]"
            aria-label="Subscribe"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-mulish text-xl font-bold text-[#040b11]">
          Instagram
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {instagramPhotos.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="relative h-[70px] overflow-hidden rounded-md"
            >
              <Image
                src={image}
                alt={`Instagram ${index + 1}`}
                fill
                className="object-cover"
                sizes="70px"
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
