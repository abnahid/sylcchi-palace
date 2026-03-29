"use client";

import Modal from "@/components/dashboard/Modal";
import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@iconify/react";
import {
  useAllBookings,
  useCheckinLookup,
  useCheckinVerifyOtp,
  useCheckinComplete,
  useCheckoutGuest,
} from "@/hooks/useDashboard";
import type { AdminBookingData } from "@/lib/types/dashboard";
import { format } from "date-fns";
import { CheckCircle, LogOut, Search } from "lucide-react";
import { useState } from "react";

type CheckinStep = "list" | "lookup-result" | "otp" | "complete" | "done";

export default function CheckinPage() {
  const [step, setStep] = useState<CheckinStep>("list");
  const [lookupCode, setLookupCode] = useState("");
  const [otp, setOtp] = useState("");
  const [notes, setNotes] = useState("");
  const [lookupData, setLookupData] = useState<Record<string, unknown> | null>(null);
  const [checkoutTarget, setCheckoutTarget] = useState<AdminBookingData | null>(null);

  const lookup = useCheckinLookup();
  const verifyOtp = useCheckinVerifyOtp();
  const completeCheckin = useCheckinComplete();
  const checkoutGuest = useCheckoutGuest();

  // Fetch all bookings to show check-in status list
  const { data: bookingsData, isLoading, refetch } = useAllBookings({
    page: 1,
    limit: 50,
    status: "CONFIRMED",
  });
  const bookings = bookingsData?.data ?? [];

  // Separate by check-in status
  const pendingCheckin = bookings.filter(
    (b) => !b.checkin || b.checkin.status === "PENDING",
  );
  const checkedIn = bookings.filter(
    (b) => b.checkin?.status === "CHECKED_IN",
  );
  const checkedOut = bookings.filter(
    (b) => b.checkin?.status === "CHECKED_OUT",
  );

  const handleLookup = async (code: string) => {
    const identity = prompt("Enter guest email or phone for verification:");
    if (!identity) return;
    const result = await lookup.mutateAsync({ bookingCode: code, email: identity });
    setLookupData(result as unknown as Record<string, unknown>);
    setLookupCode(code);
    setStep("otp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const identity = (lookupData as Record<string, unknown>)?.identity as string | undefined;
    await verifyOtp.mutateAsync({
      bookingCode: lookupCode,
      otp,
    });
    setStep("complete");
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    // The verify-otp returns a checkinToken
    const token = (verifyOtp.data as Record<string, unknown>)?.checkinToken as string;
    if (!token) {
      alert("Check-in token missing. Please restart the process.");
      return;
    }
    await completeCheckin.mutateAsync({
      bookingCode: lookupCode,
      notes: notes || undefined,
    });
    setStep("done");
    refetch();
  };

  const handleCheckout = async (reservationId: string) => {
    if (!confirm("Check out this guest?")) return;
    await checkoutGuest.mutateAsync(reservationId);
    setCheckoutTarget(null);
    refetch();
  };

  const reset = () => {
    setStep("list");
    setLookupCode("");
    setLookupData(null);
    setOtp("");
    setNotes("");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Check-in / Check-out"
        description="Manage guest arrivals and departures."
        actions={
          <button
            onClick={() => {
              const code = prompt("Enter booking code:");
              if (code) handleLookup(code.trim());
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#5802f7] text-white text-sm font-medium shadow-lg shadow-[#5802f7]/30 hover:shadow-[#5802f7]/50 hover:-translate-y-0.5 transition-all"
          >
            <Icon icon="solar:clipboard-check-linear" width={18} />
            Manual Check-in
          </button>
        }
      />

      {/* Status Tabs */}
      {step === "list" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Icon icon="solar:clock-circle-linear" width={24} />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Awaiting Arrival</p>
                <p className="text-[#1a1a1a] text-2xl font-bold font-mulish">
                  {pendingCheckin.length}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Icon icon="solar:user-check-linear" width={24} />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Checked In</p>
                <p className="text-[#1a1a1a] text-2xl font-bold font-mulish">
                  {checkedIn.length}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                <Icon icon="solar:logout-2-linear" width={24} />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Checked Out</p>
                <p className="text-[#1a1a1a] text-2xl font-bold font-mulish">
                  {checkedOut.length}
                </p>
              </div>
            </div>
          </div>

          {/* Awaiting Arrival */}
          <div className="bg-white rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish">
                Awaiting Arrival
              </h3>
              <p className="text-xs text-slate-400">
                Confirmed bookings not yet checked in
              </p>
            </div>
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-50 animate-pulse" />
                ))}
              </div>
            ) : pendingCheckin.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No guests awaiting arrival
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {pendingCheckin.map((b) => (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    action={
                      <button
                        onClick={() => handleLookup(b.bookingCode)}
                        disabled={lookup.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5802f7] text-white text-xs font-medium shadow-sm shadow-[#5802f7]/20 hover:shadow-[#5802f7]/40 transition-all disabled:opacity-50"
                      >
                        <Icon icon="solar:clipboard-check-linear" width={14} />
                        Check In
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Currently Checked In */}
          {checkedIn.length > 0 && (
            <div className="bg-white rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish">
                  Currently Checked In
                </h3>
                <p className="text-xs text-slate-400">
                  Active guests in hotel
                </p>
              </div>
              <div className="divide-y divide-slate-50">
                {checkedIn.map((b) => (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    action={
                      <button
                        onClick={() => setCheckoutTarget(b)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-rose-50 hover:text-rose-600 transition-all"
                      >
                        <LogOut size={14} />
                        Check Out
                      </button>
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Checked Out */}
          {checkedOut.length > 0 && (
            <div className="bg-white rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish">
                  Checked Out
                </h3>
                <p className="text-xs text-slate-400">Departed guests</p>
              </div>
              <div className="divide-y divide-slate-50">
                {checkedOut.map((b) => (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    action={
                      <StatusBadge status="CHECKED_OUT" />
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* OTP Step */}
      {step === "otp" && (
        <div className="mx-auto max-w-lg space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50">
            <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish mb-2">
              Verify Guest Identity
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              OTP sent to guest for booking <strong>#{lookupCode}</strong>.
              Enter it below.
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
              {verifyOtp.isError && (
                <p className="text-sm text-rose-600">
                  {verifyOtp.error.message}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyOtp.isPending}
                  className="flex-1 px-5 py-2.5 rounded-lg bg-[#5802f7] text-white text-sm font-medium shadow-lg shadow-[#5802f7]/30 transition-all disabled:opacity-50"
                >
                  {verifyOtp.isPending ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Step */}
      {step === "complete" && (
        <div className="mx-auto max-w-lg">
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish">
                  OTP Verified
                </h3>
                <p className="text-xs text-slate-400">
                  Complete the check-in for #{lookupCode}
                </p>
              </div>
            </div>
            <form onSubmit={handleComplete} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Notes (optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special requests, room preferences..."
                  rows={3}
                />
              </div>
              {completeCheckin.isError && (
                <p className="text-sm text-rose-600">
                  {completeCheckin.error.message}
                </p>
              )}
              <button
                type="submit"
                disabled={completeCheckin.isPending}
                className="w-full px-5 py-2.5 rounded-lg bg-[#5802f7] text-white text-sm font-medium shadow-lg shadow-[#5802f7]/30 transition-all disabled:opacity-50"
              >
                {completeCheckin.isPending
                  ? "Processing..."
                  : "Complete Check-in"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Done */}
      {step === "done" && (
        <div className="mx-auto max-w-lg">
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-[#1a1a1a] text-xl font-bold font-mulish">
              Check-in Complete
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Guest has been checked in for booking{" "}
              <strong>#{lookupCode}</strong>.
            </p>
            <button
              onClick={reset}
              className="mt-6 px-5 py-2.5 rounded-lg bg-[#5802f7] text-white text-sm font-medium shadow-lg shadow-[#5802f7]/30 transition-all"
            >
              Back to List
            </button>
          </div>
        </div>
      )}

      {/* Checkout Confirmation Modal */}
      <Modal
        open={!!checkoutTarget}
        onClose={() => setCheckoutTarget(null)}
        title="Confirm Check-out"
        description={`Booking #${checkoutTarget?.bookingCode ?? ""}`}
      >
        {checkoutTarget && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Guest</p>
                <p className="font-medium text-[#1a1a1a]">
                  {checkoutTarget.user?.name ??
                    checkoutTarget.guestDetails?.[0]?.name ??
                    "Guest"}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Room</p>
                <p className="font-medium text-[#1a1a1a]">
                  {checkoutTarget.room?.name ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Check-in</p>
                <p className="font-medium text-[#1a1a1a]">
                  {format(
                    new Date(checkoutTarget.checkInDate),
                    "MMM dd, yyyy",
                  )}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Check-out</p>
                <p className="font-medium text-[#1a1a1a]">
                  {format(
                    new Date(checkoutTarget.checkOutDate),
                    "MMM dd, yyyy",
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={checkoutTarget.paymentStatus} />
              {Number(checkoutTarget.remainingAmount) > 0 && (
                <span className="text-xs text-orange-600 font-medium">
                  ${Number(checkoutTarget.remainingAmount).toLocaleString()}{" "}
                  remaining
                </span>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCheckoutTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCheckout(checkoutTarget.id)}
                disabled={checkoutGuest.isPending}
                className="flex-1 px-5 py-2.5 rounded-lg bg-rose-500 text-white text-sm font-medium shadow-lg shadow-rose-500/30 transition-all disabled:opacity-50"
              >
                {checkoutGuest.isPending
                  ? "Processing..."
                  : "Confirm Check-out"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Booking Row Component ──

function BookingRow({
  booking,
  action,
}: {
  booking: AdminBookingData;
  action: React.ReactNode;
}) {
  const guestName =
    booking.user?.name ?? booking.guestDetails?.[0]?.name ?? "Guest";
  const guestEmail =
    booking.user?.email ?? booking.guestDetails?.[0]?.email ?? "";
  const initials = guestName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-purple-100 text-purple-600",
    "bg-rose-100 text-rose-600",
    "bg-teal-100 text-teal-600",
  ];

  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/80 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${colors[guestName.charCodeAt(0) % colors.length]}`}
        >
          {initials}
        </div>
        <div>
          <p className="font-medium text-[#1a1a1a]">{guestName}</p>
          <p className="text-xs text-slate-400">{guestEmail}</p>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-6 text-sm text-slate-500">
        <div className="text-center">
          <p className="text-xs text-slate-400">Room</p>
          <p className="font-medium text-[#1a1a1a]">
            {booking.room?.name ?? "—"}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400">Check-in</p>
          <p className="font-medium">
            {format(new Date(booking.checkInDate), "MMM dd")}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400">Check-out</p>
          <p className="font-medium">
            {format(new Date(booking.checkOutDate), "MMM dd")}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400">Payment</p>
          <StatusBadge status={booking.paymentStatus} />
        </div>
      </div>

      <div className="ml-4">{action}</div>
    </div>
  );
}
