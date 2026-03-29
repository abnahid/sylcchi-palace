"use client";

import type { UserProfile } from "@/lib/types/user";
import {
  BedDouble,
  Calendar,
  CheckCircle,
  Clock,
  Edit3,
  Heart,
} from "lucide-react";
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
    <div className="bg-[#f7fafd] border border-[#e8edf2] rounded-[12px] p-4 text-center">
      <div className="flex justify-center mb-2 text-[#235784]">{icon}</div>
      <p
        className="text-[#040b11] text-[22px]"
        style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
      >
        {value}
      </p>
      <p
        className="text-[#808385] text-[12px]"
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
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#e8edf2] rounded-[16px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-[#040b11] text-[17px] flex items-center gap-2"
            style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
          >
            <BedDouble size={16} className="text-[#235784]" /> About Me
          </h3>
          <button
            onClick={onEditClick}
            className="flex items-center gap-1 text-[#235784] text-[13px] hover:underline"
            style={{ fontFamily: "Mulish, sans-serif", fontWeight: 600 }}
          >
            <Edit3 size={13} /> Edit
          </button>
        </div>
        <p
          className="text-[#2c3c4a] text-[15px] leading-[1.7] mb-5"
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
              <span className="text-[#235784] mt-0.5 shrink-0 text-lg">
                {icon}
              </span>
              <div>
                <p
                  className="text-[#808385] text-[11px] uppercase tracking-wide mb-0.5"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  {label}
                </p>
                <p
                  className="text-[#2c3c4a] text-[14px] break-all"
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
          className="text-[#040b11] text-[16px] mb-3"
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

      <div className="bg-white border border-[#e8edf2] rounded-[16px] p-6">
        <h3
          className="text-[#040b11] text-[17px] mb-4 flex items-center gap-2"
          style={{ fontFamily: "Mulish, sans-serif", fontWeight: 800 }}
        >
          <Clock size={16} className="text-[#235784]" /> Account Info
        </h3>
        <div className="space-y-3">
          <div className="pb-3 border-b border-[#f0f4f8]">
            <p
              className="text-[#808385] text-[12px] uppercase tracking-wide mb-1"
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
                <RiVerifiedBadgeFill className="text-primary" size={16} />
              )}
              <p className="text-[#2c3c4a] text-[14px]">
                {user.emailVerified ? "Email Verified" : "Pending Verification"}
              </p>
            </div>
          </div>
          <div className="pb-3 border-b border-[#f0f4f8] last:border-0 last:pb-0">
            <p
              className="text-[#808385] text-[12px] uppercase tracking-wide mb-1"
              style={{ fontFamily: "Open Sans, sans-serif" }}
            >
              Account Role
            </p>
            <p className="text-[#2c3c4a] text-[14px] capitalize">{user.role}</p>
          </div>
          <div className="pb-3">
            <p
              className="text-[#808385] text-[12px] uppercase tracking-wide mb-1"
              style={{ fontFamily: "Open Sans, sans-serif" }}
            >
              Member Since
            </p>
            <p className="text-[#2c3c4a] text-[14px]">
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
