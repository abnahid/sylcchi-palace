"use client";

import { usePathname } from "next/navigation";
import ChatbotWidget from "./ChatbotWidget";
import Footer from "./Footer";
import Navbar from "./Navbar";
import SmoothScrollProvider from "./SmoothScrollProvider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <SmoothScrollProvider />
      <Navbar />
      {children}
      <Footer />
      <ChatbotWidget />
    </>
  );
}
