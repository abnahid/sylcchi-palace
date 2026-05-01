import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Sylcchi Palace collects, uses, and protects your personal information when you book a stay or use our website.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    title: "1. Information we collect",
    body: (
      <>
        <p>
          When you book a room or create an account at Sylcchi Palace, we
          collect information that is necessary to provide our services,
          including:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          <li>
            Your name, email address, phone number, and government-issued ID at
            check-in.
          </li>
          <li>
            Booking details such as check-in/check-out dates, room selection,
            and number of guests.
          </li>
          <li>
            Payment information processed securely by Stripe and SSLCommerz —
            we do not store your full card number on our servers.
          </li>
          <li>
            Profile photo and preferences if you choose to upload them to your
            account.
          </li>
          <li>
            Technical data such as browser type, device, and IP address used
            for analytics and fraud prevention.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "2. How we use your information",
    body: (
      <>
        <p>We use your information to:</p>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          <li>Process reservations, payments, and check-ins.</li>
          <li>
            Send you booking confirmations, receipts, and important updates
            about your stay.
          </li>
          <li>
            Improve our website, AI concierge, and overall guest experience.
          </li>
          <li>
            Comply with legal obligations, including hotel registration laws in
            Bangladesh.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Sharing your information",
    body: (
      <p>
        We never sell your personal data. We only share information with
        trusted service providers that help us run the hotel — such as Stripe
        and SSLCommerz for payments, Cloudinary for image hosting, and email
        delivery services for transactional emails. These providers are
        contractually bound to protect your information.
      </p>
    ),
  },
  {
    title: "4. Data retention",
    body: (
      <p>
        We retain booking and payment records for as long as required by
        Bangladeshi tax and hospitality laws. Account information is kept while
        your account is active and may be deleted on request, unless we are
        required to retain it for legal reasons.
      </p>
    ),
  },
  {
    title: "5. Your rights",
    body: (
      <p>
        You can access, update, or delete the personal information stored in
        your profile at any time from the Profile page. To request a full
        export or permanent deletion of your data, email us at
        privacy@sylcchipalace.com.
      </p>
    ),
  },
  {
    title: "6. Cookies",
    body: (
      <p>
        We use essential cookies to keep you signed in and to remember your
        booking session. We do not use third-party advertising cookies.
      </p>
    ),
  },
  {
    title: "7. Security",
    body: (
      <p>
        All traffic to and from our website is encrypted with HTTPS. Passwords
        are hashed with industry-standard algorithms, and payment details are
        handled exclusively by PCI-DSS compliant payment processors.
      </p>
    ),
  },
  {
    title: "8. Contact",
    body: (
      <p>
        Questions about this policy? Email{" "}
        <a
          href="mailto:privacy@sylcchipalace.com"
          className="text-[#245b8d] dark:text-[#7fb3df] underline"
        >
          privacy@sylcchipalace.com
        </a>{" "}
        or write to us at Sylcchi Palace, Dargah Gate Road, Sylhet 3100,
        Bangladesh.
      </p>
    ),
  },
];

export default function Page() {
  return (
    <main className="bg-slate-50 dark:bg-[#0a1622]">
      <section className="bg-[#245b8d] text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="font-mulish text-4xl font-extrabold md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-slate-100">
            Last updated: April 8, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="rounded-2xl bg-white dark:bg-[#101e2e] p-8 shadow-sm md:p-10">
          <p className="text-sm leading-7 text-slate-600 dark:text-[#9aa5b0]">
            Sylcchi Palace (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;)
            respects your privacy. This policy explains what information we
            collect when you visit{" "}
            <span className="font-semibold">sylcchipalace.com</span> or stay
            with us at our hotel in Sylhet, Bangladesh, and how we use and
            protect that information.
          </p>

          <div className="mt-8 space-y-8">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="font-mulish text-lg font-bold text-slate-900 dark:text-white">
                  {s.title}
                </h2>
                <div className="mt-2 text-sm leading-7 text-slate-600 dark:text-[#9aa5b0]">
                  {s.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
