import Breadcrumb from "@/components/Breadcrumb";
import NewsClient from "@/components/News/newsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News & Updates",
  description:
    "Stay updated with the latest news from Sylcchi Palace — travel tips, hotel events, special offers, and Sylhet tourism insights.",
  alternates: { canonical: "/news" },
};

export default function Page() {
  return (
    <main>
      <Breadcrumb
        title="News"
        items={[{ label: "Home", href: "/" }, { label: "News" }]}
      />
      <NewsClient />
    </main>
  );
}
