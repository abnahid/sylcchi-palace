"use client";

import Modal from "@/components/dashboard/Modal";
import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useAllBookings,
  useCheckinComplete,
  useCheckinLookup,
  useCheckinVerifyOtp,
  useCheckoutGuest,
} from "@/hooks/useDashboard";
import type { AdminBookingData } from "@/lib/types/dashboard";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { CheckCircle, LogOut } from "lucide-react";
import { useState } from "react";

export default function CheckinPage() {
  // ── Check-in flow state ──
  const [checkinModal, setCheckinModal] = useState(false);
  const [checkinBooking, setCheckinBooking] = useState<AdminBookingData | null>(
    null,
  );
  const [identity, setIdentity] = useState("");
  const [otp, setOtp] = useState("");
  const [notes, setNotes] = useState("");
  const [checkinToken, setCheckinToken] = useState("");
  const [checkinStep, setCheckinStep] = useState<
    "identity" | "otp" | "complete" | "done"
  >("identity");
  const [verifiedBookingInfo, setVerifiedBookingInfo] = useState<Record<
    string,
    unknown
  > | null>(null);

  // ── Checkout state ──
  const [checkoutTarget, setCheckoutTarget] = useState<AdminBookingData | null>(
    null,
  );

  // ── Manual lookup state ──
  const [manualModal, setManualModal] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [manualIdentity, setManualIdentity] = useState("");

  // ── Hooks ──
  const lookup = useCheckinLookup();
  const verifyOtp = useCheckinVerifyOtp();
  const completeCheckin = useCheckinComplete();
  const checkoutGuest = useCheckoutGuest();

  const {
    data: bookingsData,
    isLoading,
    refetch,
  } = useAllBookings({
    page: 1,
    limit: 50,
    status: "CONFIRMED",
  });
  const bookings = bookingsData?.data ?? [];

  const pendingCheckin = bookings.filter(
    (b) => !b.checkin || b.checkin.status === "PENDING",
  );
  const checkedIn = bookings.filter((b) => b.checkin?.status === "CHECKED_IN");
  const checkedOut = bookings.filter(
    (b) => b.checkin?.status === "CHECKED_OUT",
  );

  // ── Start check-in for a booking ──
  const startCheckin = (booking: AdminBookingData) => {
    setCheckinBooking(booking);
    setIdentity(booking.user?.email ?? booking.guestDetails?.[0]?.email ?? "");
    setOtp("");
    setNotes("");
    setCheckinToken("");
    setCheckinStep("identity");
    setVerifiedBookingInfo(null);
    setCheckinModal(true);
  };

  // ── Step 1: Lookup (sends OTP) ──
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = checkinBooking?.bookingCode ?? manualCode;
    const id = identity || manualIdentity;
    if (!code || !id) return;

    await lookup.mutateAsync({ bookingCode: code, identity: id });

    if (manualModal) {
      setManualModal(false);
      setCheckinBooking(null);
      setIdentity(manualIdentity);
      // reuse manualCode as bookingCode
      setCheckinBooking({ bookingCode: manualCode } as AdminBookingData);
    }
    setCheckinStep("otp");
  };

  // ── Step 2: Verify OTP ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = checkinBooking?.bookingCode ?? manualCode;
    const result = await verifyOtp.mutateAsync({
      bookingCode: code,
      identity,
      otp,
    });
    setCheckinToken(result.data.checkinToken);
    setVerifiedBookingInfo(
      result.data.booking as unknown as Record<string, unknown>,
    );
    setCheckinStep("complete");
  };

  // ── Step 3: Complete ──
  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeCheckin.mutateAsync({
      checkinToken,
      notes: notes || undefined,
    });
    setCheckinStep("done");
    refetch();
  };

  // ── Checkout ──
  const handleCheckout = async (reservationId: string) => {
    await checkoutGuest.mutateAsync(reservationId);
    setCheckoutTarget(null);
    refetch();
  };

  // ── Reset ──
  const resetCheckin = () => {
    setCheckinModal(false);
    setCheckinBooking(null);
    setIdentity("");
    setOtp("");
    setNotes("");
    setCheckinToken("");
    setCheckinStep("identity");
    setVerifiedBookingInfo(null);
    lookup.reset();
    verifyOtp.reset();
    completeCheckin.reset();
  };

  // ── Manual lookup ──
  const handleManualLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode || !manualIdentity) return;
    await lookup.mutateAsync({
      bookingCode: manualCode,
      identity: manualIdentity,
    });
    setIdentity(manualIdentity);
    setCheckinBooking({ bookingCode: manualCode } as AdminBookingData);
    setManualModal(false);
    setCheckinModal(true);
    setCheckinStep("otp");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Check-in / Check-out"
        description="Manage guest arrivals and departures."
        actions={
          <button
            onClick={() => {
              setManualCode("");
              setManualIdentity("");
              lookup.reset();
              setManualModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all"
          >
            <Icon icon="solar:clipboard-check-linear" width={18} />
            Manual Check-in
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SummaryCard
          icon="solar:clock-circle-linear"
          iconBg="bg-orange-50 text-orange-500"
          label="Awaiting Arrival"
          value={pendingCheckin.length}
        />
        <SummaryCard
          icon="solar:user-check-linear"
          iconBg="bg-emerald-50 text-emerald-600"
          label="Checked In"
          value={checkedIn.length}
        />
        <SummaryCard
          icon="solar:logout-2-linear"
          iconBg="bg-slate-100 text-slate-500"
          label="Checked Out"
          value={checkedOut.length}
        />
      </div>

      {/* Awaiting Arrival */}
      <BookingSection
        title="Awaiting Arrival"
        subtitle="Confirmed bookings not yet checked in"
        bookings={pendingCheckin}
        isLoading={isLoading}
        emptyMessage="No guests awaiting arrival"
        renderAction={(b) => (
          <button
            onClick={() => startCheckin(b)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium shadow-sm shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            <Icon icon="solar:clipboard-check-linear" width={14} />
            Check In
          </button>
        )}
      />

      {/* Currently Checked In */}
      {checkedIn.length > 0 && (
        <BookingSection
          title="Currently Checked In"
          subtitle="Active guests in hotel"
          bookings={checkedIn}
          isLoading={false}
          emptyMessage=""
          renderAction={(b) => (
            <button
              onClick={() => setCheckoutTarget(b)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-rose-50 hover:text-rose-600 transition-all"
            >
              <LogOut size={14} />
              Check Out
            </button>
          )}
        />
      )}

      {/* Checked Out */}
      {checkedOut.length > 0 && (
        <BookingSection
          title="Checked Out"
          subtitle="Departed guests"
          bookings={checkedOut}
          isLoading={false}
          emptyMessage=""
          renderAction={() => <StatusBadge status="CHECKED_OUT" />}
        />
      )}

      {/* ── Manual Lookup Modal ── */}
      <Modal
        open={manualModal}
        onClose={() => setManualModal(false)}
        title="Manual Check-in"
        description="Enter the booking code and guest email/phone to start."
      >
        <form onSubmit={handleManualLookup} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
              Booking Code
            </label>
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. BK-ABC123"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
              Guest Email or Phone
            </label>
            <Input
              value={manualIdentity}
              onChange={(e) => setManualIdentity(e.target.value)}
              placeholder="guest@email.com or +880..."
              required
            />
            <p className="mt-1 text-xs text-slate-400">
              Must match the booking guest details. OTP will be sent here.
            </p>
          </div>
          {lookup.isError && (
            <p className="text-sm text-rose-600">{lookup.error.message}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setManualModal(false)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={lookup.isPending}
              className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
            >
              {lookup.isPending ? "Sending OTP..." : "Send OTP & Continue"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Check-in Flow Modal ── */}
      <Modal
        open={checkinModal}
        onClose={resetCheckin}
        title={
          checkinStep === "done"
            ? "Check-in Complete"
            : checkinStep === "complete"
              ? "Complete Check-in"
              : checkinStep === "otp"
                ? "Verify OTP"
                : "Verify Guest Identity"
        }
        description={
          checkinBooking ? `Booking #${checkinBooking.bookingCode}` : undefined
        }
      >
        {/* Step: Identity */}
        {checkinStep === "identity" && (
          <form onSubmit={handleLookup} className="space-y-4">
            {checkinBooking?.user && (
              <div className="rounded-xl bg-slate-50 p-4 text-sm">
                <p className="text-slate-400 text-xs uppercase font-semibold mb-1">
                  Guest
                </p>
                <p className="font-medium text-[#1a1a1a]">
                  {checkinBooking.user.name}
                </p>
                <p className="text-slate-500">{checkinBooking.user.email}</p>
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                Guest Email or Phone
              </label>
              <Input
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="guest@email.com or +880..."
                required
              />
              <p className="mt-1 text-xs text-slate-400">
                Must match the booking. An OTP will be sent to verify.
              </p>
            </div>
            {lookup.isError && (
              <p className="text-sm text-rose-600">{lookup.error.message}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={resetCheckin}
                className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={lookup.isPending}
                className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
              >
                {lookup.isPending ? "Sending OTP..." : "Send OTP"}
              </button>
            </div>
          </form>
        )}

        {/* Step: OTP */}
        {checkinStep === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-slate-500">
              An OTP has been sent to <strong>{identity}</strong>. Enter it
              below.
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                OTP Code
              </label>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
            </div>
            {verifyOtp.isError && (
              <p className="text-sm text-rose-600">{verifyOtp.error.message}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCheckinStep("identity")}
                className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={verifyOtp.isPending}
                className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
              >
                {verifyOtp.isPending ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>
        )}

        {/* Step: Complete */}
        {checkinStep === "complete" && (
          <form onSubmit={handleComplete} className="space-y-4">
            {/* Booking details from verify response */}
            {verifiedBookingInfo && (
              <div className="rounded-xl bg-slate-50 p-4 text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-slate-400 text-xs">Room</p>
                    <p className="font-medium text-[#1a1a1a]">
                      {(verifiedBookingInfo.room as { name: string })?.name ??
                        "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Total</p>
                    <p className="font-medium text-[#1a1a1a]">
                      ${Number(verifiedBookingInfo.total ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Paid</p>
                    <p className="font-medium text-emerald-600">
                      ${Number(verifiedBookingInfo.paid ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Due</p>
                    <p
                      className={`font-medium ${Number(verifiedBookingInfo.due ?? 0) > 0 ? "text-rose-600" : "text-slate-500"}`}
                    >
                      ${Number(verifiedBookingInfo.due ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
              className="w-full px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
            >
              {completeCheckin.isPending
                ? "Processing..."
                : "Complete Check-in"}
            </button>
          </form>
        )}

        {/* Step: Done */}
        {checkinStep === "done" && (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle size={28} className="text-emerald-600" />
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Guest has been checked in successfully.
            </p>
            <button
              onClick={resetCheckin}
              className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </Modal>

      {/* ── Checkout Confirmation Modal ── */}
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
                  {format(new Date(checkoutTarget.checkInDate), "MMM dd, yyyy")}
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
            {checkoutGuest.isError && (
              <p className="text-sm text-rose-600">
                {checkoutGuest.error.message}
              </p>
            )}
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

// ── Summary Card ──
function SummaryCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: string;
  iconBg: string;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}
      >
        <Icon icon={icon} width={24} />
      </div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-[#1a1a1a] text-2xl font-bold font-mulish">{value}</p>
      </div>
    </div>
  );
}

// ── Booking Section ──
function BookingSection({
  title,
  subtitle,
  bookings,
  isLoading,
  emptyMessage,
  renderAction,
}: {
  title: string;
  subtitle: string;
  bookings: AdminBookingData[];
  isLoading: boolean;
  emptyMessage: string;
  renderAction: (b: AdminBookingData) => React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
      <div className="p-6 border-b border-slate-50">
        <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish">
          {title}
        </h3>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
      {isLoading ? (
        <div className="p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-slate-50 animate-pulse"
            />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {bookings.map((b) => (
            <BookingRow key={b.id} booking={b} action={renderAction(b)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Booking Row ──
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
