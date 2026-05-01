"use client";

import { useRequestOtp } from "@/hooks/useAuth";
import type { UserProfile } from "@/lib/types/user";
import {
  AlertCircle,
  BedDouble,
  Calendar,
  CheckCircle,
  Clock,
  Edit3,
  Heart,
  Loader2,
  MailCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import { RiVerifiedBadgeFill } from "react-icons/ri";

interface ProfileTabContentProps {
  user: UserProfile;
  onEditClick: () => void;
  stats: {
    totalBookings: number;
    completedStays: number;
    savedRooms: number;
    nightsStayed: number;
  };
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="bg-[#f7fafd] dark:bg-[#0a1622] border border-[#e8edf2] dark:border-[#243443] rounded-[12px] p-4 text-center">
      <div className="flex justify-center mb-2 text-[#235784] dark:text-[#7fb3df]">{icon}</div>
      <p
        className="text-[#040b11] dark:text-white text-[22px]"
        style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
      >
        {value}
      </p>
      <p
        className="text-[#808385] dark:text-[#7d8a96] text-[12px]"
        style={{ fontFamily: "Open Sans, sans-serif" }}
      >
        {label}
      </p>
    </div>
  );
}

export function ProfileTabContent({
  user,
  onEditClick,
  stats,
}: ProfileTabContentProps) {
  const router = useRouter();
  const requestOtpMutation = useRequestOtp();

  const handleVerifyNow = async () => {
    try {
      await requestOtpMutation.mutateAsync({
        email: user.email,
        type: "email-verification",
      });

      router.push(
        `/verify-otp?mode=register&email=${encodeURIComponent(user.email)}&next=${encodeURIComponent("/profile?tab=profile")}`,
      );
    } catch {
      // The API error message is surfaced in the inline alert below.
    }
  };

  return (
    <div className="space-y-6">
      {!user.emailVerified && (
        <div className="rounded-[16px] border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className="flex items-center gap-2 text-[15px] text-amber-900 dark:text-amber-300"
                style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
              >
                <MailCheck size={17} /> Verify your email to secure your account
              </p>
              <p className="mt-1 text-[13px] text-amber-800 dark:text-amber-300">
                We will send a one-time OTP code to {user.email}.
              </p>
            </div>

            <button
              onClick={handleVerifyNow}
              disabled={requestOtpMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#235784] px-4 py-2.5 text-[13px] text-white transition-colors hover:bg-[#1a4a6d] disabled:cursor-not-allowed disabled:opacity-70"
              style={{ fontFamily: "Mulish, sans-serif", fontWeight: 700 }}
            >
              {requestOtpMutation.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Sending OTP...
                </>
              ) : (
                "Verify Now"
              )}
            </button>
          </div>

          {requestOtpMutation.isError && (
            <p className="mt-3 flex items-center gap-1.5 text-[12px] text-red-600 dark:text-red-400">
              <AlertCircle size={13} />
              {requestOtpMutation.error?.message ??
                "Could not send verification OTP. Please try again."}
            </p>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-[#101e2e] border border-[#e8edf2] dark:border-[#243443] rounded-[16px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-[#040b11] dark:text-white text-[17px] flex items-center gap-2"
            style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
          >
            <BedDouble size={16} className="text-[#235784] dark:text-[#7fb3df]" /> About Me
          </h3>
          <button
            onClick={onEditClick}
            className="flex items-center gap-1 text-[#235784] dark:text-[#7fb3df] text-[13px] hover:underline"
            style={{ fontFamily: "Mulish, sans-serif", fontWeight: 600 }}
          >
            <Edit3 size={13} /> Edit
          </button>
        </div>
        <p
          className="text-[#2c3c4a] dark:text-[#e8edf2] text-[15px] leading-[1.7] mb-5"
          style={{ fontFamily: "Open Sans, sans-serif" }}
        >
          {user.bio || "No bio added yet."}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: <FaMapMarkerAlt size={16} />,
              label: "Location",
              value: user.location || "Not provided",
            },
            {
              icon: <FaGlobe size={16} />,
              label: "Website",
              value: user.website || "Not provided",
            },
            {
              icon: <FaEnvelope size={16} />,
              label: "Email",
              value: user.email,
            },
            {
              icon: <FaPhoneAlt size={16} />,
              label: "Phone",
              value: user.phone || "Not provided",
            },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="text-[#235784] dark:text-[#7fb3df] mt-0.5 shrink-0 text-lg">
                {icon}
              </span>
              <div>
                <p
                  className="text-[#808385] dark:text-[#7d8a96] text-[11px] uppercase tracking-wide mb-0.5"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  {label}
                </p>
                <p
                  className="text-[#2c3c4a] dark:text-[#e8edf2] text-[14px] break-all"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3
          className="text-[#040b11] dark:text-white text-[16px] mb-3"
          style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
        >
          Your Stats
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<BedDouble size={20} />}
            value={stats.totalBookings}
            label="Total Bookings"
          />
          <StatCard
            icon={<CheckCircle size={20} />}
            value={stats.completedStays}
            label="Stays Completed"
          />
          <StatCard
            icon={<Heart size={20} />}
            value={stats.savedRooms}
            label="Saved Rooms"
          />
          <StatCard
            icon={<Calendar size={20} />}
            value={stats.nightsStayed}
            label="Nights Stayed"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#101e2e] border border-[#e8edf2] dark:border-[#243443] rounded-[16px] p-6">
        <h3
          className="text-[#040b11] dark:text-white text-[17px] mb-4 flex items-center gap-2"
          style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
        >
          <Clock size={16} className="text-[#235784] dark:text-[#7fb3df]" /> Account Info
        </h3>
        <div className="space-y-3">
          <div className="pb-3 border-b border-[#f0f4f8] dark:border-[#1d3145]">
            <p
              className="text-[#808385] dark:text-[#7d8a96] text-[12px] uppercase tracking-wide mb-1"
              style={{ fontFamily: "Open Sans, sans-serif" }}
            >
              Email Status
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  user.emailVerified ? "bg-green-500" : "bg-yellow-500"
                }`}
              />
              {user.emailVerified && (
                <RiVerifiedBadgeFill className="text-primary dark:text-[#7fb3df]" size={16} />
              )}
              <p className="text-[#2c3c4a] dark:text-[#e8edf2] text-[14px]">
                {user.emailVerified ? "Email Verified" : "Pending Verification"}
              </p>
            </div>
          </div>
          <div className="pb-3 border-b border-[#f0f4f8] dark:border-[#1d3145] last:border-0 last:pb-0">
            <p
              className="text-[#808385] dark:text-[#7d8a96] text-[12px] uppercase tracking-wide mb-1"
              style={{ fontFamily: "Open Sans, sans-serif" }}
            >
              Account Role
            </p>
            <p className="text-[#2c3c4a] dark:text-[#e8edf2] text-[14px] capitalize">{user.role}</p>
          </div>
          <div className="pb-3">
            <p
              className="text-[#808385] dark:text-[#7d8a96] text-[12px] uppercase tracking-wide mb-1"
              style={{ fontFamily: "Open Sans, sans-serif" }}
            >
              Member Since
            </p>
            <p className="text-[#2c3c4a] dark:text-[#e8edf2] text-[14px]">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
