import Breadcrumb from "@/components/Breadcrumb";
import GalleryClient from "@/components/gallery/galleryClient";

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
