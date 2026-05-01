import { MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Rooms", href: "/rooms", highlight: true },
  { label: "News", href: "/news" },
];

const supportLinks = [
  { label: "Help / Support", href: "/support" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

const socialLinks = [
  { label: "Facebook", href: "#", icon: FaFacebookF },
  { label: "Instagram", href: "#", icon: FaInstagram },
  { label: "Twitter", href: "#", icon: FaTwitter },
  { label: "WhatsApp", href: "#", icon: FaWhatsapp },
];

const contact = {
  address: "Dargah Gate Road, Sylhet 3100, Bangladesh",
  phones: ["+880 1819-334455", "+880 1677-998877"],
  email: "info@sylcchipalace.com",
};

export default function Footer() {
  return (
    <footer>
      <div className="bg-[#245b8d] text-white dark:bg-[#13283d]">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-5">
              <Link href="/" className="inline-flex items-center">
                <Image
                  src="/assets/images/sylcchi-palace.png"
                  alt="Sylcchi Palace"
                  width={200}
                  height={40}
                  style={{ width: "auto", height: "auto" }}
                  className=" brightness-0 invert"
                />
              </Link>
              <p className="max-w-[320px] text-sm leading-6 text-slate-100 font-open-sans">
                Experience refined comfort at Sylcchi Palace, a luxury stay in
                Sylhet with elegant rooms, premium dining, and warm,
                personalized service for business and leisure travelers.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-extrabold font-mulish">
                Quick links
              </h3>
              <ul className="space-y-3 font-open-sans">
                {quickLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`text-sm transition-colors hover:text-slate-200 ${
                        item.highlight
                          ? "font-semibold underline underline-offset-4"
                          : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-extrabold font-mulish">Contact Us</h3>

              <div className="flex items-start gap-3 text-sm leading-6 font-open-sans">
                <MapPin className="mt-1 h-4 w-4 shrink-0" />
                <p className="max-w-55 text-slate-100">{contact.address}</p>
              </div>

              <div className="flex items-start gap-3 text-sm leading-6 font-open-sans">
                <Phone className="mt-1 h-4 w-4 shrink-0" />
                <div>
                  {contact.phones.map((phone) => (
                    <p key={phone} className="text-slate-100">
                      {phone}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-extrabold font-mulish">Follow Us</h3>
              <p className="max-w-55 text-sm leading-6 text-slate-100 font-open-sans">
                Follow Sylcchi Palace for offers, new room experiences, and
                travel updates.
              </p>
              <ul className="flex items-center gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <li key={social.label}>
                      <Link
                        href={social.href}
                        aria-label={social.label}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 transition-colors hover:bg-white hover:text-[#245b8d]"
                      >
                        <Icon className="h-4 w-4" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-[#0f1c2c]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center px-4 py-6 text-center">
          <p className="text-sm text-slate-700 font-open-sans dark:text-[#cbd2da]">
            © {new Date().getFullYear()} Sylcchi Palace. All rights reserved.
          </p>
          <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 lg:mt-0">
            {supportLinks.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="font-open-sans text-sm text-slate-600 transition-colors hover:text-[#245b8d] dark:text-[#9aa5b0] dark:hover:text-[#7fb3df]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-500 mt-2 dark:text-[#7d8a96]">
            Designed and developed by
            <Link
              href="https://abnahid.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline ml-1"
            >
              Ab Nahid
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
