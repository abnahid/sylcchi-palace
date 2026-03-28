import RegisterClient from "@/components/auth/RegisterClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Sylcchi Palace",
  description: "Create a new Sylcchi Palace account.",
};

const page = () => {
  return <RegisterClient />;
};

export default page;
