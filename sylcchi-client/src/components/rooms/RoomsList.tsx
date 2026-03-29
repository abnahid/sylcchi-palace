"use client";

import RoomPageCard from "@/components/rooms/RoomPageCard";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { usePaginatedRooms, useRoomTypes } from "@/hooks/useRooms";
import type { RoomFilters } from "@/lib/types/rooms";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

function RoomsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read filters from URL
  const [filters, setFilters] = useState<RoomFilters>(() => ({
    page: Number(searchParams.get("page")) || 1,
    search: searchParams.get("search") ?? "",
    guests: Number(searchParams.get("guests")) || undefined,
    roomTypeId: searchParams.get("roomTypeId") ?? "",
    checkInDate: searchParams.get("checkIn") ?? "",
    checkOutDate: searchParams.get("checkOut") ?? "",
    priceSort:
      (searchParams.get("priceSort") as "asc" | "desc") || undefined,
  }));

  // Sheet filter form state (only applied when user clicks "Apply")
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState(filters);

  const { data: roomTypes = [] } = useRoomTypes();

  // Build clean filters for the API (strip empty values)
  const apiFilters: RoomFilters = {
    page: filters.page || 1,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.guests ? { guests: filters.guests } : {}),
    ...(filters.roomTypeId ? { roomTypeId: filters.roomTypeId } : {}),
    ...(filters.checkInDate && filters.checkOutDate
      ? {
          checkInDate: filters.checkInDate,
          checkOutDate: filters.checkOutDate,
        }
      : {}),
    ...(filters.priceSort ? { priceSort: filters.priceSort } : {}),
  };

  const { data, isLoading, isError, error, isFetching } =
    usePaginatedRooms(apiFilters);

  const rooms = data?.data ?? [];
  const meta = data?.meta;

  // Sync filters to URL
  const syncUrl = useCallback(
    (next: RoomFilters) => {
      const params = new URLSearchParams();
      if (next.page && next.page > 1) params.set("page", String(next.page));
      if (next.search) params.set("search", next.search);
      if (next.guests) params.set("guests", String(next.guests));
      if (next.roomTypeId) params.set("roomTypeId", next.roomTypeId);
      if (next.checkInDate) params.set("checkIn", next.checkInDate);
      if (next.checkOutDate) params.set("checkOut", next.checkOutDate);
      if (next.priceSort) params.set("priceSort", next.priceSort);
      const qs = params.toString();
      router.push(qs ? `/rooms?${qs}` : "/rooms", { scroll: false });
    },
    [router],
  );

  function applyFilters(next: RoomFilters) {
    const withPageReset = { ...next, page: 1 };
    setFilters(withPageReset);
    syncUrl(withPageReset);
  }

  function goToPage(page: number) {
    const next = { ...filters, page };
    setFilters(next);
    syncUrl(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSheetApply() {
    applyFilters(draft);
    setSheetOpen(false);
  }

  function handleReset() {
    const empty: RoomFilters = { page: 1 };
    setDraft(empty);
    applyFilters(empty);
    setSheetOpen(false);
  }

  // Sync draft when sheet opens
  useEffect(() => {
    if (sheetOpen) setDraft(filters);
  }, [sheetOpen, filters]);

  // Count active filters (excluding page)
  const activeFilterCount = [
    filters.search,
    filters.guests,
    filters.roomTypeId,
    filters.checkInDate,
    filters.priceSort,
  ].filter(Boolean).length;

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-mulish text-base font-bold text-red-800">
          Failed to load rooms
        </p>
        <p className="mt-1 font-open-sans text-sm text-red-600">
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-mulish text-3xl font-extrabold text-[#101b25]">
            Available Rooms
          </h2>
          {meta && !isLoading && (
            <p className="mt-1 font-open-sans text-sm text-[#5b6774]">
              {meta.total} room{meta.total !== 1 ? "s" : ""} found
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <X className="h-3 w-3" /> Clear filters
                </button>
              )}
            </p>
          )}
        </div>

        {/* Inline search + filter button */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#808385]" />
            <input
              type="text"
              value={filters.search ?? ""}
              onChange={(e) => {
                const next = { ...filters, search: e.target.value, page: 1 };
                setFilters(next);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters(filters);
                }
              }}
              onBlur={() => {
                if (filters.search !== (searchParams.get("search") ?? "")) {
                  applyFilters(filters);
                }
              }}
              placeholder="Search rooms..."
              className="w-48 rounded-md border border-[#d7dfe8] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary sm:w-56"
            />
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="relative inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2.5 font-mulish text-sm font-semibold text-primary transition-colors hover:bg-secondary/90"
              >
                <Filter className="h-4 w-4" /> Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              overlayClassName="!bg-transparent !backdrop-blur-none"
              closeClassName="fixed top-4 right-4 z-[60] flex size-8 items-center justify-center rounded-md border border-input bg-background p-0 opacity-100"
            >
              <SheetHeader>
                <SheetTitle>Filter Rooms</SheetTitle>
                <SheetDescription>
                  Refine results by date, guests, room type, and price.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-open-sans text-sm text-[#5b6774]">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={draft.checkInDate ?? ""}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          checkInDate: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-[#d7dfe8] px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-open-sans text-sm text-[#5b6774]">
                      Check-out
                    </label>
                    <input
                      type="date"
                      value={draft.checkOutDate ?? ""}
                      min={draft.checkInDate || new Date().toISOString().slice(0, 10)}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          checkOutDate: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-[#d7dfe8] px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="mb-1 block font-open-sans text-sm text-[#5b6774]">
                    Guests
                  </label>
                  <select
                    value={draft.guests ?? ""}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        guests: Number(e.target.value) || undefined,
                      }))
                    }
                    className="w-full rounded-md border border-[#d7dfe8] bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Any</option>
                    <option value="1">1 guest</option>
                    <option value="2">2 guests</option>
                    <option value="3">3 guests</option>
                    <option value="4">4 guests</option>
                    <option value="5">5+ guests</option>
                  </select>
                </div>

                {/* Room type */}
                {roomTypes.length > 0 && (
                  <div>
                    <label className="mb-1 block font-open-sans text-sm text-[#5b6774]">
                      Room type
                    </label>
                    <select
                      value={draft.roomTypeId ?? ""}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          roomTypeId: e.target.value || undefined,
                        }))
                      }
                      className="w-full rounded-md border border-[#d7dfe8] bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      <option value="">All types</option>
                      {roomTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price sort */}
                <div>
                  <label className="mb-1 block font-open-sans text-sm text-[#5b6774]">
                    Price sort
                  </label>
                  <select
                    value={draft.priceSort ?? ""}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        priceSort:
                          (e.target.value as "asc" | "desc") || undefined,
                      }))
                    }
                    className="w-full rounded-md border border-[#d7dfe8] bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Default</option>
                    <option value="asc">Low to High</option>
                    <option value="desc">High to Low</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-md border border-[#d7dfe8] px-4 py-2 text-sm font-semibold text-[#5b6774] transition-colors hover:bg-[#f3f7fb]"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSheetApply}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1f4f79]"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <ul className="space-y-7">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i}>
              <div className="overflow-hidden rounded-md bg-white shadow-[0px_0px_30px_0px_rgba(47,76,88,0.06)]">
                <div className="flex flex-col md:flex-row">
                  <Skeleton className="h-52 w-full md:w-72 lg:w-80" />
                  <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-4">
                      <Skeleton className="h-7 w-48" />
                      <Skeleton className="mt-4 h-4 w-full max-w-xl" />
                      <Skeleton className="h-4 w-3/4 max-w-md" />
                      <div className="mt-6 flex gap-5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                    <div className="flex min-w-44 flex-col items-start gap-4 lg:items-end">
                      <Skeleton className="h-10 w-32" />
                      <Skeleton className="h-6 w-28" />
                      <Skeleton className="h-10 w-24 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : rooms.length === 0 ? (
        <div className="rounded-md border border-dashed border-[#d7dfe8] px-4 py-16 text-center">
          <p className="font-mulish text-base font-bold text-[#101b25]">
            No rooms match your filters
          </p>
          <p className="mt-1 font-open-sans text-sm text-[#5b6774]">
            Try adjusting your dates, guest count, or search term.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1f4f79]"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          {/* Fetching indicator */}
          {isFetching && !isLoading && (
            <div className="flex items-center gap-2 text-sm text-[#808385]">
              <Loader2 className="h-4 w-4 animate-spin" /> Updating...
            </div>
          )}

          {/* Room cards */}
          <ul className="space-y-7">
            {rooms.map((room) => (
              <li key={room.id}>
                <RoomPageCard room={room} />
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => goToPage(meta.page - 1)}
                disabled={meta.page <= 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d7dfe8] text-[#5b6774] transition-colors hover:bg-[#f3f7fb] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold transition-colors ${
                      page === meta.page
                        ? "bg-primary text-white"
                        : "border border-[#d7dfe8] text-[#5b6774] hover:bg-[#f3f7fb]"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() => goToPage(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#d7dfe8] text-[#5b6774] transition-colors hover:bg-[#f3f7fb] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}

function RoomsListSkeleton() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-9 w-52" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-48 rounded-md sm:w-56" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>
      <ul className="space-y-7">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i}>
            <div className="overflow-hidden rounded-md bg-white shadow-[0px_0px_30px_0px_rgba(47,76,88,0.06)]">
              <div className="flex flex-col md:flex-row">
                <Skeleton className="h-52 w-full md:w-72 lg:w-80" />
                <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-4">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="mt-4 h-4 w-full max-w-xl" />
                    <Skeleton className="h-4 w-3/4 max-w-md" />
                    <div className="mt-6 flex gap-5">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                  <div className="flex min-w-44 flex-col items-start gap-4 lg:items-end">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="h-10 w-24 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function RoomsList() {
  return (
    <Suspense fallback={<RoomsListSkeleton />}>
      <RoomsListContent />
    </Suspense>
  );
}
