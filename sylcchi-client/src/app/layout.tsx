import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { HotelJsonLd } from "@/components/StructuredData";
import { mulish, openSans } from "@/font/fonts";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/providers/query-provider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sylcchipalace.com"),
  title: {
    default: "Sylcchi Palace — Luxury Hotel in Sylhet, Bangladesh",
    template: "%s | Sylcchi Palace",
  },
  description:
    "Experience refined luxury at Sylcchi Palace, Sylhet's premier hotel on Dargah Gate Road. Elegant rooms, premium dining, a rooftop pool, and 24/7 personalized service for business and leisure travelers.",
  keywords: [
    "Sylcchi Palace",
    "luxury hotel Sylhet",
    "hotel in Sylhet",
    "Sylhet accommodation",
    "Dargah Gate hotel",
    "Bangladesh hotel",
    "Sylhet rooms booking",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Sylcchi Palace",
    title: "Sylcchi Palace — Luxury Hotel in Sylhet, Bangladesh",
    description:
      "Elegant rooms, premium dining, rooftop pool, and 24/7 personalized service at Sylhet's finest hotel.",
    url: "https://sylcchipalace.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sylcchi Palace — Luxury Hotel in Sylhet",
    description:
      "Elegant rooms, premium dining, rooftop pool, and 24/7 personalized service at Sylhet's finest hotel.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://sylcchipalace.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(mulish.variable, openSans.variable)}>
      <head>
        <HotelJsonLd />
      </head>
      <body className="bg-background text-foreground font-open-sans">
        <QueryProvider>
          <Navbar />
          {children}
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
