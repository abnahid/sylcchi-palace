import Image from "next/image";

const reviews = [
  {
    score: "8.3",
    scoreLabel: "/10",
    detail: "1398 comments",
    logo: "/assets/svg/bookingcom-seeklogo.com.svg",
    alt: "Booking.com",
  },
  {
    score: "4.6",
    scoreLabel: "/5",
    detail: "460 notes",
    logo: "/assets/svg/tripadvisor-logo.svg",
    alt: "TripAdvisor",
  },
  {
    score: "4.9",
    scoreLabel: "/5",
    detail: "2389 notes",
    logo: "/assets/svg/google-2015.svg",
    alt: "Google",
  },
  {
    score: "98%",
    scoreLabel: "",
    detail: "2389 recommendations",
    logo: "/assets/svg/hostelbookers-logo-vector.svg",
    alt: "HostelBookers",
  },
];

const Reviews = () => {
  return (
    <section className="bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 lg:gap-24">
          {reviews.map((review) => (
            <div
              key={review.alt}
              className="flex flex-col items-center gap-2 text-center"
            >
              <p className="text-3xl font-bold text-gray-800">
                {review.score}
                <span className="text-base font-normal text-gray-500">
                  {review.scoreLabel}
                </span>
              </p>
              <p className="text-sm text-gray-500">{review.detail}</p>
              <Image
                src={review.logo}
                alt={review.alt}
                width={140}
                height={40}
                className="h-8 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
