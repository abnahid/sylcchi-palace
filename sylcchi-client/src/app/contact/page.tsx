import Breadcrumb from "@/components/Breadcrumb";
import ContactClient from "@/components/contact/ContactClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Sylcchi Palace. Located on Dargah Gate Road, Sylhet 3100, Bangladesh. Call +880 1819-334455 or email info@sylcchipalace.com. 24/7 front desk.",
  alternates: { canonical: "/contact" },
};

export default function Page() {
  return (
    <div>
      <Breadcrumb
        title="Contact"
        items={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <ContactClient />
    </div>
  );
}
