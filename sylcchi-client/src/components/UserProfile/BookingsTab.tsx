"use client";

import { useCancelBooking, useMyBookings } from "@/hooks/useBooking";
import type { BookingData } from "@/lib/types/booking";
import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  BedDouble,
  Calendar,
  CheckCircle,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Hash,
  Loader2,
  Plus,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type FilterType = "all" | "CONFIRMED" | "PENDING" | "CANCELLED";

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PENDING", label: "Pending" },
  { value: "CANCELLED", label: "Cancelled" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  CONFIRMED: {
    label: "Confirmed",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  PENDING: {
    label: "Pending",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-500 bg-red-50 border-red-200",
  },
};

function formatDate(value: string): string {
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}

export function BookingsTabContent({ userId }: { userId: string }) {
  const [filter, setFilter] = useState<FilterType>("all");
  const { data: bookings, isLoading, isError, error } = useMyBookings();
  const cancelMutation = useCancelBooking();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const allBookings = bookings ?? [];

  const filtered =
    filter === "all"
      ? allBookings
      : allBookings.filter(
          (b) => b.bookingStatus.toUpperCase() === filter,
        );

  const handleCancel = async (booking: BookingData) => {
    setCancellingId(booking.id);
    try {
      await cancelMutation.mutateAsync({ bookingId: booking.id });
    } catch {
      // Error handled by React Query
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[#235784]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[16px] border border-red-200 bg-white p-8 text-center">
        <AlertCircle size={36} className="mx-auto mb-3 text-red-400" />
        <p className="text-[15px] font-bold text-[#040b11]">
          Could not load bookings
        </p>
        <p className="mt-1 text-[13px] text-[#808385]">
          {error?.message ?? "Please try again later."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTER_OPTIONS.map((f) => {
          const count =
            f.value === "all"
              ? allBookings.length
              : allBookings.filter(
                  (b) => b.bookingStatus.toUpperCase() === f.value,
                ).length;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-4 py-1.5 text-[13px] transition-all ${
                filter === f.value
                  ? "border-[#235784] bg-[#235784] text-white"
                  : "border-[#e0e0e0] bg-white text-[#808385] hover:border-[#235784] hover:text-[#235784]"
              }`}
              style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Booking cards */}
      <div className="space-y-4">
        {filtered.map((booking) => {
          const statusKey = booking.bookingStatus.toUpperCase();
          const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.PENDING;
          const roomImage = booking.room?.images?.[0]?.imageUrl;
          const canCancel =
            statusKey === "CONFIRMED" || statusKey === "PENDING";

          return (
            <div
              key={booking.id}
              className="overflow-hidden rounded-[16px] border border-[#e8edf2] bg-white transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row">
                {roomImage && (
                  <div className="h-[120px] flex-shrink-0 sm:h-auto sm:w-[160px]">
                    <img
                      src={roomImage}
                      alt={booking.room?.name ?? "Room"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-5">
                  {/* Header */}
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] ${cfg.color}`}
                          style={{
                            fontFamily: "Mulish, sans-serif",
                            fontWeight: 700,
                          }}
                        >
                          {cfg.label}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-[#808385]">
                          <Hash size={10} /> {booking.bookingCode}
                        </span>
                        {booking.paymentStatus.toUpperCase() === "PAID" && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                            <CheckCircle size={10} /> Paid
                          </span>
                        )}
                        {booking.paymentStatus.toUpperCase() === "PARTIAL" && (
                          <span className="flex items-center gap-1 text-[11px] text-blue-600">
                            <CheckCircle size={10} /> Partial
                          </span>
                        )}
                      </div>
                      <p
                        className="text-[15px] leading-snug text-[#040b11]"
                        style={{
                          fontFamily: "Mulish, sans-serif",
                          fontWeight: 700,
                        }}
                      >
                        {booking.room?.name ?? "Room"}
                      </p>
                    </div>
                    <p
                      className="flex-shrink-0 text-[18px] text-[#235784]"
                      style={{
                        fontFamily: "Mulish, sans-serif",
                        fontWeight: 800,
                      }}
                    >
                      ${Number(booking.totalPrice).toFixed(2)}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="mb-3 flex flex-wrap gap-4 text-[13px] text-[#808385]">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#235784]" />
                      {formatDate(booking.checkInDate)} —{" "}
                      {formatDate(booking.checkOutDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-[#235784]" />
                      {booking.nights} night{booking.nights > 1 ? "s" : ""}
                    </span>
                    {Number(booking.paidAmount) > 0 && (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle size={13} className="text-green-500" />$
                        {Number(booking.paidAmount).toFixed(2)} paid
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/booking/confirmation?bookingId=${booking.id}`}
                      className="flex items-center gap-1 text-[13px] text-[#235784] hover:underline"
                      style={{
                        fontFamily: "Mulish, sans-serif",
                        fontWeight: 700,
                      }}
                    >
                      View Details <ChevronRight size={13} />
                    </Link>
                    {statusKey === "CONFIRMED" &&
                      booking.checkin?.status === "CHECKED_IN" && (
                        <span
                          className="flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-1 text-[12px] text-emerald-700"
                          style={{
                            fontFamily: "Mulish, sans-serif",
                            fontWeight: 700,
                          }}
                        >
                          <CheckCircle size={12} /> Checked In
                        </span>
                      )}
                    {statusKey === "CONFIRMED" &&
                      booking.checkin?.status === "CHECKED_OUT" && (
                        <span
                          className="flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-3 py-1 text-[12px] text-slate-500"
                          style={{
                            fontFamily: "Mulish, sans-serif",
                            fontWeight: 700,
                          }}
                        >
                          <CheckCircle size={12} /> Checked Out
                        </span>
                      )}
                    {statusKey === "CONFIRMED" &&
                      (!booking.checkin ||
                        booking.checkin.status === "PENDING") && (
                        <Link
                          href={`/checkin?code=${booking.bookingCode}`}
                          className="flex items-center gap-1 rounded-md bg-[#235784] px-3 py-1 text-[12px] text-white transition-colors hover:bg-[#1a4a6d]"
                          style={{
                            fontFamily: "Mulish, sans-serif",
                            fontWeight: 700,
                          }}
                        >
                          <ClipboardCheck size={12} /> Check-in
                        </Link>
                      )}
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(booking)}
                        disabled={cancellingId === booking.id}
                        className="text-[13px] text-red-400 transition-colors hover:text-red-600 disabled:opacity-50"
                      >
                        {cancellingId === booking.id
                          ? "Cancelling..."
                          : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <BedDouble size={40} className="mx-auto mb-3 text-[#DDEAF6]" />
            <p
              className="mb-1 text-[16px] text-[#040b11]"
              style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
            >
              No bookings found
            </p>
            <p className="mb-4 text-[14px] text-[#808385]">
              {filter !== "all"
                ? `No ${filter.toLowerCase()} bookings yet.`
                : "You haven't made any bookings yet."}
            </p>
            <Link
              href="/rooms"
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#235784] px-6 py-2.5 text-[14px] text-white transition-colors hover:bg-[#1a4a6d]"
              style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
            >
              <Plus size={14} /> Book a Room
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
