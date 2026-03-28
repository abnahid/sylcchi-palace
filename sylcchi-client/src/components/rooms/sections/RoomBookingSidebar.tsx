"use client";

import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useState } from "react";

type RoomBookingSidebarProps = {
  nightlyPrice: number;
};

const RoomBookingSidebar = ({ nightlyPrice }: RoomBookingSidebarProps) => {
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [openCalendar, setOpenCalendar] = useState<
    "checkIn" | "checkOut" | null
  >(null);

  const addOneDay = (date: Date) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  };

  return (
    <aside className="h-fit rounded-xl bg-[#f7fafd] p-6">
      <p className="font-mulish text-5xl font-extrabold text-primary">
        ${Math.round(nightlyPrice)}
        <span className="ml-1 font-open-sans text-base font-normal text-[#707884]">
          / 1 night
        </span>
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => event.preventDefault()}
      >
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
                  onSelect={(date) => {
                    if (!date) {
                      setCheckInDate(undefined);
                      return;
                    }

                    setCheckInDate(date);

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
                  disabled={(date) =>
                    checkInDate ? date <= checkInDate : false
                  }
                  onSelect={(date) => {
                    setCheckOutDate(date);
                    setOpenCalendar(null);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
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
