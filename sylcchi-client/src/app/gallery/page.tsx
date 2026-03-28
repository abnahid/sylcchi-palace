import Breadcrumb from "@/components/Breadcrumb";
import GalleryClient from "@/components/gallery/galleryClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Gallery",
  description:
    "Explore photos of Sylcchi Palace — luxury rooms, dining areas, rooftop pool, and the vibrant surroundings of Sylhet. See what awaits your stay.",
  alternates: { canonical: "/gallery" },
};

export default function Page() {
  return (
    <main>
      <Breadcrumb
        title="Gallery"
        items={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />
      <GalleryClient />
    </main>
  );
}
