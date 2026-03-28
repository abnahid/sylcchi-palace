export type AboutRoomCard = {
  id: number;
  slug: string;
  name: string;
  price: number;
  img: string;
  sleeps: number;
  beds: string;
};

export type AboutFaqItem = {
  q: string;
  a: string;
};

export const aboutRooms: AboutRoomCard[] = [
  {
    id: 1,
    slug: "deluxe-king-suite-1",
    name: "Bed in 6-Bed Room with Shared Bathroom",
    price: 14,
    img: "/Gallery/room-1.webp",
    sleeps: 2,
    beds: "Bunk bed",
  },
  {
    id: 2,
    slug: "deluxe-king-suite-2",
    name: "Double Room with Private Bathroom",
    price: 30,
    img: "/Gallery/room-2.webp",
    sleeps: 2,
    beds: "Double bed",
  },
  {
    id: 3,
    slug: "deluxe-king-suite-3",
    name: "Apartment with Private Bathroom",
    price: 99,
    img: "/Gallery/room-3.webp",
    sleeps: 4,
    beds: "Full bed",
  },
];

export const aboutFaqItems: AboutFaqItem[] = [
  {
    q: "What makes Sylcchi Palace unique?",
    a: "Sylcchi Palace is a premium luxury hotel in Sylhet, offering world-class hospitality, elegantly designed rooms, modern amenities, and a serene environment that blends traditional Sylheti charm with contemporary comfort.",
  },
  {
    q: "What amenities are included with every room?",
    a: "Every room at Sylcchi Palace includes complimentary high-speed Wi-Fi, air conditioning, flat-screen TV, premium toiletries, daily housekeeping, 24/7 room service, and access to our lounge and dining areas.",
  },
  {
    q: "Is there parking available at the hotel?",
    a: "Yes, Sylcchi Palace provides secure on-site parking for all guests at no additional charge. Our dedicated parking area is monitored around the clock for your convenience and peace of mind.",
  },
  {
    q: "Can I book event or conference spaces?",
    a: "Absolutely. Sylcchi Palace features versatile event and conference spaces equipped with modern audio-visual technology, ideal for corporate meetings, private celebrations, and social gatherings of all sizes.",
  },
  {
    q: "What is the cancellation policy?",
    a: "We offer flexible cancellation up to 24 hours before your scheduled check-in at no charge. Cancellations within 24 hours may incur a fee equivalent to one night's stay. Please contact our front desk for assistance.",
  },
];

export const aboutStats = [
  {
    num: "240+",
    label:
      "Guests have experienced exceptional luxury and hospitality at Sylcchi Palace",
  },
  {
    num: "60+",
    label: "Five-star reviews praising our world-class service and comfort",
  },
  {
    num: "98%",
    label: "Guests rate their stay as exceeding expectations across all services",
  },
];

export const aboutBookingSteps = [
  {
    num: "01",
    title: "Choose your room",
    desc: "Browse our collection of elegantly designed rooms and suites. Select the accommodation that best suits your needs, from deluxe rooms to premium suites with panoramic views.",
  },
  {
    num: "02",
    title: "Confirm & pay securely",
    desc: "Complete your reservation with our secure payment system. Provide your details and choose from flexible payment options including credit card, bank transfer, or pay at check-in.",
  },
  {
    num: "03",
    title: "Check in & enjoy",
    desc: "Arrive at Sylcchi Palace and experience seamless check-in with our front desk team. Settle into your luxurious room and enjoy premium hospitality from the moment you step through our doors.",
  },
];

export const aboutRules = [
  "Check-in time is from 14:00 onwards. Check-out is by 12:00 noon.",
  "A valid government-issued photo ID or passport is required at check-in for all guests.",
  "Full payment or a valid credit card guarantee is required upon check-in.",
  "Quiet hours are observed from 22:00 to 07:00 to ensure a peaceful stay for all guests.",
  "Smoking is not permitted inside rooms or indoor common areas. Designated smoking zones are available.",
];
