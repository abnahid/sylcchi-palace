import PaymentFailedClient from "@/components/booking/PaymentFailedClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Failed | Sylcchi Palace",
  description: "Your payment failed and booking is not confirmed yet.",
};

export default function Page() {
  return <PaymentFailedClient />;
}
