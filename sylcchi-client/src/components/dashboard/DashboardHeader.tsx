"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AuthUser } from "@/lib/api/auth";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/bookings": "Bookings",
  "/dashboard/rooms": "Rooms",
  "/dashboard/rooms/types": "Room Types",
  "/dashboard/payments": "Payments",
  "/dashboard/checkin": "Check-in",
  "/dashboard/users": "Users",
  "/dashboard/settings": "Settings",
};

interface DashboardHeaderProps {
  user: AuthUser;
  onMenuClick: () => void;
}

export default function DashboardHeader({
  user,
  onMenuClick,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] ?? "Dashboard";

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between px-6 md:px-10 py-3 bg-white/70 backdrop-blur-xl border-b border-slate-100/50">
      <div className="flex items-center gap-4">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-500 hover:text-primary transition-colors p-1"
        >
          <Icon icon="solar:hamburger-menu-linear" width={24} />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center text-sm font-medium text-slate-400">
          <Link
            href="/dashboard"
            className="hover:text-primary cursor-pointer transition-colors"
          >
            Dashboard
          </Link>
          {pathname !== "/dashboard" && (
            <>
              <Icon
                icon="solar:alt-arrow-right-linear"
                className="mx-2"
                width={12}
              />
              <span className="text-primary">{pageTitle}</span>
            </>
          )}
          {pathname === "/dashboard" && (
            <>
              <Icon
                icon="solar:alt-arrow-right-linear"
                className="mx-2"
                width={12}
              />
              <span className="text-primary">Overview</span>
            </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Search */}
        <div className="hidden md:flex focus-within:border-primary/20 focus-within:bg-white focus-within:shadow-sm transition-all duration-300 bg-slate-100/50 w-64 border-transparent border rounded-full px-4 py-2 items-center">
          <Icon
            icon="solar:magnifer-linear"
            className="text-slate-400 mr-2"
            width={18}
          />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-slate-600 w-full placeholder-slate-400"
          />
        </div>

        {/* Notification Bell */}
        <button className="relative text-slate-400 hover:text-primary transition-colors p-1.5 rounded-full hover:bg-[#f3f0ff]">
          <Icon icon="solar:bell-linear" width={22} />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-[#1a1a1a] group-hover:text-primary transition-colors">
              {user.name?.split(" ")[0] ?? "User"}
            </p>
            <p className="text-xs text-slate-400">
              {(user.role ?? "user").charAt(0) +
                (user.role ?? "user").slice(1).toLowerCase()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-linear-to-tr from-primary to-indigo-400 p-0.5">
            <Avatar className="w-full h-full border-2 border-white">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-primary text-xs font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
