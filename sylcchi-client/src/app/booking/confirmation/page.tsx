import BookingConfirmationClient from "@/components/booking/BookingConfirmationClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Confirmation | Sylcchi Palace",
  description: "Review your Sylcchi Palace booking confirmation details.",
};

export default function Page() {
  return <BookingConfirmationClient />;
}
