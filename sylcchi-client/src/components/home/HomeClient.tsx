"use client";

import HeroSection from "@/components/home/heroSection";
import HostelRooms from "@/components/home/hostelRooms";
import PromuteVideo from "@/components/home/PromuteVideo";
import Reviews from "@/components/home/Reviews";
import Testimonial from "@/components/home/testimonal";

export function HomeClient() {
  return (
    <main>
      <HeroSection />
      <HostelRooms />
      <PromuteVideo />
      <Reviews />
      <Testimonial />
    </main>
  );
}
