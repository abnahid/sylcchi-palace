import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  title: string;
  items?: BreadcrumbItem[];
};

const Breadcrumb = ({ title, items }: BreadcrumbProps) => {
  const trail =
    items && items.length > 0
      ? items
      : [{ label: "Home", href: "/" }, { label: title }];

  return (
    <section className="bg-[#f7fafd] py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center text-[15px] text-[#2c3c4a]">
            {trail.map((item, index) => {
              const isLast = index === trail.length - 1;

              return (
                <li
                  key={`${item.label}-${index}`}
                  className="flex items-center"
                >
                  {item.href && !isLast ? (
                    <Link href={item.href} className="hover:text-[#235784]">
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-[#4e5a69]" : ""}>
                      {item.label}
                    </span>
                  )}

                  {!isLast && <span className="mx-2">/</span>}
                </li>
              );
            })}
          </ol>
        </nav>

        <h1 className="text-foreground text-5xl font-bold font-mulish">
          {title}
        </h1>
      </div>
    </section>
  );
};

export default Breadcrumb;
