import { format } from "date-fns";
import { CalendarDays, Hotel, Users } from "lucide-react";

type BookingStaySectionProps = {
  roomName: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  onGuestsChange: (nextGuests: number) => void;
};

export default function BookingStaySection({
  roomName,
  checkIn,
  checkOut,
  nights,
  guests,
  onGuestsChange,
}: BookingStaySectionProps) {
  return (
    <section className="rounded-2xl border border-[#dbe5ef] bg-white p-5 sm:p-6">
      <h2 className="font-mulish text-xl font-extrabold text-[#101b25]">
        Stay details
      </h2>

      <div className="mt-5 space-y-4">
        <div className="flex items-start gap-3">
          <Hotel className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1]">
              Room
            </p>
            <p className="font-mulish text-base font-bold text-[#101b25]">
              {roomName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[#dbe5ef] bg-[#f7fafd] px-4 py-3">
            <div className="mb-1 flex items-center gap-2 font-open-sans text-xs text-[#6c7b88]">
              <CalendarDays className="h-3.5 w-3.5" /> Check-in
            </div>
            <p className="font-mulish text-sm font-bold text-[#101b25]">
              {format(checkIn, "EEE, MMM d, yyyy")}
            </p>
          </div>

          <div className="rounded-lg border border-[#dbe5ef] bg-[#f7fafd] px-4 py-3">
            <div className="mb-1 flex items-center gap-2 font-open-sans text-xs text-[#6c7b88]">
              <CalendarDays className="h-3.5 w-3.5" /> Check-out
            </div>
            <p className="font-mulish text-sm font-bold text-[#101b25]">
              {format(checkOut, "EEE, MMM d, yyyy")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[#dbe5ef] bg-[#f7fafd] px-4 py-3">
            <p className="font-open-sans text-xs uppercase tracking-wide text-[#8593a1]">
              Duration
            </p>
            <p className="font-mulish text-sm font-bold text-[#101b25]">
              {nights} night{nights > 1 ? "s" : ""}
            </p>
          </div>

          <div className="rounded-lg border border-[#dbe5ef] bg-[#f7fafd] px-4 py-3">
            <label className="mb-1 flex items-center gap-2 font-open-sans text-xs uppercase tracking-wide text-[#8593a1]">
              <Users className="h-3.5 w-3.5" /> Guests
            </label>
            <select
              value={guests}
              onChange={(event) => onGuestsChange(Number(event.target.value))}
              className="w-full rounded-md border border-[#cfd9e3] bg-white px-2.5 py-1.5 font-open-sans text-sm text-[#2f3f4f] outline-none focus:border-primary"
            >
              {[1, 2, 3, 4, 5, 6].map((count) => (
                <option key={count} value={count}>
                  {count} guest{count > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
