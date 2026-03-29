"use client";

import { useMyBookings } from "@/hooks/useBooking";
import { useUserProfile, useWishlist } from "@/hooks/useUserProfile";
import {
  AlertCircle,
  BedDouble,
  Calendar,
  Camera,
  Edit3,
  Heart,
  Loader2,
  MapPin,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { BookingsTabContent } from "./BookingsTab";
import { ProfileTabContent } from "./ProfileTab";
import { SettingsTabContent } from "./SettingsTab";
import { WishlistTabContent } from "./WishlistTab";

type TabId = "profile" | "bookings" | "wishlist" | "settings";

const VALID_TABS: TabId[] = ["profile", "bookings", "wishlist", "settings"];

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

function TabIcon({ id }: { id: TabId }) {
  if (id === "profile") return <User size={17} />;
  if (id === "bookings") return <BedDouble size={17} />;
  if (id === "wishlist") return <Heart size={17} />;
  if (id === "settings") return <Settings size={17} />;
  return null;
}

function UserProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  const { data: userResponse, isLoading: userLoading } = useUserProfile();
  const { data: wishlistResponse } = useWishlist();
  const { data: myBookings } = useMyBookings();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && VALID_TABS.includes(tab as TabId)) {
      setActiveTab(tab as TabId);
    }
  }, [searchParams]);

  function switchTab(id: TabId) {
    setActiveTab(id);
    router.push(`/profile?tab=${id}`, { scroll: false });
  }

  const user = userResponse?.data;
  const wishlistItems = wishlistResponse?.data || [];
  const bookingsList = myBookings ?? [];
  const totalNights = bookingsList.reduce((sum, b) => sum + (b.nights ?? 0), 0);

  const TABS: TabConfig[] = [
    { id: "profile", label: "Profile", icon: <TabIcon id="profile" /> },
    { id: "bookings", label: "My Bookings", icon: <TabIcon id="bookings" /> },
    {
      id: "wishlist",
      label: "Wishlist",
      icon: <TabIcon id="wishlist" />,
    },
    { id: "settings", label: "Settings", icon: <TabIcon id="settings" /> },
  ];

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#f7fafd] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#235784]" />
          <p className="text-[#808385]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f7fafd] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-[#040b11] text-lg font-bold mb-2">
            Unable to load profile
          </p>
          <Link
            href="/login"
            className="inline-block bg-[#235784] text-white px-6 py-2 rounded-lg hover:bg-[#1a4a6d] transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7fafd] min-h-screen">
      {/* Hero band */}
      <div className="bg-[#235784] h-30 sm:h-35" />

      <div className="max-w-275 mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-7 -mt-16 lg:-mt-20">
          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <div className="lg:w-65 shrink-0">
            {/* User card */}
            <div className="bg-white rounded-[20px] shadow-[0_4px_30px_rgba(35,87,132,0.12)] p-6 mb-4">
              {/* Avatar */}
              <div className="relative mx-auto w-fit mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-[#DDEAF6]">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={48} className="text-[#235784]" />
                    </div>
                  )}
                </div>
                <button
                  className="absolute bottom-0 right-0 w-8 h-8 bg-[#235784] hover:bg-[#1a4a6d] rounded-full flex items-center justify-center shadow-md transition-colors"
                  title="Change photo"
                >
                  <Camera size={14} className="text-white" />
                </button>
              </div>

              {/* Name & info */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <h3
                    className="text-[#040b11] text-[18px]"
                    style={{
                      fontFamily: "Mulish, sans-serif",
                      fontWeight: 800,
                    }}
                  >
                    {user.name}
                  </h3>
                  {user.emailVerified && (
                    <span title="Verified account">
                      <RiVerifiedBadgeFill className="text-primary" size={16} />
                    </span>
                  )}
                </div>
                <p className="text-[#808385] text-[13px] mb-1 break-all">
                  {user.email}
                </p>
                {user.location && (
                  <p className="text-[#808385] text-[12px] flex items-center justify-center gap-1">
                    <MapPin size={11} /> {user.location}
                  </p>
                )}
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#f0f4f8]">
                <div className="text-center">
                  <p
                    className="text-[#040b11] text-[18px]"
                    style={{
                      fontFamily: "Mulish, sans-serif",
                      fontWeight: 800,
                    }}
                  >
                    {bookingsList.length}
                  </p>
                  <p className="text-[#808385] text-[11px]">Bookings</p>
                </div>
                <div className="text-center">
                  <p
                    className="text-[#040b11] text-[18px]"
                    style={{
                      fontFamily: "Mulish, sans-serif",
                      fontWeight: 800,
                    }}
                  >
                    {totalNights}
                  </p>
                  <p className="text-[#808385] text-[11px]">Nights</p>
                </div>
                <div className="text-center">
                  <p
                    className="text-[#040b11] text-[18px]"
                    style={{
                      fontFamily: "Mulish, sans-serif",
                      fontWeight: 800,
                    }}
                  >
                    {wishlistItems.length}
                  </p>
                  <p className="text-[#808385] text-[11px]">Saved</p>
                </div>
              </div>

              {/* Member since */}
              {user.createdAt && (
                <div className="mt-4 bg-[#f7fafd] border border-[#DDEAF6] rounded-[8px] px-3 py-2 flex items-center gap-2">
                  <Calendar size={12} className="text-[#235784]" />
                  <p className="text-[#808385] text-[11px]">
                    Member since{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Desktop vertical nav */}
            <nav className="hidden lg:block bg-white rounded-[16px] shadow-[0_2px_16px_rgba(35,87,132,0.07)] overflow-hidden">
              {TABS.map((tab, i) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => switchTab(tab.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 text-left transition-all ${
                      i !== TABS.length - 1 ? "border-b border-[#f0f4f8]" : ""
                    } ${
                      isActive
                        ? "bg-[#f0f7ff] text-[#235784]"
                        : "text-[#2c3c4a] hover:bg-[#f7fafd] hover:text-[#235784]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          isActive ? "text-[#235784]" : "text-[#808385]"
                        }
                      >
                        {tab.icon}
                      </span>
                      <span
                        className="text-[14px]"
                        style={{
                          fontFamily: "Mulish, sans-serif",
                          fontWeight: isActive ? 800 : 600,
                        }}
                      >
                        {tab.label}
                      </span>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#235784]" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Edit profile quick link */}
            <button
              onClick={() => switchTab("settings")}
              className="hidden lg:flex mt-3 w-full items-center justify-center gap-2 border border-[#e0e0e0] text-[#808385] hover:border-[#235784] hover:text-[#235784] py-2.5 rounded-[10px] text-[13px] transition-all"
              style={{ fontFamily: "Open Sans, sans-serif" }}
            >
              <Edit3 size={13} /> Edit Profile
            </button>
          </div>

          {/* ── Main content ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Mobile horizontal tabs */}
            <div className="lg:hidden bg-white rounded-[14px] shadow-[0_2px_16px_rgba(35,87,132,0.07)] mb-5 overflow-x-auto">
              <div className="flex">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => switchTab(tab.id)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3.5 border-b-2 text-[13px] transition-all whitespace-nowrap ${
                        isActive
                          ? "border-[#235784] text-[#235784] bg-[#f7fafd]"
                          : "border-transparent text-[#808385] hover:text-[#235784]"
                      }`}
                      style={{
                        fontFamily: "Mulish, sans-serif",
                        fontWeight: isActive ? 800 : 600,
                      }}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab content */}
            {activeTab === "profile" && user && (
              <ProfileTabContent
                user={user}
                onEditClick={() => switchTab("settings")}
              />
            )}
            {activeTab === "bookings" && user && (
              <BookingsTabContent userId={user.id} />
            )}
            {activeTab === "wishlist" && <WishlistTabContent />}
            {activeTab === "settings" && user && (
              <SettingsTabContent user={user} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Suspense wrapper
export function UserProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7fafd] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#235784]" />
        </div>
      }
    >
      <UserProfileContent />
    </Suspense>
  );
}

export default UserProfilePage;
