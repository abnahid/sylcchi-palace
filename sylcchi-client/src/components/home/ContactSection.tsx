"use client";

import { FaRegClock } from "react-icons/fa";
import { FaRegEnvelopeOpen } from "react-icons/fa6";
import { FiMapPin } from "react-icons/fi";
import { IoCallOutline } from "react-icons/io5";

const contactInfo = [
  {
    icon: IoCallOutline,
    title: "Phone",
    lines: ["+880 1819-334455", "+880 1677-998877"],
  },
  {
    icon: FaRegEnvelopeOpen,
    title: "Email",
    lines: ["info@sylcchipalace.com"],
  },
  {
    icon: FiMapPin,
    title: "Location",
    lines: ["Dargah Gate Road, Sylhet 3100, Bangladesh"],
  },
  {
    icon: FaRegClock,
    title: "Working Time",
    lines: ["Every day", "Front desk 24/7"],
  },
];

export default function ContactSection() {
  return (
    <section id="contact-section" className="py-12 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 overflow-hidden lg:grid-cols-2">
          {/* Left side - Contact info */}
          <div className=" p-8 sm:p-10 lg:p-12">
            <h2 className="mb-3 font-mulish text-2xl font-extrabold text-[#101b25] sm:text-3xl lg:text-4xl">
              Contact Sylcchi Palace
            </h2>
            <p className="mb-8 max-w-md font-open-sans text-sm leading-relaxed text-gray-500 sm:text-base">
              Our team is ready to help with reservations, group bookings, and
              personalized stay requests in Sylhet.
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {contactInfo.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-secondary">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-mulish text-sm font-bold text-[#101b25] sm:text-base">
                      {item.title}
                    </h3>
                    {item.lines.map((line, i) => (
                      <p
                        key={i}
                        className="font-open-sans text-xs text-gray-500 sm:text-sm"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Google Map iframe */}
          <div className="relative min-h-75 lg:min-h-0">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3618.878395732338!2d91.86534677482791!3d24.902129243590032!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37505528fa3a94ad%3A0x66e2dd5900e737fe!2sDargah%20Gate%2C%20Sylhet!5e0!3m2!1sen!2sbd!4v1774652416133!5m2!1sen!2sbd"
              width="600"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full"
              title="Sylcchi Palace location map"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
