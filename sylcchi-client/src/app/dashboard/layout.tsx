"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Spinner } from "@/components/ui/spinner";
import { useSession, useSignOut } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: user, isLoading } = useSession();
  const signOutMutation = useSignOut();
  const router = useRouter();

  const isAuthorized = user?.role === "ADMIN" || user?.role === "MANAGER";

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.replace("/");
    }
  }, [isLoading, isAuthorized, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8 text-[#5802f7]" />
          <p className="text-sm text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return null;
  }

  const handleSignOut = async () => {
    await signOutMutation.mutateAsync();
    router.push("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-600 font-sans antialiased">
      <DashboardSidebar
        user={user}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed(!collapsed)}
        onMobileClose={() => setMobileOpen(false)}
        onSignOut={handleSignOut}
        isSigningOut={signOutMutation.isPending}
      />

      <main className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden scroll-smooth">
        <DashboardHeader
          user={user}
          onMenuClick={() => setMobileOpen(true)}
        />
        <div className="w-full max-w-7xl mx-auto px-6 py-6 md:px-10 md:py-10 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
