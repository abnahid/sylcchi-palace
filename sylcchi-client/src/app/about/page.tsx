import AboutClient from "@/components/about/AboutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Sylcchi Palace — Sylhet's premier luxury hotel. Discover our story, world-class amenities, guest-first philosophy, and why travelers choose us for business and leisure stays.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <AboutClient />;
}
