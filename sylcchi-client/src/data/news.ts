export type NewsPost = {
  id: number;
  slug: string;
  title: string;
  tag: string;
  category: string;
  excerpt: string;
  date: string;
  views: number;
  comments: number;
  coverImage: string;
  galleryImages: string[];
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  content: {
    intro: string[];
    quote: string;
    checklist: string[];
    outro: string[];
  };
};

export const newsPosts: NewsPost[] = [
  {
    id: 1,
    slug: "how-to-travel-the-world-and-make-a-difference",
    title: "How to Travel the World & Make a Difference",
    tag: "Travel",
    category: "Travel",
    excerpt:
      "Practical ways to travel responsibly while supporting local communities and sustainable tourism.",
    date: "June 16, 2021",
    views: 120,
    comments: 1,
    coverImage: "/Gallery/room-1.webp",
    galleryImages: ["/Gallery/room-2.webp", "/Gallery/room-3.webp"],
    author: {
      name: "William Howard",
      role: "Staff writer, Travel blogger",
      avatar: "/Gallery/room-4.webp",
    },
    content: {
      intro: [
        "Traveling with purpose can transform both your journey and the places you visit. Responsible tourism is about staying curious, respectful, and mindful of local culture.",
        "Choose local businesses, eat at family-run restaurants, and support guides who know the area deeply. Small choices can have a long-term impact.",
      ],
      quote:
        "Great travel is not just about where you go. It is about how gently you leave your footprint behind.",
      checklist: [
        "Book local experiences and tours",
        "Respect local customs and dress codes",
        "Reduce waste by carrying reusable essentials",
      ],
      outro: [
        "Every destination has stories worth protecting. Travel in a way that leaves those stories stronger for the next visitor.",
      ],
    },
  },
  {
    id: 2,
    slug: "the-seven-people-you-always-meet-while-traveling",
    title: "The Seven People You Always Meet While Traveling",
    tag: "Tourist Guide",
    category: "Tourist Guide",
    excerpt:
      "From spontaneous planners to culture seekers, meet the personalities that make every trip unforgettable.",
    date: "June 20, 2021",
    views: 98,
    comments: 4,
    coverImage: "/Gallery/room-2.webp",
    galleryImages: ["/Gallery/room-5.webp", "/Gallery/room-6.webp"],
    author: {
      name: "Ayesha Rahman",
      role: "Guest contributor",
      avatar: "/Gallery/room-7.webp",
    },
    content: {
      intro: [
        "Travel introduces you to a colorful mix of people. Some become quick friends, others become lifelong memories.",
      ],
      quote: "People are the best part of every itinerary.",
      checklist: [
        "Say yes to conversations",
        "Share local tips generously",
        "Keep an open mind",
      ],
      outro: [
        "The people you meet often become the highlight of your destination.",
      ],
    },
  },
  {
    id: 3,
    slug: "underrated-cities-that-deserve-your-next-trip",
    title: "Underrated Cities That Deserve Your Next Trip",
    tag: "City Sights",
    category: "City Sights",
    excerpt:
      "Skip crowded routes and discover hidden gems with rich culture, architecture, and calm city rhythm.",
    date: "June 23, 2021",
    views: 85,
    comments: 3,
    coverImage: "/Gallery/room-3.webp",
    galleryImages: ["/Gallery/room-1.webp", "/Gallery/room-6.webp"],
    author: {
      name: "Nafiz Karim",
      role: "City explorer",
      avatar: "/Gallery/room-5.webp",
    },
    content: {
      intro: [
        "Popular cities are great, but underrated destinations often offer more authentic experiences.",
      ],
      quote: "The best stories are usually found off the main route.",
      checklist: [
        "Walk through local neighborhoods",
        "Visit markets in the morning",
        "Ask locals for food recommendations",
      ],
      outro: [
        "Take the quieter road. It often leads to richer travel moments.",
      ],
    },
  },
  {
    id: 4,
    slug: "things-hostels-do-better-than-posh-hotels",
    title: "Things Hostels Do Better than Posh Hotels",
    tag: "Tourist Guide",
    category: "Tourist Guide",
    excerpt:
      "Community, flexibility, and local connection are why many travelers choose hostels over luxury chains.",
    date: "June 28, 2021",
    views: 140,
    comments: 6,
    coverImage: "/Gallery/room-4.webp",
    galleryImages: ["/Gallery/room-2.webp", "/Gallery/room-7.webp"],
    author: {
      name: "Sadia Noor",
      role: "Travel editor",
      avatar: "/Gallery/room-3.webp",
    },
    content: {
      intro: [
        "Luxury has its place, but hostels are unmatched when it comes to social travel and spontaneous connections.",
      ],
      quote: "Comfort is great. Community is unforgettable.",
      checklist: [
        "Shared common spaces",
        "Budget-friendly flexibility",
        "Easy access to local events",
      ],
      outro: [
        "For many travelers, hostels are where adventures actually begin.",
      ],
    },
  },
  {
    id: 5,
    slug: "how-to-sleep-better-while-sharing-a-room",
    title: "How to Get a Good Night's Sleep in a Shared Room",
    tag: "Tourist Guide",
    category: "Tourist Guide",
    excerpt:
      "Simple habits and packing tricks that help you rest well, even in busy and shared accommodation spaces.",
    date: "July 2, 2021",
    views: 112,
    comments: 2,
    coverImage: "/Gallery/room-5.webp",
    galleryImages: ["/Gallery/room-1.webp", "/Gallery/room-4.webp"],
    author: {
      name: "Rafi Bin Alam",
      role: "Guest writer",
      avatar: "/Gallery/room-2.webp",
    },
    content: {
      intro: [
        "Sleep is one of the biggest travel game changers. A few lightweight essentials can make a major difference.",
      ],
      quote: "Rest well, travel better.",
      checklist: [
        "Use earplugs and eye mask",
        "Keep a simple bedtime routine",
        "Choose lower bunk if you are a light sleeper",
      ],
      outro: ["Good sleep gives you more energy for every day of your trip."],
    },
  },
  {
    id: 6,
    slug: "important-tips-for-traveling-with-friends",
    title: "Important Tips for Traveling with Friends",
    tag: "Communication",
    category: "Communication",
    excerpt:
      "Set expectations early and communicate clearly to keep group travel smooth, fun, and stress free.",
    date: "July 6, 2021",
    views: 90,
    comments: 5,
    coverImage: "/Gallery/room-6.webp",
    galleryImages: ["/Gallery/room-3.webp", "/Gallery/room-7.webp"],
    author: {
      name: "Mehnaz Sultan",
      role: "Community writer",
      avatar: "/Gallery/room-1.webp",
    },
    content: {
      intro: [
        "Group travel can be incredible when plans and preferences are discussed early.",
      ],
      quote: "Clear plans prevent unclear moments.",
      checklist: [
        "Set budget boundaries together",
        "Plan shared and solo time",
        "Agree on daily schedule flexibility",
      ],
      outro: [
        "Traveling with friends works best when communication stays open and respectful.",
      ],
    },
  },
];

export const newsCategories = [
  "Travel",
  "Tourist Guide",
  "City Sights",
  "Communication",
];

export const newsTags = [
  "Travel",
  "Room",
  "People",
  "Guide",
  "Season",
  "City",
  "Sights",
];

export const instagramPhotos = [
  "/Gallery/room-1.webp",
  "/Gallery/room-2.webp",
  "/Gallery/room-3.webp",
  "/Gallery/room-4.webp",
  "/Gallery/room-5.webp",
  "/Gallery/room-6.webp",
];

export const getRecommendedNews = (excludeSlug?: string) =>
  newsPosts.filter((post) => post.slug !== excludeSlug).slice(0, 3);

export const getNewsBySlug = (slug: string) =>
  newsPosts.find((post) => post.slug === slug);
