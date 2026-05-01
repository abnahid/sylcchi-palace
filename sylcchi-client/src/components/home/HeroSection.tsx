"use client";

import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarDays, UserRound } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const heroContent = {
  title: "Sylcchi Palace - luxury comfort in the heart of Sylhet",
  description:
    "Experience refined rooms, warm hospitality, and a premium stay designed for both leisure and business travelers.",
  image: "/assets/homa-hero.webp",
};

const guestOptions = ["1 guest", "2 guests", "3 guests", "4+ guests"];

export default function HeroSection() {
  const router = useRouter();
  const [checkInDate, setCheckInDate] = useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>();
  const [guests, setGuests] = useState("1");
  const [openCalendar, setOpenCalendar] = useState<
    "checkIn" | "checkOut" | null
  >(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const addOneDay = (date: Date) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
  };

  const toDateString = (date: Date) => format(date, "yyyy-MM-dd");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkInDate) params.set("checkIn", toDateString(checkInDate));
    if (checkOutDate) params.set("checkOut", toDateString(checkOutDate));
    const guestNum = Number.parseInt(guests, 10);
    if (guestNum > 1) params.set("guests", String(guestNum));
    const qs = params.toString();
    router.push(qs ? `/rooms?${qs}` : "/rooms");
  };

  return (
    <section className="bg-white dark:bg-[#101e2e] pt-4 pb-8 sm:pt-6 sm:pb-16">
      <div className="mx-auto w-full max-w-370 px-3 sm:px-6">
        <div className="grid grid-cols-1 overflow-visible lg:grid-cols-2">
          <div className="bg-[#edf1f5] dark:bg-[#0a1622] px-4 py-8 sm:px-10 sm:py-12 lg:px-20 lg:py-16">
            <h1 className="max-w-130 font-mulish text-4xl font-extrabold leading-[1.08] text-[#0d1720] dark:text-white sm:text-5xl">
              {heroContent.title}
            </h1>

            <div className="mt-7 flex max-w-117.5 items-start gap-4">
              <span className="mt-1 h-18 w-0.75 shrink-0 bg-[#2e5f8c]" />
              <p className="font-open-sans text-[14px] leading-6 text-[#5b6774] dark:text-[#9aa5b0]">
                {heroContent.description}
              </p>
            </div>

            <div className="relative z-10 mt-8 w-full max-w-162.5 rounded-md bg-white dark:bg-[#101e2e] ring-1 ring-black/5 dark:ring-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <div className="relative border-b border-[#eff2f5] dark:border-[#1d3145] px-4 py-3 md:border-r md:border-b-0">
                  <p className="font-mulish text-[12px] font-bold text-[#101b25] dark:text-[#e8edf2]">
                    Check-in
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenCalendar((prev) =>
                        prev === "checkIn" ? null : "checkIn",
                      )
                    }
                    className="mt-1 flex w-full items-center gap-2 text-left text-[#7e8894] dark:text-[#7d8a96]"
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span className="font-open-sans text-[13px]">
                      {checkInDate
                        ? format(checkInDate, "dd MMM yyyy")
                        : "Add date"}
                    </span>
                  </button>

                  {openCalendar === "checkIn" && (
                    <div className="absolute  z-80 rounded-lg border dark:border-[#243443] bg-white dark:bg-[#101e2e] p-2 shadow-xl">
                      <Calendar
                        mode="single"
                        selected={checkInDate}
                        disabled={(date) => date < today}
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

                <div className="relative border-b border-[#eff2f5] dark:border-[#1d3145] px-4 py-3 md:border-r md:border-b-0">
                  <p className="font-mulish text-[12px] font-bold text-[#101b25] dark:text-[#e8edf2]">
                    Check-out
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenCalendar((prev) =>
                        prev === "checkOut" ? null : "checkOut",
                      )
                    }
                    className="mt-1 flex w-full items-center gap-2 text-left text-[#7e8894] dark:text-[#7d8a96]"
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span className="font-open-sans text-[13px]">
                      {checkOutDate
                        ? format(checkOutDate, "dd MMM yyyy")
                        : "Add date"}
                    </span>
                  </button>

                  {openCalendar === "checkOut" && (
                    <div className="absolute  z-80 rounded-lg border dark:border-[#243443] bg-white dark:bg-[#101e2e] p-2 shadow-xl">
                      <Calendar
                        mode="single"
                        selected={checkOutDate}
                        disabled={(date) => {
                          const minDate = checkInDate ?? today;
                          return date <= minDate;
                        }}
                        onSelect={(date) => {
                          setCheckOutDate(date);
                          setOpenCalendar(null);
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="border-b border-[#eff2f5] dark:border-[#1d3145] px-4 py-3 md:border-r md:border-b-0 lg:border-r">
                  <p className="font-mulish text-[12px] font-bold text-[#101b25] dark:text-[#e8edf2]">
                    Guests
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[#7e8894] dark:text-[#7d8a96]">
                    <UserRound className="h-3.5 w-3.5" />
                    <select
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full bg-transparent font-open-sans text-[13px] outline-none"
                    >
                      {guestOptions.map((option, i) => (
                        <option key={option} value={String(i + 1)}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  className="col-span-1 rounded-b-md bg-primary px-4 py-4 text-center font-mulish text-[15px] font-semibold text-white transition-colors hover:bg-[#1f4f79] md:col-span-2 md:text-left lg:col-span-1 lg:rounded-b-none lg:rounded-r-md lg:px-6"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="relative h-80 sm:h-107.5 lg:h-140">
            <Image
              src={heroContent.image}
              alt="Sylcchi Palace room"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
