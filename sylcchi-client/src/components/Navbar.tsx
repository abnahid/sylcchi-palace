"use client";

import ThemeToggle from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession, useSignOut } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  ChevronDown,
  ClipboardCheck,
  Heart,
  LayoutDashboard,
  LogOut,
  MenuIcon,
  Settings,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Rooms", href: "/rooms" },
  { label: "Gallery", href: "/gallery" },
  { label: "News", href: "/news" },
  { label: "Contacts", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isLoading: isSessionLoading } = useSession();
  const { data: profileRes } = useUserProfile();
  const signOutMutation = useSignOut();

  const isLoggedIn = Boolean(user);
  const isSessionPending = isSessionLoading;

  // Profile query reads from DB — always has the latest image.
  // Session may return a stale image from the JWT/cookie token.
  const profile = (profileRes as { data?: { image?: string | null } })?.data;
  const avatarUrl = profile?.image ?? user?.image ?? undefined;
  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    await signOutMutation.mutateAsync();
    router.push("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSessionPending) return;

    const isProtectedRoute =
      pathname.startsWith("/profile") || pathname.startsWith("/dashboard");

    if (!isLoggedIn && isProtectedRoute) {
      router.replace("/login");
    }
  }, [isSessionPending, isLoggedIn, pathname, router]);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-all duration-300 dark:bg-[#0b1218] dark:border-b dark:border-[#1d2b38] ${
        isScrolled ? "shadow-md dark:shadow-none" : ""
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
              priority
              loading="eager"
              style={{ width: "auto", height: "auto" }}
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
                    ? "text-blue-600 border-blue-600 dark:text-[#7fb3df] dark:border-[#7fb3df]"
                    : "text-gray-700 border-b-2 border-transparent hover:text-blue-600 dark:text-[#cbd2da] dark:hover:text-[#7fb3df]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            {isSessionPending ? (
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 animate-pulse rounded-full bg-gray-100" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
              </div>
            ) : isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 rounded-full border border-gray-200 py-1.5 pr-3 pl-1.5 transition-colors hover:bg-gray-50 focus:outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={avatarUrl}
                        alt={user?.name ?? "User"}
                      />
                      <AvatarFallback className="bg-[#235784] text-xs font-bold text-white">
                        {user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-semibold leading-tight text-gray-800">
                        {user?.name?.split(" ")[0]}
                      </p>
                      <p className="text-[11px] capitalize leading-tight text-gray-400">
                        {user?.role?.toLowerCase()}
                      </p>
                    </div>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="flex items-center gap-2.5 pb-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={avatarUrl}
                        alt={user?.name ?? "User"}
                      />
                      <AvatarFallback className="bg-[#235784] text-xs font-bold text-white">
                        {user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {user?.name}
                      </p>
                      <p className="text-xs font-normal text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer gap-2">
                      <User size={15} />
                      My Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile?tab=wishlist"
                      className="cursor-pointer gap-2"
                    >
                      <Heart size={15} />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile?tab=settings"
                      className="cursor-pointer gap-2"
                    >
                      <Settings size={15} />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/checkin" className="cursor-pointer gap-2">
                      <ClipboardCheck size={15} />
                      Check-in
                    </Link>
                  </DropdownMenuItem>

                  {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard"
                          className="cursor-pointer gap-2"
                        >
                          <LayoutDashboard size={15} />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
                    disabled={signOutMutation.isPending}
                    onClick={handleSignOut}
                  >
                    <LogOut size={15} />
                    {signOutMutation.isPending ? "Signing out..." : "Sign Out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
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
                  {isSessionPending ? null : isLoggedIn ? (
                    <>
                      <div className="flex items-center gap-3 px-1 pb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={avatarUrl}
                            alt={user?.name ?? "User"}
                          />
                          <AvatarFallback className="bg-[#235784] text-sm font-bold text-white">
                            {user?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase() ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {user?.name}
                          </p>
                          <p className="text-xs capitalize text-gray-400">
                            {user?.role?.toLowerCase()}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        onClick={() => setOpen(false)}
                      >
                        <User size={16} /> My Profile
                      </Link>

                      <Link
                        href="/profile?tab=wishlist"
                        className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        onClick={() => setOpen(false)}
                      >
                        <Heart size={16} /> Wishlist
                      </Link>

                      <Link
                        href="/profile?tab=settings"
                        className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        onClick={() => setOpen(false)}
                      >
                        <Settings size={16} /> Settings
                      </Link>

                      <Link
                        href="/checkin"
                        className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        onClick={() => setOpen(false)}
                      >
                        <ClipboardCheck size={16} /> Check-in
                      </Link>

                      {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                          onClick={() => setOpen(false)}
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                      )}

                      <div className="border-t pt-2">
                        <button
                          className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                          disabled={signOutMutation.isPending}
                          onClick={() => {
                            handleSignOut();
                            setOpen(false);
                          }}
                        >
                          <LogOut size={16} />
                          {signOutMutation.isPending
                            ? "Signing out..."
                            : "Sign Out"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="w-full"
                        onClick={() => setOpen(false)}
                      >
                        <Button variant="outline" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link
                        href="/register"
                        className="w-full"
                        onClick={() => setOpen(false)}
                      >
                        <Button className="w-full">Get Started</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
