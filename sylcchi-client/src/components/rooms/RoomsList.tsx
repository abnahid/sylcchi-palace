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
import { primaryRooms } from "@/data/rooms";
import { Filter } from "lucide-react";
import { useMemo, useState } from "react";

export default function RoomsList() {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guestCount, setGuestCount] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceSort, setPriceSort] = useState<"default" | "low" | "high">(
    "default",
  );

  const filteredRooms = useMemo(() => {
    const guestCountNumber = Number.parseInt(guestCount, 10);
    const query = searchTerm.trim().toLowerCase();

    const matched = primaryRooms.filter((room) => {
      const matchesSearch = query
        ? [room.name, room.description, room.roomType.name, room.bedType]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;

      const matchesGuests = Number.isNaN(guestCountNumber)
        ? true
        : room.capacity >= guestCountNumber;

      return matchesSearch && matchesGuests;
    });

    if (priceSort === "low") {
      return [...matched].sort(
        (a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price),
      );
    }

    if (priceSort === "high") {
      return [...matched].sort(
        (a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price),
      );
    }

    return matched;
  }, [guestCount, priceSort, searchTerm]);

  const resetFilters = () => {
    setCheckInDate("");
    setCheckOutDate("");
    setGuestCount("1");
    setSearchTerm("");
    setPriceSort("default");
  };

  if (!primaryRooms.length) {
    return <p>No rooms available right now.</p>;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-mulish text-3xl font-extrabold text-[#101b25]">
          Available Rooms
        </h2>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2.5 font-mulish text-sm font-semibold text-primary transition-colors hover:bg-secondary/90"
            >
              <Filter className="h-4 w-4" /> Filters
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
                Refine room results by date, guests, search keyword, and price
                order.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="room-search"
                  className="mb-1 block font-open-sans text-sm text-[#5b6774]"
                >
                  Search
                </label>
                <input
                  id="room-search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Room name, type, or bed"
                  className="w-full rounded-md border border-[#d7dfe8] px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="check-in-date"
                    className="mb-1 block font-open-sans text-sm text-[#5b6774]"
                  >
                    Check-in
                  </label>
                  <input
                    id="check-in-date"
                    type="date"
                    value={checkInDate}
                    onChange={(event) => setCheckInDate(event.target.value)}
                    className="w-full rounded-md border border-[#d7dfe8] px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="check-out-date"
                    className="mb-1 block font-open-sans text-sm text-[#5b6774]"
                  >
                    Check-out
                  </label>
                  <input
                    id="check-out-date"
                    type="date"
                    value={checkOutDate}
                    onChange={(event) => setCheckOutDate(event.target.value)}
                    className="w-full rounded-md border border-[#d7dfe8] px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="guest-count"
                  className="mb-1 block font-open-sans text-sm text-[#5b6774]"
                >
                  Total guests
                </label>
                <select
                  id="guest-count"
                  value={guestCount}
                  onChange={(event) => setGuestCount(event.target.value)}
                  className="w-full rounded-md border border-[#d7dfe8] bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="1">1 guest</option>
                  <option value="2">2 guests</option>
                  <option value="3">3 guests</option>
                  <option value="4">4 guests</option>
                  <option value="5">5+ guests</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="price-sort"
                  className="mb-1 block font-open-sans text-sm text-[#5b6774]"
                >
                  Price sort
                </label>
                <select
                  id="price-sort"
                  value={priceSort}
                  onChange={(event) =>
                    setPriceSort(
                      event.target.value as "default" | "low" | "high",
                    )
                  }
                  className="w-full rounded-md border border-[#d7dfe8] bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="default">Default</option>
                  <option value="low">Low Price to High</option>
                  <option value="high">High Price to Low</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-md border border-[#d7dfe8] px-4 py-2 text-sm font-semibold text-[#5b6774] transition-colors hover:bg-[#f3f7fb]"
                >
                  Reset
                </button>
                <button
                  type="button"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1f4f79]"
                >
                  Search
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <ul className="space-y-7">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <li key={room.id}>
              <RoomPageCard room={room} />
            </li>
          ))
        ) : (
          <li className="rounded-md border border-dashed border-[#d7dfe8] px-4 py-10 text-center font-open-sans text-sm text-[#5b6774]">
            No rooms match your filters.
          </li>
        )}
      </ul>
    </section>
  );
}
