import LoginClient from "@/components/auth/LoginClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Sylcchi Palace",
  description: "Sign in to your Sylcchi Palace account.",
};

import { Suspense } from "react";

const page = () => {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
};

export default page;
