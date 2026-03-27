import Breadcrumb from "@/components/Breadcrumb";
import NewsDetailClient from "@/components/News/NewsDetailClient";
import { getNewsBySlug, newsPosts } from "@/data/news";
import { notFound } from "next/navigation";

type NewsDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return newsPosts.map((post) => ({ slug: post.slug }));
}

export default async function Page({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const post = getNewsBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main>
      <Breadcrumb
        title={post.title}
        items={[
          { label: "Home", href: "/" },
          { label: "News", href: "/news" },
          { label: post.title },
        ]}
      />
      <NewsDetailClient post={post} />
    </main>
  );
}
