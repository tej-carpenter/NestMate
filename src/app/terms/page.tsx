import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use and service agreement for Nestmate",
};

export default function TermsOfUsePage() {
  return (
    <div className="bg-[color:var(--background)]">
      {/* Header Section */}
      <div className="bg-[color:var(--brand)] text-[color:var(--brand-foreground)] py-20 px-6 sm:px-12 lg:px-24 rounded-b-[32px] sm:rounded-b-[64px]">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">Last Updated: June 2026</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Terms of Use
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
            Welcome to Nestmate. These Terms of Use govern your access to and use of the Nestmate platform.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto max-w-4xl px-6 sm:px-12 py-16 sm:py-24">
        <div className="space-y-16">
          <section>
            <p className="text-lg leading-8 text-[color:var(--muted)]">
              By accessing or using Nestmate, you agree to these Terms. Please read them carefully before using our platform.
            </p>
          </section>

          {/* 1. About Nestmate */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight mb-6">
              1. About Nestmate
            </h2>
            <p className="text-[color:var(--muted)] mb-4">
              Nestmate is an online marketplace that helps users discover accommodation options including:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {["PGs", "Rooms", "Shared rooms", "Hostels", "Lodges", "Apartments", "Beds"].map((item, i) => (
                <div key={i} className="flex items-center justify-center p-3 rounded-lg bg-[color:var(--background)] border border-[color:var(--border)] text-sm font-medium">
                  {item}
                </div>
              ))}
            </div>
            <p className="text-[color:var(--muted)] leading-relaxed">
              Nestmate acts solely as a platform connecting hosts and guests. Nestmate is not the owner, operator, manager, or landlord of listed properties unless explicitly stated.
            </p>
          </section>

          {/* 2 & 3. Eligibility & Accounts */}
          <div className="grid sm:grid-cols-2 gap-6">
            <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 border border-[color:var(--border)] shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                2. Eligibility
              </h2>
              <p className="text-[color:var(--muted)] mb-3">You must:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Be at least 18 years old</li>
                <li>Have legal capacity to enter agreements</li>
                <li>Provide accurate information</li>
              </ul>
              <div className="p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium">
                Users under 18 may not use the platform.
              </div>
            </section>
            
            <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 border border-[color:var(--border)] shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                3. User Accounts
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Users are responsible for:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Maintaining account security</li>
                <li>Protecting passwords</li>
                <li>Activities conducted under their account</li>
              </ul>
              <p className="text-[color:var(--muted)] text-sm italic">
                Users must provide accurate and updated information.
              </p>
            </section>
          </div>

          {/* 4, 5, 6 */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm space-y-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                4. Listings
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Hosts are solely responsible for:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Listing accuracy and pricing</li>
                <li>Property condition and availability</li>
                <li>Compliance with applicable laws</li>
              </ul>
              <p className="text-[color:var(--muted)] font-medium">Nestmate does not guarantee the accuracy of listing information.</p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                5. Booking Terms
              </h2>
              <p className="text-[color:var(--muted)] mb-3">A booking request does not guarantee accommodation until:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Payment is successfully processed</li>
                <li>Booking is confirmed</li>
              </ul>
              <p className="text-[color:var(--muted)]">Hosts remain responsible for honoring confirmed bookings.</p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                6. Payments
              </h2>
              <p className="text-[color:var(--muted)] leading-relaxed mb-4">
                Payments may be processed through third-party payment providers. Nestmate may collect platform fees, process booking-related payments, and issue refunds according to applicable policies.
              </p>
              <p className="text-[color:var(--muted)] italic text-sm">Payment disputes may require additional verification.</p>
            </div>
          </section>

          {/* 7. User Conduct */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight mb-6">
              7. User Conduct
            </h2>
            <p className="text-[color:var(--muted)] mb-6">Users must not:</p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                "Submit false information",
                "Impersonate another person",
                "Violate laws",
                "Harass other users",
                "Upload malicious software",
                "Circumvent platform security",
                "Use automated scraping tools"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-red-900 dark:text-red-300">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-[color:var(--foreground)] font-bold">Violation may result in immediate suspension or termination.</p>
          </section>

          {/* 8, 9, 10 */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm space-y-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                8. Reviews and Ratings
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Users may submit reviews only for genuine experiences. Nestmate reserves the right to:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                <li>Remove fraudulent reviews</li>
                <li>Remove abusive content</li>
                <li>Moderate ratings</li>
              </ul>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                9. Intellectual Property
              </h2>
              <p className="text-[color:var(--muted)] leading-relaxed mb-4">
                All platform content including logos, branding, software, and design elements belongs to Nestmate or its licensors. Users may not copy or redistribute platform materials without permission.
              </p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                10. Suspension and Termination
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Nestmate may suspend or terminate accounts for:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Fraudulent activity</li>
                <li>Policy violations or Abuse</li>
                <li>Security concerns or Legal requirements</li>
              </ul>
              <p className="text-[color:var(--muted)] italic text-sm">Suspension may occur without prior notice where necessary.</p>
            </div>
          </section>

          {/* 11, 12, 13 */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm space-y-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                11. Disclaimer
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Nestmate provides the platform "as is" and "as available." We do not guarantee:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Property quality or availability</li>
                <li>Host behavior or Guest behavior</li>
                <li>Accuracy of listings</li>
              </ul>
              <p className="text-[color:var(--foreground)] font-bold">Users interact at their own risk.</p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                12. Limitation of Liability
              </h2>
              <p className="text-[color:var(--muted)] mb-3">To the maximum extent permitted by law, Nestmate shall not be liable for:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                <li>Indirect damages or lost profits</li>
                <li>Property disputes or personal disputes between users</li>
                <li>Third-party service failures</li>
              </ul>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                13. Indemnification
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Users agree to indemnify and hold Nestmate harmless from claims arising from:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                <li>User content or Listings</li>
                <li>Violations of these Terms</li>
                <li>Legal disputes involving accommodations</li>
              </ul>
            </div>
          </section>

          {/* 14, 15 */}
          <section className="bg-[color:var(--brand)] text-[color:var(--brand-foreground)] rounded-[24px] p-8 sm:p-10 shadow-sm text-center space-y-8">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight mb-4">
                14. Governing Law
              </h2>
              <p className="opacity-90 leading-relaxed max-w-xl mx-auto">
                These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of the courts determined by Nestmate's registered business location.
              </p>
            </div>

            <div className="h-px w-16 mx-auto bg-[color:var(--brand-foreground)] opacity-20"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight mb-4">
                15. Contact
              </h2>
              <p className="opacity-90 mb-4">For legal inquiries:</p>
              <a href="mailto:legal@nestmate.in" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[color:var(--brand-foreground)] text-[color:var(--brand)] font-bold transition hover:opacity-90">
                legal@nestmate.in
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
