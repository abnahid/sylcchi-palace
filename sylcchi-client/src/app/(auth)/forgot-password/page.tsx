import ForgotPasswordClient from "@/components/auth/ForgotPasswordClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Sylcchi Palace",
  description: "Request a password reset code for your Sylcchi Palace account.",
};

export default function Page() {
  return <ForgotPasswordClient />;
}
