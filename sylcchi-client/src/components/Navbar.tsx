"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Rooms", href: "/rooms" },
  { label: "Gallery", href: "/gallery" },
  { label: "News", href: "/news" },
  { label: "Contacts", href: "/contacts" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <nav
          className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? "py-2" : "py-4"
          }`}
        >
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/images/sylcchi-palace.png"
              alt="Sylcchi Palace"
              width={180}
              height={50}
              className={`transition-all duration-300 ${
                isScrolled ? "scale-90" : "scale-100"
              }`}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium font-mulish transition-colors pb-2 border-b-2 ${
                  isActive(link.href)
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-700 border-b-2 border-transparent hover:text-blue-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              overlayClassName="!bg-transparent !backdrop-blur-none"
              closeClassName="fixed top-4 right-4 z-[60] flex size-8 items-center justify-center rounded-md border border-input bg-background p-0 opacity-100"
              className="w-64"
            >
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-base font-medium font-mulish transition-colors pb-2 border-b-2 ${
                      isActive(link.href)
                        ? "text-blue-600 border-blue-600"
                        : "text-gray-700 border-b-2 border-transparent"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-3 pt-6 border-t">
                  <Link href="/auth/login" className="w-full">
                    <Button variant="outline">Login</Button>
                  </Link>
                  <Link href="/auth/register" className="w-full">
                    <Button>Get Started</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
