type BookingHeroSectionProps = {
  title: string;
  subtitle: string;
};

export default function BookingHeroSection({
  title,
  subtitle,
}: BookingHeroSectionProps) {
  return (
    <section className="mb-6 rounded-2xl border border-[#dbe5ef] dark:border-[#243443] bg-white dark:bg-[#101e2e] p-6 sm:p-8">
      <h1 className="font-mulish text-3xl font-extrabold text-[#101b25] dark:text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl font-open-sans text-sm leading-6 text-[#5b6774] dark:text-[#9aa5b0] sm:text-base">
        {subtitle}
      </p>
    </section>
  );
}
