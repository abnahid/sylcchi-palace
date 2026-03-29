import { UserProfilePage } from "@/components/UserProfile/UserProfile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Profile | Sylcchi Palace",
  description: "Manage your profile settings, bookings, and wishlist",
};

export default function ProfilePage() {
  return <UserProfilePage />;
}
