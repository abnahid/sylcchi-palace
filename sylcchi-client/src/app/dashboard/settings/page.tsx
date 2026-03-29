"use client";

import PageHeader from "@/components/dashboard/PageHeader";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/useAuth";
import { useUpdateProfile, useUserProfile } from "@/hooks/useUserProfile";
import type { UserProfile } from "@/lib/types/user";
import { useEffect, useMemo, useState } from "react";

export default function SettingsPage() {
  const { data: user } = useSession();
  const { data: profileRes, isLoading, isError, error } = useUserProfile();
  const updateProfile = useUpdateProfile();

  const profile: UserProfile | undefined = useMemo(() => {
    if (!profileRes) return undefined;
    const res = profileRes as unknown as Record<string, unknown>;
    if (
      res.data &&
      typeof res.data === "object" &&
      (res.data as Record<string, unknown>).id
    ) {
      return res.data as UserProfile;
    }
    if (res.id && typeof res.id === "string") {
      return res as unknown as UserProfile;
    }
    return undefined;
  }, [profileRes]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    nationality: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        phone: profile.phone ?? "",
        bio: profile.bio ?? "",
        location: profile.location ?? "",
        website: profile.website ?? "",
        nationality: profile.nationality ?? "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        name: form.name || undefined,
        phone: form.phone || undefined,
        bio: form.bio || undefined,
        location: form.location || undefined,
        website: form.website || undefined,
        nationality: form.nationality || undefined,
      });
    } catch {
      /* captured by mutation state */
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Settings" />
        <div className="mx-auto max-w-2xl">
          <div className="animate-pulse space-y-4 bg-white rounded-2xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-8">
        <PageHeader title="Settings" />
        <div className="mx-auto max-w-2xl bg-white rounded-2xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50 text-center">
          <p className="text-sm text-rose-600">
            Failed to load: {error?.message ?? "Unknown error"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your profile and account settings."
      />

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Profile */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50">
          <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish mb-4">
            Profile Information
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Name
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Phone
                </label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Location
                </label>
                <Input
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Nationality
                </label>
                <Input
                  value={form.nationality}
                  onChange={(e) =>
                    setForm({ ...form, nationality: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Website
                </label>
                <Input
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Bio
                </label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
              >
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
            {updateProfile.isSuccess && (
              <p className="text-sm text-emerald-600">
                Profile updated successfully.
              </p>
            )}
            {updateProfile.isError && (
              <p className="text-sm text-rose-600">
                {updateProfile.error.message}
              </p>
            )}
          </form>
        </div>

        {/* Account */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50">
          <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish mb-4">
            Account Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Email</span>
              <span className="font-medium text-[#1a1a1a]">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Role</span>
              <span className="font-medium text-[#1a1a1a] capitalize">
                {user?.role?.toLowerCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email Verified</span>
              <span
                className={
                  user?.emailVerified
                    ? "font-medium text-emerald-600"
                    : "text-orange-600"
                }
              >
                {user?.emailVerified ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        <RoleGuard roles={["ADMIN"]}>
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-50">
            <h3 className="text-[#1a1a1a] text-lg font-semibold font-mulish mb-2">
              System Information
            </h3>
            <p className="text-sm text-slate-500">
              System configuration is managed through environment variables.
              Contact the dev team for changes.
            </p>
          </div>
        </RoleGuard>
      </div>
    </div>
  );
}
