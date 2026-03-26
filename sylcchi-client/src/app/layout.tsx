import { mulish, openSans } from "@/font/fonts";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sylcchi Palace - Luxury Hotel in Sylhet",
  description:
    "sylhet best luxury hotel with best services and best food and best rooms and best swimming pool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(mulish.variable, openSans.variable)}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
