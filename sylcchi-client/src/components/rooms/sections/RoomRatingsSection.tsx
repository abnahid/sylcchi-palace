"use client";

type RatingCategory = {
  label: string;
  value: number;
};

type RoomRatingsSectionProps = {
  categories: RatingCategory[];
};

const RoomRatingsSection = ({ categories }: RoomRatingsSectionProps) => {
  const overallRating =
    categories.reduce((acc, current) => acc + current.value, 0) /
    categories.length;

  return (
    <section className="bg-[#f7fafd] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl rounded-lg bg-white p-6 shadow-[0_2px_24px_0_rgba(30,49,66,0.08)]">
          <p className="font-mulish text-5xl font-extrabold text-[#101b25]">
            {overallRating.toFixed(2)}
            <span className="text-base font-normal">/5</span>
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <div
                key={category.label}
                className="grid grid-cols-[74px_1fr_30px] items-center gap-3"
              >
                <span className="font-open-sans text-sm text-[#5b6774]">
                  {category.label}
                </span>
                <div className="h-1.5 rounded-full bg-[#d9e3ee]">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${(category.value / 5) * 100}%` }}
                  />
                </div>
                <span className="text-right font-open-sans text-sm text-[#5b6774]">
                  {category.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoomRatingsSection;
