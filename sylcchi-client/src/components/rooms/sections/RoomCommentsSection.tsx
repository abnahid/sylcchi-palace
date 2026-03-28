"use client";

import Image from "next/image";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";

const RoomCommentsSection = () => {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-mulish text-3xl font-extrabold text-[#101b25]">
          Post comments
        </h2>

        <article className="mt-6 max-w-3xl border-l-2 border-[#d7e4f1] bg-white p-5 shadow-[0_1px_14px_0_rgba(30,49,66,0.08)]">
          <div className="flex gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-md">
              <Image
                src="/Gallery/room-6.webp"
                alt="Gloria Ellis"
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-mulish text-lg font-bold text-[#101b25]">
                  Gloria Ellis
                </h3>
                <span className="font-open-sans text-xs text-[#8d98a5]">
                  June 16, 2021
                </span>
              </div>
              <p className="mt-3 font-open-sans text-sm leading-relaxed text-[#5b6774]">
                Ac placerat vestibulum lectus mauris ultrices. Velit scelerisque
                in dictum non consectetur a. Eget nunc lobortis mattis aliquam
                faucibus purus in. Ultricies leo integer malesuada nunc.
              </p>
            </div>
          </div>
        </article>

        <h2 className="mt-10 font-mulish text-3xl font-extrabold text-[#101b25]">
          Leave comment
        </h2>
        <form
          className="mt-5 max-w-3xl space-y-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="relative block">
              <input
                type="text"
                placeholder="Name"
                className="h-11 w-full rounded-md border border-[#cbd4de] bg-white px-3 pr-10 font-open-sans text-sm outline-none focus:border-primary"
              />
              <FaRegUser className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa6b3]" />
            </label>

            <label className="relative block">
              <input
                type="email"
                placeholder="Email"
                className="h-11 w-full rounded-md border border-[#cbd4de] bg-white px-3 pr-10 font-open-sans text-sm outline-none focus:border-primary"
              />
              <MdOutlineMailOutline className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa6b3]" />
            </label>
          </div>

          <textarea
            rows={5}
            placeholder="Message"
            className="w-full resize-none rounded-md border border-[#cbd4de] bg-white px-4 py-3 font-open-sans text-sm outline-none focus:border-primary"
          />

          <button
            type="submit"
            className="rounded-md bg-primary px-6 py-2.5 font-mulish text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
};

export default RoomCommentsSection;
