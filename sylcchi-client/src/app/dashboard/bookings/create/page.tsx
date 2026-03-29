"use client";

import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Input } from "@/components/ui/input";
import { useCreateBooking } from "@/hooks/useBooking";
import { getRooms } from "@/lib/api/rooms";
import type { PrimaryRoom } from "@/lib/types/rooms";
import { Icon } from "@iconify/react";
import { CheckCircle, ChevronLeft, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "dates" | "room" | "details" | "confirm" | "done";

export default function CreateBookingPage() {
  const router = useRouter();
  const createBooking = useCreateBooking();

  // ── Step state ──
  const [step, setStep] = useState<Step>("dates");

  // ── Date selection ──
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  // ── Room selection ──
  const [rooms, setRooms] = useState<PrimaryRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<PrimaryRoom | null>(null);

  // ── Guest details ──
  const [guests, setGuests] = useState("1");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // ── Payment ──
  const [paymentMethod, setPaymentMethod] = useState<
    "pay_later" | "stripe" | "sslcommerz"
  >("pay_later");

  // ── Result ──
  const [bookingResult, setBookingResult] = useState<{
    bookingCode: string;
    totalPrice: number;
  } | null>(null);

  // ── Fetch available rooms for selected dates ──
  const handleSearchRooms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInDate || !checkOutDate) return;

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setRoomsError("Check-out must be after check-in date.");
      return;
    }

    setRoomsLoading(true);
    setRoomsError("");
    setRooms([]);
    setSelectedRoom(null);

    try {
      const result = (await getRooms({
        checkInDate,
        checkOutDate,
        isAvailable: true,
        limit: 50,
      })) as { data: { data: PrimaryRoom[] } };
      const available = result?.data?.data ?? [];
      setRooms(available);
      if (available.length === 0) {
        setRoomsError("No rooms available for these dates.");
      }
      setStep("room");
    } catch (err) {
      setRoomsError(
        err instanceof Error ? err.message : "Failed to load rooms",
      );
    } finally {
      setRoomsLoading(false);
    }
  };

  // ── Create booking ──
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    const result = await createBooking.mutateAsync({
      roomId: selectedRoom.id,
      checkInDate,
      checkOutDate,
      guests: Number(guests),
      guestDetails: [{ name: guestName, email: guestEmail, phone: guestPhone }],
      paymentMethod,
    });

    setBookingResult({
      bookingCode: result.bookingCode,
      totalPrice: result.totalPrice,
    });
    setStep("done");
  };

  // ── Calculate nights ──
  const nights =
    checkInDate && checkOutDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(checkOutDate).getTime() -
              new Date(checkInDate).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  const estimatedTotal = selectedRoom ? Number(selectedRoom.price) * nights : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Create Booking"
        description="Select dates, pick a room, and fill in guest details."
        actions={
          <Link
            href="/dashboard/bookings"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm hover:border-primary/30 hover:text-primary transition-all"
          >
            <ChevronLeft size={16} />
            Back to Bookings
          </Link>
        }
      />

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-1">
        {[
          { key: "dates", label: "Dates" },
          { key: "room", label: "Room" },
          { key: "details", label: "Details" },
          { key: "confirm", label: "Confirm" },
        ].map((s, i) => {
          const steps: Step[] = ["dates", "room", "details", "confirm"];
          const currentIdx = steps.indexOf(step === "done" ? "confirm" : step);
          const isActive = i <= currentIdx;
          const isDone = step === "done";
          return (
            <div key={s.key} className="flex items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isDone || isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isDone ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span
                className={`text-sm hidden sm:inline ${isActive || isDone ? "font-medium text-[#1a1a1a]" : "text-slate-400"}`}
              >
                {s.label}
              </span>
              {i < 3 && (
                <div
                  className={`h-px w-6 sm:w-10 mx-1 ${isActive || isDone ? "bg-primary" : "bg-slate-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Select Dates ── */}
      {step === "dates" && (
        <div className="mx-auto max-w-lg">
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#f5f3ff] text-primary flex items-center justify-center">
                <Icon icon="solar:calendar-date-linear" width={22} />
              </div>
              <div>
                <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish">
                  Select Dates
                </h3>
                <p className="text-xs text-slate-400">
                  We'll show available rooms for your dates
                </p>
              </div>
            </div>
            <form onSubmit={handleSearchRooms} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                    Check-in
                  </label>
                  <Input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                    Check-out
                  </label>
                  <Input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>
              {roomsError && (
                <p className="text-sm text-rose-600">{roomsError}</p>
              )}
              <button
                type="submit"
                disabled={roomsLoading}
                className="w-full px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
              >
                {roomsLoading ? "Searching..." : "Search Available Rooms"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Step 2: Select Room (Card Grid) ── */}
      {step === "room" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Showing <strong>{rooms.length}</strong> available rooms for{" "}
                <strong>{checkInDate}</strong> to{" "}
                <strong>{checkOutDate}</strong> ({nights} night
                {nights > 1 ? "s" : ""})
              </p>
            </div>
            <button
              onClick={() => setStep("dates")}
              className="text-sm text-primary hover:underline"
            >
              Change dates
            </button>
          </div>

          {rooms.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 text-center">
              <p className="text-slate-400">
                No rooms available for these dates.
              </p>
              <button
                onClick={() => setStep("dates")}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Try different dates
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  nights={nights}
                  selected={selectedRoom?.id === room.id}
                  onSelect={() => setSelectedRoom(room)}
                />
              ))}
            </div>
          )}

          {selectedRoom && (
            <div className="sticky bottom-6 mx-auto max-w-md">
              <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_-4px_rgba(88,2,247,0.15)] border border-primary/20 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">
                    {selectedRoom.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    ${Number(selectedRoom.price).toLocaleString()}/night ×{" "}
                    {nights} = $
                    {(Number(selectedRoom.price) * nights).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setStep("details")}
                  className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Guest Details ── */}
      {step === "details" && selectedRoom && (
        <div className="mx-auto max-w-lg space-y-4">
          {/* Selected room summary */}
          <div className="bg-white rounded-2xl p-4 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center gap-4">
            {selectedRoom.images?.[0] && (
              <Image
                src={selectedRoom.images[0].imageUrl}
                alt={selectedRoom.name}
                width={80}
                height={60}
                className="rounded-xl object-cover w-20 h-15"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-[#1a1a1a]">{selectedRoom.name}</p>
              <p className="text-xs text-slate-400">
                {checkInDate} → {checkOutDate} · {nights} night
                {nights > 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                ${estimatedTotal.toLocaleString()}
              </p>
              <button
                onClick={() => setStep("room")}
                className="text-xs text-slate-400 hover:text-primary"
              >
                Change room
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50">
            <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish mb-4">
              Guest Information
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep("confirm");
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Number of Guests
                </label>
                <Input
                  type="number"
                  min="1"
                  max={String(selectedRoom.capacity)}
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  required
                />
                <p className="mt-1 text-xs text-slate-400">
                  Max capacity: {selectedRoom.capacity} guests
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Full Name
                </label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="guest@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                    Phone
                  </label>
                  <Input
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+880..."
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("room")}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 transition-all"
                >
                  Review & Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Step 4: Confirm ── */}
      {step === "confirm" && selectedRoom && (
        <div className="mx-auto max-w-lg space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 space-y-5">
            <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish">
              Booking Summary
            </h3>

            {/* Room */}
            <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
              {selectedRoom.images?.[0] && (
                <Image
                  src={selectedRoom.images[0].imageUrl}
                  alt={selectedRoom.name}
                  width={64}
                  height={48}
                  className="rounded-lg object-cover w-16 h-12"
                />
              )}
              <div>
                <p className="font-medium text-[#1a1a1a]">
                  {selectedRoom.name}
                </p>
                <p className="text-xs text-slate-400">
                  {selectedRoom.roomType?.name} · {selectedRoom.bedType} · Max{" "}
                  {selectedRoom.capacity}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Check-in</p>
                <p className="font-medium text-[#1a1a1a]">{checkInDate}</p>
              </div>
              <div>
                <p className="text-slate-400">Check-out</p>
                <p className="font-medium text-[#1a1a1a]">{checkOutDate}</p>
              </div>
              <div>
                <p className="text-slate-400">Nights</p>
                <p className="font-medium text-[#1a1a1a]">{nights}</p>
              </div>
              <div>
                <p className="text-slate-400">Guests</p>
                <p className="font-medium text-[#1a1a1a]">{guests}</p>
              </div>
            </div>

            {/* Guest */}
            <div className="rounded-xl bg-slate-50 p-4 text-sm">
              <p className="text-xs uppercase font-semibold text-slate-400 mb-1">
                Guest
              </p>
              <p className="font-medium text-[#1a1a1a]">{guestName}</p>
              <p className="text-slate-500">
                {guestEmail} · {guestPhone}
              </p>
            </div>

            {/* Pricing */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">
                  ${Number(selectedRoom.price).toLocaleString()} × {nights}{" "}
                  nights
                </span>
                <span className="font-medium text-[#1a1a1a]">
                  ${estimatedTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    {
                      value: "pay_later",
                      label: "Pay Later",
                      icon: "solar:clock-circle-linear",
                    },
                    {
                      value: "stripe",
                      label: "Stripe",
                      icon: "solar:card-linear",
                    },
                    {
                      value: "sslcommerz",
                      label: "SSLCommerz",
                      icon: "solar:wallet-money-linear",
                    },
                  ] as const
                ).map((pm) => (
                  <button
                    key={pm.value}
                    type="button"
                    onClick={() => setPaymentMethod(pm.value)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all ${
                      paymentMethod === pm.value
                        ? "border-primary bg-[#f5f3ff] text-primary"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <Icon icon={pm.icon} width={20} />
                    {pm.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {paymentMethod === "pay_later"
                  ? "Guest pays at check-in. Booking will be marked as pending payment."
                  : paymentMethod === "stripe"
                    ? "Guest will receive a Stripe payment link."
                    : "Guest will be redirected to SSLCommerz gateway."}
              </p>
            </div>

            {createBooking.isError && (
              <p className="text-sm text-rose-600">
                {createBooking.error.message}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep("details")}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={createBooking.isPending}
                className="flex-1 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all disabled:opacity-50"
              >
                {createBooking.isPending
                  ? "Creating..."
                  : "Confirm & Create Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 5: Done ── */}
      {step === "done" && bookingResult && (
        <div className="mx-auto max-w-lg">
          <div className="bg-white rounded-2xl p-8 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-[#1a1a1a] text-xl font-bold font-mulish">
              Booking Created
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Booking code:{" "}
              <span className="font-mono font-bold text-primary">
                {bookingResult.bookingCode}
              </span>
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Total: ${bookingResult.totalPrice.toLocaleString()}
            </p>
            <div className="flex gap-3 mt-6 justify-center">
              <Link
                href="/dashboard/bookings"
                className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                View Bookings
              </Link>
              <button
                onClick={() => {
                  setStep("dates");
                  setSelectedRoom(null);
                  setGuestName("");
                  setGuestEmail("");
                  setGuestPhone("");
                  setGuests("1");
                  setPaymentMethod("pay_later");
                  setBookingResult(null);
                  createBooking.reset();
                }}
                className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 transition-all"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Room Card Component ──

function RoomCard({
  room,
  nights,
  selected,
  onSelect,
}: {
  room: PrimaryRoom;
  nights: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const price = Number(room.price);
  const total = price * nights;

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer bg-white rounded-2xl overflow-hidden shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border transition-all duration-300 group ${
        selected
          ? "border-primary shadow-[0_8px_30px_-4px_rgba(88,2,247,0.12)] scale-[1.02]"
          : "border-slate-50 hover:shadow-[0_8px_30px_-4px_rgba(88,2,247,0.08)] hover:border-slate-200"
      }`}
    >
      {/* Image */}
      <div className="relative h-40 bg-slate-100 overflow-hidden">
        {room.images?.[0] ? (
          <Image
            src={room.images[0].imageUrl}
            alt={room.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <Icon icon="solar:gallery-linear" width={32} />
          </div>
        )}
        {selected && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <CheckCircle size={16} className="text-white" />
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <StatusBadge
            status={room.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-[#1a1a1a] font-mulish">
              {room.name}
            </h4>
            <p className="text-xs text-slate-400">
              {room.roomType?.name} · {room.bedType}
            </p>
          </div>
        </div>

        {/* Facilities */}
        {room.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {room.facilities.slice(0, 3).map((f) => (
              <span
                key={f}
                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-500"
              >
                {f}
              </span>
            ))}
            {room.facilities.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-400">
                +{room.facilities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price + Capacity */}
        <div className="flex items-end justify-between pt-2 border-t border-slate-50">
          <div>
            <p className="text-lg font-bold text-primary font-mulish">
              ${price.toLocaleString()}
              <span className="text-xs font-normal text-slate-400">/night</span>
            </p>
            <p className="text-xs text-slate-400">
              {nights} night{nights > 1 ? "s" : ""}: ${total.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Users size={14} />
            {room.capacity}
          </div>
        </div>
      </div>
    </div>
  );
}
