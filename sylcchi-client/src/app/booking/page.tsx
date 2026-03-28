import BookingFormClient from "@/components/booking/BookingFormClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking | Sylcchi Palace",
  description: "Complete your room booking at Sylcchi Palace.",
};

export default function Page() {
  return <BookingFormClient />;
}
