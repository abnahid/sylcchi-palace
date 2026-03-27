import type { NewsPost } from "@/data/news";
import Image from "next/image";
import Link from "next/link";
import { FiCalendar, FiEye, FiMessageCircle } from "react-icons/fi";

type NewsCardProps = {
  post: NewsPost;
};

export default function NewsCard({ post }: NewsCardProps) {
  return (
    <Link href={`/news/${post.slug}`} className="block">
      <article className="overflow-hidden rounded-xl bg-white shadow-[0px_2px_30px_0px_rgba(47,76,88,0.06)] transition-shadow hover:shadow-md">
        <div className="flex flex-col gap-0 sm:flex-row">
          <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-[220px]">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 220px"
            />

            <div className="absolute top-0 right-0 rounded-bl-lg bg-white/95 px-3 py-1.5 text-xs text-primary">
              {post.tag}
            </div>
          </div>

          <div className="flex-1 p-5">
            <h3 className="mb-3 font-mulish text-xl font-bold leading-tight text-[#040b11]">
              {post.title}
            </h3>
            <p className="mb-4 font-open-sans text-sm leading-6 text-[#2c3c4a]">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap gap-4 font-open-sans text-xs text-[#808385]">
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
          </div>
        </div>
      </article>
    </Link>
  );
}
