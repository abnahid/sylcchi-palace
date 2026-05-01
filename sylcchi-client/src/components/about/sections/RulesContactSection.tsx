import { aboutRules } from "@/components/about/about-content";
import { Check } from "lucide-react";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";

const RulesContactSection = () => {
  return (
    <section className="bg-[#edf1f5] dark:bg-[#0a1622] py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="max-w-xl">
            <h2 className="mb-8 font-mulish text-3xl font-extrabold leading-[1.05] text-[#101b25] dark:text-white sm:text-4xl">
              Hotel policies & guest guidelines
            </h2>

            <div className="space-y-5">
              {aboutRules.map((rule) => (
                <div key={rule} className="flex items-start gap-3">
                  <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-primary dark:text-[#7fb3df]" />
                  <p className="font-open-sans text-lg leading-relaxed text-[#445261] dark:text-[#cbd2da]">
                    {rule}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-white dark:bg-[#101e2e] p-6 sm:p-14 shadow-[0px_2px_20px_0px_rgba(47,76,88,0.06)]">
            <h2 className="max-w-md font-mulish text-3xl font-extrabold leading-[1.08] text-[#101b25] dark:text-white sm:text-[40px]">
              We are ready to answer your questions
            </h2>

            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="relative block">
                  <input
                    type="text"
                    placeholder="Name"
                    className="h-12 w-full rounded-md border border-[#c7ced6] dark:border-[#3a4a5a] bg-white dark:bg-[#101e2e] px-3 pr-10 font-open-sans text-[15px] text-[#101b25] dark:text-white outline-none transition-colors placeholder:text-[#8c98a5] dark:placeholder:text-[#7d8a96] focus:border-primary"
                  />
                  <FaRegUser className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a1acb7] dark:text-[#5a6775]" />
                </label>

                <label className="relative block">
                  <input
                    type="email"
                    placeholder="Email"
                    className="h-12 w-full rounded-md border border-[#c7ced6] dark:border-[#3a4a5a] bg-white dark:bg-[#101e2e] px-3 pr-10 font-open-sans text-[15px] text-[#101b25] dark:text-white outline-none transition-colors placeholder:text-[#8c98a5] dark:placeholder:text-[#7d8a96] focus:border-primary"
                  />
                  <MdOutlineMailOutline className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1acb7] dark:text-[#5a6775]" />
                </label>
              </div>

              <textarea
                placeholder="Message"
                rows={5}
                className="w-full resize-none rounded-md border border-[#c7ced6] dark:border-[#3a4a5a] bg-white dark:bg-[#101e2e] px-4 py-3 font-open-sans text-[15px] text-[#101b25] dark:text-white outline-none transition-colors placeholder:text-[#8c98a5] dark:placeholder:text-[#7d8a96] focus:border-primary"
              />

              <button
                type="submit"
                className="rounded-md bg-primary px-7 py-2.5 font-mulish text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get in touch
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RulesContactSection;
