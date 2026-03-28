import VerifyOtpClient from "@/components/auth/VerifyOtpClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify OTP | Sylcchi Palace",
  description: "Verify your one-time password to continue.",
};

const page = () => {
  return <VerifyOtpClient />;
};

export default page;
