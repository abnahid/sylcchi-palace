import Breadcrumb from "@/components/Breadcrumb";
import NewsClient from "@/components/News/newsClient";

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
