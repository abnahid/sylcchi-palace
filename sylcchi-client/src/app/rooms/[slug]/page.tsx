import Breadcrumb from "@/components/Breadcrumb";
import { getRoomBySlug, primaryRooms } from "@/data/rooms";
import Image from "next/image";
import { notFound } from "next/navigation";

type RoomDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return primaryRooms.map((room) => ({ slug: room.slug }));
}

export default async function Page({ params }: RoomDetailPageProps) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);

  if (!room) {
    notFound();
  }

  const nightlyPrice = Number.parseFloat(room.price) || 0;

  return (
    <main>
      <Breadcrumb
        title={room.name}
        items={[
          { label: "Home", href: "/" },
          { label: "Rooms", href: "/rooms" },
          { label: room.name },
        ]}
      />

      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="relative h-80 overflow-hidden rounded-xl sm:h-96">
                <Image
                  src={room.images[0]?.imageUrl ?? "/Gallery/room-1.webp"}
                  alt={room.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>

            <div>
              <h1 className="font-mulish text-4xl font-extrabold text-[#101b25]">
                {room.name}
              </h1>
              <p className="mt-4 font-open-sans leading-7 text-[#5b6774]">
                {room.description}
              </p>
              <p className="mt-6 font-mulish text-3xl font-extrabold text-[#101b25]">
                ${Math.round(nightlyPrice)}
                <span className="ml-1 font-open-sans text-base font-normal text-[#707884]">
                  / 1 night
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
