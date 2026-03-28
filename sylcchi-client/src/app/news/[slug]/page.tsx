import Breadcrumb from "@/components/Breadcrumb";
import NewsDetailClient from "@/components/News/NewsDetailClient";
import { getNewsBySlug, newsPosts } from "@/data/news";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type NewsDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return newsPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getNewsBySlug(slug);

  if (!post) {
    return { title: "Article Not Found" };
  }

  return {
    title: post.title,
    description: post.content.intro[0]?.slice(0, 160) ?? post.title,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.content.intro[0]?.slice(0, 160) ?? post.title,
      type: "article",
      publishedTime: post.date,
      images: post.coverImage ? [{ url: post.coverImage, alt: post.title }] : undefined,
    },
  };
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
