"use client";

import BookingGuestsSection from "@/components/booking/sections/BookingGuestsSection";
import BookingHeroSection from "@/components/booking/sections/BookingHeroSection";
import BookingPaymentSection from "@/components/booking/sections/BookingPaymentSection";
import BookingPriceSummarySection from "@/components/booking/sections/BookingPriceSummarySection";
import BookingStaySection from "@/components/booking/sections/BookingStaySection";
import { useSession } from "@/hooks/useAuth";
import { useCreateBooking, usePayBooking } from "@/hooks/useBooking";
import { useRooms } from "@/hooks/useRooms";
import type { BookingGuestInput } from "@/lib/types/booking";
import { differenceInCalendarDays, parseISO } from "date-fns";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

function toDateOnlyString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function createEmptyGuest(): BookingGuestInput {
  return {
    name: "",
    email: "",
    phone: "",
  };
}

function BookingFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomIdParam = searchParams.get("roomId") ?? "";
  const roomSlugParam = searchParams.get("slug") ?? "";
  const checkInParam = searchParams.get("checkIn") ?? "";
  const checkOutParam = searchParams.get("checkOut") ?? "";

  const { data: sessionUser } = useSession();
  const { data: rooms = [], isLoading: isRoomsLoading } = useRooms();

  const createBookingMutation = useCreateBooking();
  const payBookingMutation = usePayBooking();

  const room = useMemo(
    () =>
      rooms.find(
        (item) => item.id === roomIdParam || item.slug === roomSlugParam,
      ),
    [roomIdParam, roomSlugParam, rooms],
  );

  const checkInDate = useMemo(() => {
    if (!checkInParam) {
      return null;
    }

    const parsed = parseISO(checkInParam);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [checkInParam]);

  const checkOutDate = useMemo(() => {
    if (!checkOutParam) {
      return null;
    }

    const parsed = parseISO(checkOutParam);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [checkOutParam]);

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) {
      return 0;
    }

    return Math.max(0, differenceInCalendarDays(checkOutDate, checkInDate));
  }, [checkInDate, checkOutDate]);

  const [guestsCount, setGuestsCount] = useState(1);
  const [guestDetails, setGuestDetails] = useState<BookingGuestInput[]>([
    createEmptyGuest(),
  ]);
  const [paymentMethod, setPaymentMethod] = useState<
    "stripe" | "sslcommerz" | "pay_later"
  >("pay_later");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const guestErrors = useMemo(() => {
    return guestDetails.map((guest) => {
      if (!guest.name.trim() || !guest.email.trim() || !guest.phone.trim()) {
        return "Name, email and phone are required for each guest.";
      }

      return "";
    });
  }, [guestDetails]);

  const handleGuestsCountChange = (nextCount: number) => {
    const safeCount = Math.min(6, Math.max(1, nextCount));
    setGuestsCount(safeCount);

    setGuestDetails((previous) => {
      if (previous.length === safeCount) {
        return previous;
      }

      if (previous.length > safeCount) {
        return previous.slice(0, safeCount);
      }

      return [
        ...previous,
        ...Array.from({ length: safeCount - previous.length }, () =>
          createEmptyGuest(),
        ),
      ];
    });
  };

  const handleGuestChange = (
    index: number,
    field: keyof BookingGuestInput,
    value: string,
  ) => {
    setGuestDetails((previous) => {
      const next = [...previous];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  };

  const bookingPath = `/booking?roomId=${encodeURIComponent(roomIdParam)}&slug=${encodeURIComponent(roomSlugParam)}&checkIn=${encodeURIComponent(checkInParam)}&checkOut=${encodeURIComponent(checkOutParam)}`;

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!room || !checkInDate || !checkOutDate || nights < 1) {
      setSubmitError("Invalid room or date selection. Please reselect dates.");
      return;
    }

    const hasInvalidGuests = guestErrors.some((error) => error.length > 0);
    if (hasInvalidGuests) {
      setSubmitError("Please complete all guest information.");
      return;
    }

    if (!sessionUser) {
      setSubmitError("Please sign in to continue booking.");
      router.push(`/login?next=${encodeURIComponent(bookingPath)}`);
      return;
    }

    try {
      const booking = await createBookingMutation.mutateAsync({
        roomId: room.id,
        checkInDate: toDateOnlyString(checkInDate),
        checkOutDate: toDateOnlyString(checkOutDate),
        guests: guestsCount,
        guestDetails,
        paymentMethod,
      });

      if (paymentMethod === "pay_later") {
        router.push(
          `/booking/confirmation?bookingId=${encodeURIComponent(booking.id)}`,
        );
        return;
      }

      const payment = await payBookingMutation.mutateAsync({
        bookingId: booking.id,
        paymentMethod,
        action: "initiate",
      });

      const checkoutUrl =
        payment.payment.checkoutUrl ?? payment.payment.redirectUrl;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      router.push(
        `/booking/confirmation?bookingId=${encodeURIComponent(booking.id)}`,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Booking request failed. Please try again.",
      );
    }
  };

  if (isRoomsLoading) {
    return (
      <main className="bg-[#f7fafd] py-10">
        <div className="mx-auto max-w-7xl px-4">
          <p className="font-open-sans text-sm text-[#5b6774]">
            Loading booking form...
          </p>
        </div>
      </main>
    );
  }

  if (!room || !checkInDate || !checkOutDate || nights < 1) {
    return (
      <main className="bg-[#f7fafd] py-10">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-2xl border border-[#dbe5ef] bg-white p-6 sm:p-8">
            <h1 className="font-mulish text-2xl font-extrabold text-[#101b25]">
              Booking details are missing
            </h1>
            <p className="mt-2 font-open-sans text-sm text-[#5b6774]">
              Please return to a room page, select check-in and check-out dates,
              then click booking.
            </p>
            <Link
              href="/rooms"
              className="mt-5 inline-flex rounded-md bg-primary px-4 py-2.5 font-mulish text-sm font-bold text-primary-foreground"
            >
              Browse rooms
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const nightlyPrice = Number.parseFloat(room.price) || 0;
  const subtotal = nightlyPrice * nights;
  const vat = subtotal * 0.05;
  const total = subtotal + vat;

  return (
    <main className="bg-[#f7fafd] py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <BookingHeroSection
          title="Complete your booking"
          subtitle="Review your stay details, add guest information, and confirm your booking securely."
        />

        {!sessionUser ? (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 font-open-sans text-sm text-amber-700">
            You need to sign in before final confirmation.
            <Link
              href={`/login?next=${encodeURIComponent(bookingPath)}`}
              className="ml-1 font-semibold underline"
            >
              Sign in now
            </Link>
          </div>
        ) : null}

        {submitError ? (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-open-sans text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <BookingStaySection
              roomName={room.name}
              checkIn={checkInDate}
              checkOut={checkOutDate}
              nights={nights}
              guests={guestsCount}
              onGuestsChange={handleGuestsCountChange}
            />

            <BookingGuestsSection
              guests={guestDetails}
              errors={guestErrors}
              onChange={handleGuestChange}
            />

            <BookingPaymentSection
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
            />
          </div>

          <BookingPriceSummarySection
            nightlyPrice={nightlyPrice}
            nights={nights}
            subtotal={subtotal}
            vat={vat}
            total={total}
            submitting={
              createBookingMutation.isPending || payBookingMutation.isPending
            }
            onSubmit={handleSubmit}
            paymentMethod={paymentMethod}
            checkInDate={checkInDate}
          />
        </div>
      </div>
    </main>
  );
}

export default function BookingFormClient() {
  return (
    <Suspense fallback={null}>
      <BookingFormContent />
    </Suspense>
  );
}
