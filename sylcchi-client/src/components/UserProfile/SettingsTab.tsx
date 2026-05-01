"use client";

import { useSignOut } from "@/hooks/useAuth";
import { useUpdateProfile, useUploadProfileImage } from "@/hooks/useUserProfile";
import { updateProfileSchema } from "@/lib/schemas/user";
import type { UserProfile } from "@/lib/types/user";
import {
  AlertCircle,
  Bell,
  Camera,
  CheckCircle,
  Globe,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Phone,
  Save,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

interface SettingsTabContentProps {
  user: UserProfile;
}

interface NotificationSettings {
  bookingConfirmations: boolean;
  promotions: boolean;
  reminders: boolean;
  newsletter: boolean;
  sms: boolean;
}

const NOTIF_LABELS: Record<
  keyof NotificationSettings,
  { title: string; sub: string }
> = {
  bookingConfirmations: {
    title: "Booking Confirmations",
    sub: "Get notified when a booking is confirmed or changed",
  },
  promotions: {
    title: "Promotions and Deals",
    sub: "Exclusive discounts and special offers",
  },
  reminders: {
    title: "Check-in Reminders",
    sub: "Reminder 24h before your stay begins",
  },
  newsletter: {
    title: "Monthly Newsletter",
    sub: "Travel tips and hostel news",
  },
  sms: {
    title: "SMS Alerts",
    sub: "Text notifications for critical updates",
  },
};

export function SettingsTabContent({ user }: SettingsTabContentProps) {
  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    phone: user.phone || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    nationality: user.nationality || "",
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<
      Record<
        "name" | "phone" | "bio" | "location" | "website" | "nationality",
        string
      >
    >
  >({});

  // Notifications
  const [notifs, setNotifs] = useState<NotificationSettings>({
    bookingConfirmations: true,
    promotions: false,
    reminders: true,
    newsletter: false,
    sms: true,
  });

  // Mutations
  const updateProfile = useUpdateProfile();
  const uploadImage = useUploadProfileImage();
  const signOutMutation = useSignOut();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 1024 * 1024) return;
    const formData = new FormData();
    formData.append("image", file);
    await uploadImage.mutateAsync(formData);
    e.target.value = "";
  };

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setFieldErrors({});

    const result = updateProfileSchema.safeParse(profileForm);
    if (!result.success) {
      const { fieldErrors: zodFieldErrors, formErrors } =
        result.error.flatten();
      setFieldErrors({
        name: zodFieldErrors.name?.[0],
        phone: zodFieldErrors.phone?.[0],
        bio: zodFieldErrors.bio?.[0],
        location: zodFieldErrors.location?.[0],
        website: zodFieldErrors.website?.[0],
        nationality: zodFieldErrors.nationality?.[0],
      });
      setProfileError(formErrors[0] ?? "Please fix the validation errors.");
      return;
    }

    const sanitized = result.data;
    updateProfile.mutate(
      {
        name: sanitized.name || undefined,
        phone: sanitized.phone || undefined,
        image: sanitized.image || undefined,
        bio: sanitized.bio || undefined,
        location: sanitized.location || undefined,
        website: sanitized.website || undefined,
        nationality: sanitized.nationality || undefined,
      },
      {
        onSuccess: () => {
          setProfileSaved(true);
          setTimeout(() => setProfileSaved(false), 3000);
        },
        onError: (error) => {
          setProfileError(error.message);
        },
      },
    );
  }

  async function handleSignOut() {
    await signOutMutation.mutateAsync();
    window.location.href = "/login";
  }

  function toggleNotif(key: keyof NotificationSettings) {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-6">
      {/* Profile Photo */}
      <div className="bg-white dark:bg-[#101e2e] border border-[#e8edf2] dark:border-[#243443] rounded-[16px] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0f4f8] dark:border-[#1d3145] flex items-center gap-2">
          <Camera size={16} className="text-[#235784] dark:text-[#7fb3df]" />
          <h3
            className="text-[#040b11] dark:text-white text-[16px]"
            style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
          >
            Profile Photo
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white dark:border-[#1d3145] shadow-lg bg-[#DDEAF6] dark:bg-[#17354f]/40">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={36} className="text-[#235784] dark:text-[#7fb3df]" />
                  </div>
                )}
                {uploadImage.isPending && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                    <Loader2 size={20} className="animate-spin text-white" />
                  </div>
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[#040b11] dark:text-white text-[15px] mb-1"
                style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
              >
                {user.name}
              </p>
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadImage.isPending}
                className="flex items-center gap-2 border-2 border-[#e0e0e0] dark:border-[#243443] hover:border-[#235784] hover:text-[#235784] dark:hover:text-[#7fb3df] text-[#5f6c79] dark:text-[#cbd2da] px-4 py-2 rounded-[8px] text-[13px] transition-all disabled:opacity-50"
                style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
              >
                <Camera size={13} />
                {uploadImage.isPending ? "Uploading..." : "Change Photo"}
              </button>
              <p className="text-[#808385] dark:text-[#7d8a96] text-[11px] mt-2">
                JPEG, PNG, or WebP — max 1MB. Image will be auto-cropped to
                square.
              </p>
              {uploadImage.isSuccess && (
                <p className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-[12px] mt-1.5">
                  <CheckCircle size={12} /> Photo updated successfully!
                </p>
              )}
              {uploadImage.isError && (
                <p className="flex items-center gap-1.5 text-red-500 dark:text-red-400 text-[12px] mt-1.5">
                  <AlertCircle size={12} /> {uploadImage.error.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-[#101e2e] border border-[#e8edf2] dark:border-[#243443] rounded-[16px] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0f4f8] dark:border-[#1d3145] flex items-center gap-2">
          <User size={16} className="text-[#235784] dark:text-[#7fb3df]" />
          <h3
            className="text-[#040b11] dark:text-white text-[16px]"
            style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
          >
            Personal Information
          </h3>
        </div>
        <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-[#040b11] dark:text-white text-[13px] mb-1.5"
                style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
              >
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full border-2 border-[#e0e0e0] dark:border-[#243443] focus:border-[#235784] rounded-[8px] px-4 py-2.5 text-[14px] text-[#2c3c4a] dark:text-[#e8edf2] focus:outline-none transition-colors"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldErrors.name}</p>
              )}
            </div>
            <div>
              <label
                className="block text-[#040b11] dark:text-white text-[13px] mb-1.5"
                style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
              >
                Email Address (Fixed)
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full border-2 border-[#e0e0e0] dark:border-[#243443] rounded-[8px] px-4 py-2.5 text-[14px] text-[#2c3c4a] dark:text-[#e8edf2] bg-[#f7fafd] dark:bg-[#0a1622] cursor-not-allowed opacity-60"
              />
              <p className="mt-1 text-xs text-[#808385] dark:text-[#7d8a96]">
                Email is fixed. Use the verification flow for email changes.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-[#040b11] dark:text-white text-[13px] mb-1.5"
                style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#808385] dark:text-[#7d8a96]"
                />
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  className="w-full border-2 border-[#e0e0e0] dark:border-[#243443] focus:border-[#235784] rounded-[8px] pl-9 pr-4 py-2.5 text-[14px] text-[#2c3c4a] dark:text-[#e8edf2] focus:outline-none transition-colors"
                />
              </div>
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldErrors.phone}</p>
              )}
            </div>
            <div>
              <label
                className="block text-[#040b11] dark:text-white text-[13px] mb-1.5"
                style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
              >
                Location
              </label>
              <div className="relative">
                <MapPin
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#808385] dark:text-[#7d8a96]"
                />
                <input
                  type="text"
                  maxLength={100}
                  value={profileForm.location}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, location: e.target.value }))
                  }
                  placeholder="City, Country"
                  className="w-full border-2 border-[#e0e0e0] dark:border-[#243443] focus:border-[#235784] rounded-[8px] pl-9 pr-4 py-2.5 text-[14px] text-[#2c3c4a] dark:text-[#e8edf2] focus:outline-none transition-colors"
                />
              </div>
              <div className="mt-1 flex items-center justify-between">
                {fieldErrors.location ? (
                  <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.location}</p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-[#808385] dark:text-[#7d8a96]">
                  {profileForm.location.length}/100
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-[#040b11] dark:text-white text-[13px] mb-1.5"
                style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
              >
                Website
              </label>
              <div className="relative">
                <Globe
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#808385] dark:text-[#7d8a96]"
                />
                <input
                  type="url"
                  value={profileForm.website}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, website: e.target.value }))
                  }
                  placeholder="https://yourwebsite.com"
                  className="w-full border-2 border-[#e0e0e0] dark:border-[#243443] focus:border-[#235784] rounded-[8px] pl-9 pr-4 py-2.5 text-[14px] text-[#2c3c4a] dark:text-[#e8edf2] focus:outline-none transition-colors"
                />
              </div>
              {fieldErrors.website && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                  {fieldErrors.website}
                </p>
              )}
            </div>
            <div>
              <label
                className="block text-[#040b11] dark:text-white text-[13px] mb-1.5"
                style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
              >
                Nationality
              </label>
              <input
                type="text"
                maxLength={100}
                value={profileForm.nationality}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, nationality: e.target.value }))
                }
                className="w-full border-2 border-[#e0e0e0] dark:border-[#243443] focus:border-[#235784] rounded-[8px] px-4 py-2.5 text-[14px] text-[#2c3c4a] dark:text-[#e8edf2] focus:outline-none transition-colors"
              />
              <div className="mt-1 flex items-center justify-between">
                {fieldErrors.nationality ? (
                  <p className="text-xs text-red-500 dark:text-red-400">
                    {fieldErrors.nationality}
                  </p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-[#808385] dark:text-[#7d8a96]">
                  {profileForm.nationality.length}/100
                </p>
              </div>
            </div>
          </div>
          <div>
            <label
              className="block text-[#040b11] dark:text-white text-[13px] mb-1.5"
              style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
            >
              Bio
            </label>
            <textarea
              value={profileForm.bio}
              rows={3}
              maxLength={36}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, bio: e.target.value }))
              }
              placeholder="Tell other travellers about yourself..."
              className="w-full border-2 border-[#e0e0e0] dark:border-[#243443] focus:border-[#235784] rounded-[8px] px-4 py-2.5 text-[14px] text-[#2c3c4a] dark:text-[#e8edf2] focus:outline-none transition-colors resize-none"
            />
            <div className="mt-1 flex items-center justify-between">
              {fieldErrors.bio ? (
                <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.bio}</p>
              ) : (
                <span />
              )}
              <p className="text-[#808385] dark:text-[#7d8a96] text-[12px]">
                {profileForm.bio.length}/36
              </p>
            </div>
          </div>
          {profileError && (
            <p className="text-sm text-red-600 dark:text-red-400">{profileError}</p>
          )}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="flex items-center gap-2 bg-[#235784] hover:bg-[#1a4a6d] disabled:bg-[#c0cdd6] dark:disabled:bg-[#3a4a5a] text-white px-6 py-2.5 rounded-[8px] text-[14px] transition-all"
              style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={14} /> Save Changes
                </>
              )}
            </button>
            {profileSaved && (
              <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-[13px]">
                <CheckCircle size={14} /> Saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-[#101e2e] border border-[#e8edf2] dark:border-[#243443] rounded-[16px] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0f4f8] dark:border-[#1d3145] flex items-center gap-2">
          <Lock size={16} className="text-[#235784] dark:text-[#7fb3df]" />
          <h3
            className="text-[#040b11] dark:text-white text-[16px]"
            style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
          >
            Change Password
          </h3>
        </div>
        <div className="p-6">
          <p className="text-[14px] text-[#5f6c79] dark:text-[#cbd2da] mb-4">
            To change your password, we will send a verification code to your
            email address for security.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 bg-[#235784] hover:bg-[#1a4a6d] text-white px-6 py-2.5 rounded-[8px] text-[14px] transition-all"
            style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
          >
            <Lock size={14} /> Reset Password via Email
          </Link>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-[#101e2e] border border-[#e8edf2] dark:border-[#243443] rounded-[16px] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0f4f8] dark:border-[#1d3145] flex items-center gap-2">
          <Bell size={16} className="text-[#235784] dark:text-[#7fb3df]" />
          <h3
            className="text-[#040b11] dark:text-white text-[16px]"
            style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
          >
            Notifications
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {(Object.keys(notifs) as (keyof NotificationSettings)[]).map(
            (key) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[#040b11] dark:text-white text-[14px]"
                    style={{
                      fontFamily: "Mulish, sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    {NOTIF_LABELS[key].title}
                  </p>
                  <p
                    className="text-[#808385] dark:text-[#7d8a96] text-[12px]"
                    style={{ fontFamily: "Open Sans, sans-serif" }}
                  >
                    {NOTIF_LABELS[key].sub}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotif(key)}
                  className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${
                    notifs[key] ? "bg-[#235784]" : "bg-[#c0cdd6] dark:bg-[#3a4a5a]"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      notifs[key] ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Privacy and Security */}
      <div className="bg-white dark:bg-[#101e2e] border border-[#e8edf2] dark:border-[#243443] rounded-[16px] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0f4f8] dark:border-[#1d3145] flex items-center gap-2">
          <Shield size={16} className="text-[#235784] dark:text-[#7fb3df]" />
          <h3
            className="text-[#040b11] dark:text-white text-[16px]"
            style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
          >
            Privacy and Security
          </h3>
        </div>
        <div className="p-6 space-y-3">
          {[
            {
              label: "Download my data",
              sub: "Export a copy of all your personal data",
            },
            {
              label: "Two-factor authentication",
              sub: "Add an extra layer of security",
            },
          ].map(({ label, sub }) => (
            <button
              key={label}
              className="w-full flex items-center justify-between px-4 py-3 border border-[#e8edf2] dark:border-[#243443] rounded-[10px] hover:border-[#235784] hover:bg-[#f7fafd] dark:hover:bg-[#1a2b3d] transition-all group text-left"
            >
              <div>
                <p
                  className="text-[#2c3c4a] dark:text-[#e8edf2] text-[14px]"
                  style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
                >
                  {label}
                </p>
                <p className="text-[#808385] dark:text-[#7d8a96] text-[12px]">{sub}</p>
              </div>
              <ChevronRight
                size={15}
                className="text-[#808385] dark:text-[#7d8a96] group-hover:translate-x-1 transition-transform"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-[#101e2e] border border-red-200 dark:border-red-500/30 rounded-[16px] overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 dark:border-red-500/30 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500 dark:text-red-400" />
          <h3
            className="text-red-600 dark:text-red-400 text-[16px]"
            style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
          >
            Danger Zone
          </h3>
        </div>
        <div className="p-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSignOut}
            disabled={signOutMutation.isPending}
            className="flex items-center justify-center gap-2 border-2 border-[#e0e0e0] dark:border-[#243443] text-[#808385] dark:text-[#7d8a96] hover:border-[#235784] hover:text-[#235784] dark:hover:text-[#7fb3df] px-5 py-2.5 rounded-[8px] text-[14px] transition-all disabled:opacity-50"
            style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
          >
            <LogOut size={15} />{" "}
            {signOutMutation.isPending ? "Signing out..." : "Sign Out"}
          </button>
          <button
            className="flex items-center justify-center gap-2 border-2 border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-5 py-2.5 rounded-[8px] text-[14px] transition-all"
            style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
          >
            <Trash2 size={15} /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ChevronRight icon component definition
function ChevronRight({
  size,
  className,
}: {
  size: number;
  className: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}
