import {
  ArrowRight,
  BriefcaseBusiness,
  MapPin,
  ParkingCircle,
  Wifi,
} from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Wifi, label: "Free available high speed WiFi" },
  { icon: MapPin, label: "Convenient location in the center" },
  { icon: BriefcaseBusiness, label: "Free storage of luggage of any size" },
  { icon: ParkingCircle, label: "Parking space allocated to you" },
];

export default function PromuteVideo() {
  return (
    <section className="bg-background py-12 lg:py-16">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className=" p-8 sm:p-10">
            <h2 className="mb-4 font-mulish text-2xl sm:text-[40px] leading-tight font-extrabold text-foreground">
              We have everything you need
            </h2>

            <p className="mb-8 max-w-[520px] font-open-sans text-base leading-relaxed text-muted-foreground">
              Posuere morbi leo urna molestie at elementum eu facilisis sed.
              Diam phasellus vestibulum lorem sed risus ultricies tristique.
            </p>

            <div className="mb-8 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              {features.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3">
                    <Icon
                      className="mt-0.5 h-10 w-10 shrink-0 text-primary"
                      strokeWidth={1.6}
                    />
                    <p className="font-open-sans text-base leading-6 text-foreground/85">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-6">
              <Link
                href="/rooms"
                className="rounded-md bg-primary px-6 py-3 font-mulish text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Book now
              </Link>

              <Link
                href="/about"
                className="inline-flex items-center gap-1 font-mulish text-sm font-bold text-primary transition-colors hover:underline"
              >
                More about <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="relative h-[300px] overflow-hidden rounded-xl sm:h-[400px]">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/cdKx1Zv3YKs"
              title="Sylcchi Palace video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
