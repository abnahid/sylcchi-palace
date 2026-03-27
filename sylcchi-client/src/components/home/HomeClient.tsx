"use client";

import Accommodation from "@/components/home/Accommodation";
import HeroSection from "@/components/home/heroSection";
import HostelRooms from "@/components/home/hostelRooms";
import Newspage from "@/components/home/Newspage";
import PhotoRooms from "@/components/home/PhotoRooms";
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
      <Accommodation />
      <PhotoRooms />
      <Newspage />
    </main>
  );
}
