"use client";

import Breadcrumb from "@/components/Breadcrumb";
import BenefitsSection from "@/components/about/sections/BenefitsSection";
import BookingStepsSection from "@/components/about/sections/BookingStepsSection";
import FaqSection from "@/components/about/sections/FaqSection";
import FounderNewsletterSection from "@/components/about/sections/FounderNewsletterSection";
import RoomsSection from "@/components/about/sections/RoomsSection";
import RulesContactSection from "@/components/about/sections/RulesContactSection";

const AboutClient = () => {
  return (
    <main>
      <Breadcrumb
        title="About"
        items={[{ label: "Home", href: "/" }, { label: "About" }]}
      />
      <BenefitsSection />
      <RoomsSection />
      <BookingStepsSection />
      <RulesContactSection />
      <FaqSection />
      <FounderNewsletterSection />
    </main>
  );
};

export default AboutClient;
