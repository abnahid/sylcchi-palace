import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#f7fafd] px-4">
      <div className="text-center">
        <p className="font-mulish text-8xl font-extrabold text-primary/20">
          404
        </p>
        <h1 className="mt-4 font-mulish text-3xl font-extrabold text-[#101b25]">
          Page not found
        </h1>
        <p className="mt-3 max-w-md font-open-sans text-sm leading-relaxed text-[#5f6c79]">
          The page you are looking for does not exist or has been moved. Let us
          help you find your way back.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex rounded-md bg-primary px-6 py-3 font-mulish text-sm font-extrabold text-primary-foreground"
          >
            Back to home
          </Link>
          <Link
            href="/rooms"
            className="inline-flex rounded-md border border-primary px-6 py-3 font-mulish text-sm font-extrabold text-primary"
          >
            Browse rooms
          </Link>
        </div>
      </div>
    </main>
  );
}
