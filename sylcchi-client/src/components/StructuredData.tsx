export function HotelJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: "Sylcchi Palace",
    description:
      "Luxury hotel in Sylhet, Bangladesh offering elegant rooms, premium dining, rooftop pool, and 24/7 personalized service.",
    url: "https://sylcchipalace.com",
    telephone: "+8801819334455",
    email: "info@sylcchipalace.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Dargah Gate Road",
      addressLocality: "Sylhet",
      postalCode: "3100",
      addressCountry: "BD",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 24.8949,
      longitude: 91.8687,
    },
    starRating: {
      "@type": "Rating",
      ratingValue: "4",
    },
    priceRange: "$$",
    checkinTime: "14:00",
    checkoutTime: "11:00",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Free WiFi", value: true },
      { "@type": "LocationFeatureSpecification", name: "Room Service", value: true },
      { "@type": "LocationFeatureSpecification", name: "Swimming Pool", value: true },
      { "@type": "LocationFeatureSpecification", name: "Free Parking", value: true },
      { "@type": "LocationFeatureSpecification", name: "Restaurant", value: true },
      { "@type": "LocationFeatureSpecification", name: "24-Hour Front Desk", value: true },
    ],
    image: "https://sylcchipalace.com/assets/images/sylcchi-palace.png",
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQJsonLd({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
