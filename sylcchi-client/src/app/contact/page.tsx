import Breadcrumb from "@/components/Breadcrumb";
import ContactClient from "@/components/contact/ContactClient";

const page = () => {
  return (
    <div>
      <Breadcrumb
        title="Contact"
        items={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <ContactClient />
    </div>
  );
};

export default page;
