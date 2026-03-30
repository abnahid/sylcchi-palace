"use client";

import type { AuthUser } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: string[];
  section: "overview" | "management";
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "solar:widget-5-linear",
    roles: ["ADMIN", "MANAGER"],
    section: "overview",
  },
  {
    label: "Bookings",
    href: "/dashboard/bookings",
    icon: "solar:wallet-money-linear",
    roles: ["ADMIN", "MANAGER"],
    section: "overview",
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: "solar:card-linear",
    roles: ["ADMIN"],
    section: "overview",
  },
  {
    label: "Rooms",
    href: "/dashboard/rooms",
    icon: "solar:box-minimalistic-linear",
    roles: ["ADMIN", "MANAGER"],
    section: "management",
  },
  {
    label: "Room Types",
    href: "/dashboard/rooms/types",
    icon: "solar:tag-horizontal-linear",
    roles: ["ADMIN"],
    section: "management",
  },
  {
    label: "Check-in",
    href: "/dashboard/checkin",
    icon: "solar:clipboard-check-linear",
    roles: ["ADMIN", "MANAGER"],
    section: "management",
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: "solar:users-group-rounded-linear",
    roles: ["ADMIN"],
    section: "management",
  },
];

interface DashboardSidebarProps {
  user: AuthUser;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
  onSignOut: () => void;
  isSigningOut: boolean;
}

export default function DashboardSidebar({
  user,
  collapsed,
  mobileOpen,
  onToggle,
  onMobileClose,
  onSignOut,
  isSigningOut,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const userRole = user.role ?? "CUSTOMER";

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole),
  );
  const overviewItems = filteredItems.filter((i) => i.section === "overview");
  const managementItems = filteredItems.filter(
    (i) => i.section === "management",
  );

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U";

  const sidebarContent = (
    <>
      {/* Logo Area */}
      <div className="h-20 flex items-center px-8 border-b border-slate-50/50">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          onClick={onMobileClose}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white  shadow-primary/30 shrink-0">
            <span className="text-lg font-semibold">S</span>
          </div>
          {!collapsed && (
            <span className="text-[#1a1a1a] text-xl font-extrabold tracking-tight font-mulish">
              SYLCCHI<span className="text-primary">.</span>
            </span>
          )}
        </Link>
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="md:hidden ml-auto text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3.5">
            Overview
          </p>
        )}
        {overviewItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200",
                active
                  ? "text-primary font-medium"
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary",
                collapsed && "justify-center px-3",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon icon={item.icon} width={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {managementItems.length > 0 && (
          <>
            {!collapsed && (
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3.5 mt-3.5">
                Management
              </p>
            )}
            {collapsed && <div className="my-4 border-t border-slate-100" />}
            {managementItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200",
                    active
                      ? "text-primary font-medium"
                      : "text-slate-500 hover:bg-slate-50 hover:text-primary",
                    collapsed && "justify-center px-3",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon icon={item.icon} width={20} className="shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-slate-50">
        <Link
          href="/dashboard/settings"
          onClick={onMobileClose}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
            pathname === "/dashboard/settings"
              ? "text-primary font-medium"
              : "text-slate-500 hover:bg-slate-50 hover:text-primary",
            collapsed && "justify-center px-3",
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <Icon icon="solar:settings-linear" width={20} />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={onSignOut}
          disabled={isSigningOut}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-rose-500 transition-all duration-200 mt-1",
            collapsed && "justify-center px-3",
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <Icon icon="solar:logout-2-linear" width={20} />
          {!collapsed && (
            <span>{isSigningOut ? "Signing out..." : "Logout"}</span>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-[#1a1a1a]/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white/90 backdrop-blur-xl border-r border-slate-100 flex flex-col justify-between shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300",
          // Mobile: slide in/out
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
          // Desktop: always visible
          "md:relative md:translate-x-0",
          collapsed ? "md:w-18" : "md:w-64",
        )}
      >
        {sidebarContent}

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={onToggle}
          className="hidden md:flex absolute -right-3 top-24 h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm hover:bg-slate-50 hover:text-primary transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
}
