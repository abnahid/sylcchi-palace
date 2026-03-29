"use client";

import { Calendar } from "@/components/ui/calendar";
import { getRoomBookedDates, type BookedDateRange } from "@/lib/api/rooms";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type RoomBookingSidebarProps = {
  roomId: string;
  roomSlug: string;
  roomName: string;
  nightlyPrice: number;
};

// ── Date helpers (timezone-safe) ──

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isDateBooked(date: Date, ranges: BookedDateRange[]): boolean {
  const str = toDateStr(date);
  for (const r of ranges) {
    if (str >= r.checkInDate && str < r.checkOutDate) return true;
  }
  return false;
}

function hasOverlap(
  checkIn: Date,
  checkOut: Date,
  ranges: BookedDateRange[],
): boolean {
  const inStr = toDateStr(checkIn);
  const outStr = toDateStr(checkOut);
  for (const r of ranges) {
    if (inStr < r.checkOutDate && outStr > r.checkInDate) return true;
  }
  return false;
}

function getNextBookedDate(
  after: Date,
  ranges: BookedDateRange[],
): Date | null {
  const str = toDateStr(after);
  let earliest: string | null = null;
  for (const r of ranges) {
    if (r.checkInDate > str) {
      if (!earliest || r.checkInDate < earliest) earliest = r.checkInDate;
    }
  }
  if (!earliest) return null;
  const [y, m, d] = earliest.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// ── Component ──

const RoomBookingSidebar = ({
  roomId,
  roomSlug,
  roomName,
  nightlyPrice,
}: RoomBookingSidebarProps) => {
  const router = useRouter();
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [openCalendar, setOpenCalendar] = useState<
    "checkIn" | "checkOut" | null
  >(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [bookedRanges, setBookedRanges] = useState<BookedDateRange[]>([]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    getRoomBookedDates(roomId)
      .then(setBookedRanges)
      .catch(() => {});
  }, [roomId]);

  const addOneDay = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return d;
  };

  const maxCheckoutDate = checkInDate
    ? getNextBookedDate(checkInDate, bookedRanges)
    : null;

  const nights =
    checkInDate && checkOutDate
      ? Math.max(
          0,
          Math.ceil(
            (checkOutDate.getTime() - checkInDate.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  const handleBookNow = () => {
    if (!checkInDate || !checkOutDate || checkOutDate <= checkInDate) {
      setDateError("Please select valid check-in and check-out dates.");
      return;
    }

    if (hasOverlap(checkInDate, checkOutDate, bookedRanges)) {
      setDateError(
        "Your selected dates overlap with an existing booking. Please choose different dates.",
      );
      return;
    }

    setDateError(null);

    const query = new URLSearchParams({
      slug: roomSlug,
      roomName,
      checkIn: format(checkInDate, "yyyy-MM-dd"),
      checkOut: format(checkOutDate, "yyyy-MM-dd"),
    });

    router.push(`/booking?${query.toString()}`);
  };

  return (
    <aside className="h-fit rounded-xl bg-[#f7fafd] p-6">
      <p className="font-mulish text-5xl font-extrabold text-primary">
        ${Math.round(nightlyPrice)}
        <span className="ml-1 font-open-sans text-base font-normal text-[#707884]">
          / 1 night
        </span>
      </p>

      {/* Legend */}
      {bookedRanges.length > 0 && (
        <div className="mt-4 flex items-center gap-4 text-xs text-[#707884]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-amber-100 border border-amber-300" />
            Booked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-white border border-[#cbd4de]" />
            Available
          </span>
        </div>
      )}

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => event.preventDefault()}
      >
        {/* Check-in */}
        <div>
          <label className="mb-1 block font-mulish text-sm font-bold text-[#101b25]">
            Check-in
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenCalendar((prev) =>
                  prev === "checkIn" ? null : "checkIn",
                )
              }
              className="flex h-11 w-full items-center justify-between rounded-md border border-[#cbd4de] bg-white px-3 text-left font-open-sans text-sm text-[#667585] outline-none transition-colors hover:border-primary"
            >
              <span>
                {checkInDate
                  ? format(checkInDate, "dd MMM yyyy")
                  : "Add arrival date"}
              </span>
              <CalendarDays className="h-4 w-4 text-[#99a5b2]" />
            </button>

            {openCalendar === "checkIn" && (
              <div className="absolute left-0 top-12 z-30 rounded-lg border border-[#d9e1ea] bg-white p-2 shadow-xl">
                <Calendar
                  mode="single"
                  selected={checkInDate}
                  disabled={(date) =>
                    date < today || isDateBooked(date, bookedRanges)
                  }
                  modifiers={{
                    booked: (date) => isDateBooked(date, bookedRanges),
                  }}
                  modifiersClassNames={{
                    booked:
                      "!bg-amber-100 !text-amber-700 !opacity-60 line-through",
                  }}
                  onSelect={(date) => {
                    if (!date) {
                      setCheckInDate(undefined);
                      setDateError(null);
                      return;
                    }

                    setCheckInDate(date);
                    setDateError(null);

                    if (!checkOutDate || checkOutDate <= date) {
                      setCheckOutDate(addOneDay(date));
                    }

                    setOpenCalendar(null);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Check-out */}
        <div>
          <label className="mb-1 block font-mulish text-sm font-bold text-[#101b25]">
            Check-out
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenCalendar((prev) =>
                  prev === "checkOut" ? null : "checkOut",
                )
              }
              className="flex h-11 w-full items-center justify-between rounded-md border border-[#cbd4de] bg-white px-3 text-left font-open-sans text-sm text-[#667585] outline-none transition-colors hover:border-primary"
            >
              <span>
                {checkOutDate
                  ? format(checkOutDate, "dd MMM yyyy")
                  : "Add departure date"}
              </span>
              <CalendarDays className="h-4 w-4 text-[#99a5b2]" />
            </button>

            {openCalendar === "checkOut" && (
              <div className="absolute left-0 top-12 z-30 rounded-lg border border-[#d9e1ea] bg-white p-2 shadow-xl">
                <Calendar
                  mode="single"
                  selected={checkOutDate}
                  disabled={(date) => {
                    const minDate = checkInDate ?? today;
                    if (date <= minDate) return true;
                    if (maxCheckoutDate && date > maxCheckoutDate) return true;
                    return false;
                  }}
                  modifiers={{
                    booked: (date) => isDateBooked(date, bookedRanges),
                  }}
                  modifiersClassNames={{
                    booked:
                      "!bg-amber-100 !text-amber-700 !opacity-60 line-through",
                  }}
                  onSelect={(date) => {
                    if (!date) return;
                    setCheckOutDate(date);
                    setDateError(null);
                    setOpenCalendar(null);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Nights summary */}
        {nights > 0 && checkInDate && checkOutDate && (
          <div className="rounded-lg bg-white border border-[#e8edf2] p-3 text-sm">
            <div className="flex justify-between text-[#707884]">
              <span>
                ${Math.round(nightlyPrice)} × {nights} night
                {nights > 1 ? "s" : ""}
              </span>
              <span className="font-bold text-[#101b25]">
                ${Math.round(nightlyPrice * nights)}
              </span>
            </div>
          </div>
        )}

        {dateError ? (
          <p className="font-open-sans text-xs text-red-600">{dateError}</p>
        ) : null}

        <button
          type="submit"
          onClick={handleBookNow}
          className="rounded-md bg-primary px-6 py-2.5 font-mulish text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Book now
        </button>
      </form>

      <div className="mt-8 rounded-lg bg-primary p-6 text-primary-foreground">
        <h3 className="font-mulish text-4xl font-extrabold leading-tight">
          Stay Longer,
          <br />
          Save More
        </h3>
        <p className="mt-3 font-open-sans text-sm text-primary-foreground/85">
          It&apos;s simple: the longer you stay, the more you save!
        </p>
        <div className="mt-5 space-y-3 border-l-2 border-white/40 pl-4">
          <p className="font-open-sans text-sm">
            Save up to 20% off the nightly rate on stays between 7-14 nights
          </p>
          <p className="font-open-sans text-sm">
            Save up to 30% off the nightly rate on stays between 14-29 nights
          </p>
        </div>
      </div>
    </aside>
  );
};

export default RoomBookingSidebar;
