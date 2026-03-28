import Breadcrumb from "@/components/Breadcrumb";
import RoomsList from "@/components/rooms/RoomsList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rooms & Suites",
  description:
    "Browse luxury rooms and suites at Sylcchi Palace, Sylhet. From deluxe king suites to standard rooms — find the perfect stay with free WiFi, room service, and stunning views.",
  alternates: { canonical: "/rooms" },
};

export default function Page() {
  return (
    <main>
      <Breadcrumb
        title="Rooms"
        items={[{ label: "Home", href: "/" }, { label: "Rooms" }]}
      />

      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4">
          <RoomsList />
        </div>
      </section>
    </main>
  );
}
