import Breadcrumb from "@/components/Breadcrumb";
import RoomsList from "@/components/rooms/RoomsList";

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
