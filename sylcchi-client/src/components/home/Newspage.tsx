import { newsPosts } from "@/data/news";
import Image from "next/image";
import Link from "next/link";
import { FiCalendar, FiEye, FiMessageCircle } from "react-icons/fi";

const homeNews = newsPosts.slice(0, 3);

const Newspage = () => {
  return (
    <section className="bg-[#f7fafd] py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-mulish text-3xl font-extrabold text-[#040b11]">
            Sylcchi Palace news
          </h2>
          <Link
            href="/news"
            className="rounded-md bg-secondary px-6 py-3 font-mulish font-bold text-primary  hover:bg-secondary/90  transition-colors "
          >
            View all news
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homeNews.map((item) => (
            <Link href={`/news/${item.slug}`} key={item.id} className="block">
              <article className="overflow-hidden rounded-[12px] bg-white shadow-[0px_2px_30px_0px_rgba(47,76,88,0.06)] transition-shadow hover:shadow-md">
                <div className="relative h-50">
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-0 left-0 rounded-br-[8px] bg-white/90 px-4 py-2 backdrop-blur-sm">
                    <span className="text-[14px] text-[#235784]">
                      {item.tag}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="mb-3 font-mulish text-[18px] font-bold text-[#040b11]">
                    {item.title}
                  </h3>
                  <p className="mb-3 font-open-sans text-[15px] leading-[1.6] text-[#2c3c4a]">
                    {item.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#808385]">
                    <span className="inline-flex items-center gap-1.5">
                      <FiCalendar className="h-3.5 w-3.5" /> {item.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FiEye className="h-3.5 w-3.5" /> {item.views} views
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FiMessageCircle className="h-3.5 w-3.5" />{" "}
                      {item.comments}
                      comments
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Newspage;
