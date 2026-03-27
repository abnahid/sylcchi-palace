import NewsSidebar from "@/components/News/NewsSidebar";
import type { NewsPost } from "@/data/news";
import { getRecommendedNews } from "@/data/news";
import Image from "next/image";
import Link from "next/link";
import { FiCalendar, FiEye, FiMessageCircle } from "react-icons/fi";

type NewsDetailClientProps = {
  post: NewsPost;
};

export default function NewsDetailClient({ post }: NewsDetailClientProps) {
  const related = getRecommendedNews(post.slug);

  return (
    <section className="bg-white py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <article className="lg:col-span-2">
            <div className="relative mb-6 h-[280px] overflow-hidden rounded-xl sm:h-[360px]">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority
              />
            </div>

            <div className="mb-6 flex flex-wrap gap-4 text-xs text-[#808385]">
              <span className="inline-flex items-center gap-1.5">
                <FiCalendar className="h-3.5 w-3.5" /> {post.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FiEye className="h-3.5 w-3.5" /> {post.views} views
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FiMessageCircle className="h-3.5 w-3.5" /> {post.comments}
                comments
              </span>
            </div>

            <div className="space-y-4 text-base leading-7 text-[#2c3c4a]">
              {post.content.intro.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <blockquote className="my-8 rounded-r-lg border-l-4 border-primary bg-[#f7fafd] px-6 py-5">
              <p className="text-lg leading-7 text-[#040b11]">
                {post.content.quote}
              </p>
              <p className="mt-2 text-sm text-primary">{post.author.name}</p>
            </blockquote>

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {post.galleryImages.map((image) => (
                <div
                  key={image}
                  className="relative h-[180px] overflow-hidden rounded-lg sm:h-[220px]"
                >
                  <Image
                    src={image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>

            <ul className="mb-8 space-y-3 text-base text-[#2c3c4a]">
              {post.content.checklist.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-4 text-base leading-7 text-[#2c3c4a]">
              {post.content.outro.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="my-8 rounded-xl bg-[#f7fafd] p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <h3 className="font-mulish text-lg font-bold text-[#040b11]">
                    {post.author.name}
                  </h3>
                  <p className="text-sm text-primary">{post.author.role}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#f7fafd] p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-mulish text-2xl font-bold text-[#040b11]">
                  More News
                </h2>
                <Link
                  href="/news"
                  className="rounded-lg bg-[#ddeaf6] px-5 py-2 text-sm text-primary transition-colors hover:bg-[#c5d9ee]"
                >
                  View all
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {related.slice(0, 2).map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.slug}`}
                    className="block"
                  >
                    <div className="overflow-hidden rounded-xl bg-white shadow-[0px_2px_30px_0px_rgba(47,76,88,0.06)] transition-shadow hover:shadow-md">
                      <div className="relative h-[180px]">
                        <Image
                          src={item.coverImage}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      </div>
                      <div className="p-4">
                        <p className="font-mulish text-base leading-6 text-[#040b11]">
                          {item.title}
                        </p>
                        <p className="mt-2 text-xs text-[#808385]">
                          {item.date}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </article>

          <NewsSidebar excludeSlug={post.slug} activeCategory={post.category} />
        </div>
      </div>
    </section>
  );
}
