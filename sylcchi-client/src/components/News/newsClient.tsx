"use client";

import NewsCard from "@/components/News/NewsCard";
import NewsSidebar from "@/components/News/NewsSidebar";
import { newsPosts } from "@/data/news";
import { useMemo, useState } from "react";

export default function NewsClient() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    undefined,
  );
  const [activeTag, setActiveTag] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  const posts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return newsPosts.filter((post) => {
      const categoryMatches = activeCategory
        ? post.category === activeCategory
        : true;
      const tagMatches = activeTag ? post.tag === activeTag : true;
      const searchMatches = query
        ? [post.title, post.excerpt, post.category, post.tag, post.author.name]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;

      return categoryMatches && tagMatches && searchMatches;
    });
  }, [activeCategory, activeTag, searchTerm]);

  const clearFilters = () => {
    setActiveCategory(undefined);
    setActiveTag(undefined);
    setSearchTerm("");
  };

  const handleSearchSubmit = () => {
    // Filtering is already live while typing, this keeps button behavior explicit.
  };

  return (
    <section className="bg-white dark:bg-[#101e2e] py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <p className="font-open-sans text-sm text-[#808385] dark:text-[#7d8a96]">
              Showing {posts.length} article{posts.length === 1 ? "" : "s"}
            </p>

            {posts.length > 0 ? (
              posts.map((post) => <NewsCard key={post.id} post={post} />)
            ) : (
              <div className="rounded-xl border border-dashed border-[#d8e2ec] dark:border-[#243443] p-8 text-center">
                <h3 className="font-mulish text-xl font-bold text-[#040b11] dark:text-white">
                  No matching news found
                </h3>
                <p className="mt-2 font-open-sans text-sm text-[#808385] dark:text-[#7d8a96]">
                  Try a different category, tag, or search keyword.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-md bg-[#eef4fb] dark:bg-[#17354f]/40 px-4 py-2 text-sm font-semibold text-primary dark:text-[#7fb3df]"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          <NewsSidebar
            activeCategory={activeCategory}
            activeTag={activeTag}
            searchTerm={searchTerm}
            onCategoryChange={setActiveCategory}
            onTagChange={setActiveTag}
            onSearchTermChange={setSearchTerm}
            onSearchSubmit={handleSearchSubmit}
            onClearFilters={clearFilters}
          />
        </div>
      </div>
    </section>
  );
}
