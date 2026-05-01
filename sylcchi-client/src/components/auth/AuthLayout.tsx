import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle: ReactNode;
  icon: ReactNode;
  quote: string;
  quoteAuthor: string;
  children: ReactNode;
};

export function AuthLayout({
  title,
  subtitle,
  icon,
  quote,
  quoteAuthor,
  children,
}: AuthLayoutProps) {
  return (
    <section className="bg-[#f4f8fc] py-10 md:py-14 dark:bg-[#0b1218]">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 lg:grid-cols-[1fr_0.9fr] lg:items-stretch">
        <article className="rounded-2xl border border-[#d9e5f1] bg-white p-6 shadow-sm sm:p-8 lg:p-10 dark:border-[#1d2b38] dark:bg-[#121d27] dark:shadow-none">
          <div className="mb-8">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#DDEAF6] text-[#235784] dark:bg-[#17354f]/50 dark:text-[#7fb3df]">
              {icon}
            </div>
            <h1 className="mb-2 font-mulish text-3xl font-extrabold text-[#040b11] sm:text-4xl dark:text-white">
              {title}
            </h1>
            <div className="font-open-sans text-[15px] leading-6 text-[#5f6d79] dark:text-[#9aa5b0]">
              {subtitle}
            </div>
          </div>
          {children}
        </article>

        <aside className="hidden overflow-hidden rounded-2xl bg-[#17354f] lg:block dark:bg-[#0e2236]">
          <div className="relative h-full p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#2e5f8b_0%,transparent_45%),radial-gradient(circle_at_80%_85%,#1f4f79_0%,transparent_40%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <p className="max-w-md font-mulish text-3xl font-bold leading-tight text-white">
                {quote}
              </p>
              <p className="font-open-sans text-sm font-semibold tracking-wide text-[#d3dfeb]">
                {quoteAuthor}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
