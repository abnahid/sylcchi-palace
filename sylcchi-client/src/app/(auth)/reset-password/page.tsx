import ResetPasswordClient from "@/components/auth/ResetPasswordClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Sylcchi Palace",
  description: "Set a new password for your Sylcchi Palace account.",
};

const page = () => {
  return <ResetPasswordClient />;
};

export default page;
