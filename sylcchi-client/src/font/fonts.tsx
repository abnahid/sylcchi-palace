import { Mulish, Open_Sans } from "next/font/google";

export const mulish = Mulish({
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-mulish",
});

export const openSans = Open_Sans({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-open-sans",
});
