type BookingHeroSectionProps = {
  title: string;
  subtitle: string;
};

export default function BookingHeroSection({
  title,
  subtitle,
}: BookingHeroSectionProps) {
  return (
    <section className="mb-6 rounded-2xl border border-[#dbe5ef] bg-white p-6 sm:p-8">
      <h1 className="font-mulish text-3xl font-extrabold text-[#101b25] sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 max-w-2xl font-open-sans text-sm leading-6 text-[#5b6774] sm:text-base">
        {subtitle}
      </p>
    </section>
  );
}
