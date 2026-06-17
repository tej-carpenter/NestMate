import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Nestmate platform",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[color:var(--background)]">
      {/* Header Section */}
      <div className="bg-[color:var(--brand)] text-[color:var(--brand-foreground)] py-20 px-6 sm:px-12 lg:px-24 rounded-b-[32px] sm:rounded-b-[64px]">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">Last Updated: June 2026</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Privacy Policy
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
            Welcome to Nestmate. We respect your privacy and are committed to protecting your personal information.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto max-w-4xl px-6 sm:px-12 py-16 sm:py-24">
        <div className="space-y-16">
          <section>
            <p className="text-lg leading-8 text-[color:var(--muted)]">
              This Privacy Policy explains how we collect, use, store, and disclose information when you use our website, services, applications, and related products. By accessing or using Nestmate, you agree to this Privacy Policy.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight mb-8">
              1. Information We Collect
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">A. Account Information</h3>
                <p className="text-[color:var(--muted)] mb-3">When creating an account, we may collect:</p>
                <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number (optional)</li>
                  <li>Profile photograph</li>
                  <li>Profile information</li>
                </ul>
              </div>

              <div className="h-px w-full bg-[color:var(--border)]"></div>

              <div>
                <h3 className="text-lg font-semibold mb-3">B. Listing Information</h3>
                <p className="text-[color:var(--muted)] mb-3">When hosts create listings, we may collect:</p>
                <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                  <li>Property title and description</li>
                  <li>Address, city, and locality</li>
                  <li>Property photographs</li>
                  <li>Pricing details and amenities</li>
                  <li>Availability information</li>
                </ul>
              </div>

              <div className="h-px w-full bg-[color:var(--border)]"></div>

              <div>
                <h3 className="text-lg font-semibold mb-3">C. Booking & Communications</h3>
                <p className="text-[color:var(--muted)] mb-3">When users make bookings or communicate, we may collect:</p>
                <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                  <li>Booking dates and guest details</li>
                  <li>Payment status and transaction records</li>
                  <li>Messages exchanged through Nestmate</li>
                  <li>Support requests, feedback, and reviews</li>
                </ul>
              </div>

              <div className="h-px w-full bg-[color:var(--border)]"></div>

              <div>
                <h3 className="text-lg font-semibold mb-3">D. Technical Information</h3>
                <p className="text-[color:var(--muted)] mb-3">We automatically collect:</p>
                <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                  <li>IP address and browser information</li>
                  <li>Device and session information</li>
                  <li>Log data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. How We Use Information */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight mb-6">
              2. How We Use Information
            </h2>
            <p className="text-[color:var(--muted)] mb-4">We use collected information to:</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Create and manage accounts",
                "Display listings and process bookings",
                "Facilitate user communication",
                "Prevent fraud and abuse",
                "Improve platform performance",
                "Provide customer support",
                "Comply with legal obligations",
                "Process payments"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[color:var(--background)] border border-[color:var(--border)]">
                  <div className="h-2 w-2 rounded-full bg-[color:var(--accent)]"></div>
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 3 & 4. Third-party & Payments */}
          <div className="grid sm:grid-cols-2 gap-6">
            <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 border border-[color:var(--border)] shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                3. Payment Processing
              </h2>
              <p className="text-[color:var(--muted)] leading-relaxed">
                Nestmate does not store full payment card information. Payments are processed through third-party payment providers including <strong>Razorpay</strong>. Your payment information is governed by the payment provider's privacy policy.
              </p>
            </section>
            
            <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 border border-[color:var(--border)] shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                4. Third-Party Services
              </h2>
              <p className="text-[color:var(--muted)] mb-4">We use third-party service providers including:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-1">
                <li>Supabase (Auth & DB)</li>
                <li>Razorpay (Payments)</li>
                <li>Cloudinary (Image Storage)</li>
                <li>Google Maps (Location)</li>
              </ul>
            </section>
          </div>

          {/* 5, 6, 7 */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm space-y-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                5. Reviews and User Content
              </h2>
              <p className="text-[color:var(--muted)] leading-relaxed">
                Any content you voluntarily publish, including reviews, ratings, listing descriptions, and images, may be publicly visible on the platform.
              </p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                6. Data Retention
              </h2>
              <p className="text-[color:var(--muted)] leading-relaxed mb-4">
                We retain information only for as long as necessary to provide services, resolve disputes, enforce agreements, and comply with legal obligations. Archived listings may be retained even after removal from public visibility.
              </p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                7. Security
              </h2>
              <p className="text-[color:var(--muted)] leading-relaxed">
                We implement reasonable security measures including authentication controls, access restrictions, database security, and encryption where appropriate. However, no online service can guarantee absolute security.
              </p>
            </div>
          </section>

          {/* 8, 9, 10, 11 */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm space-y-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                8. User Rights
              </h2>
              <p className="text-[color:var(--muted)] mb-3">You may:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                <li>Access your account information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your account</li>
                <li>Request removal of personal information where legally applicable</li>
              </ul>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-[color:var(--muted)] leading-relaxed">
                Nestmate is intended for users who are at least 18 years old. We do not knowingly collect information from minors.
              </p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                10. Cookies and Analytics
              </h2>
              <p className="text-[color:var(--muted)] leading-relaxed">
                Nestmate may use cookies, session storage, and analytics tools to improve functionality and user experience. You may disable cookies through your browser settings, though some features may not function properly.
              </p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                11. Account Deletion
              </h2>
              <p className="text-[color:var(--muted)] leading-relaxed">
                Users may request account deletion. Certain records including transaction history, legal compliance records, and fraud investigation records may be retained as required by law.
              </p>
            </div>
          </section>

          {/* 12, 13 */}
          <section className="bg-[color:var(--brand)] text-[color:var(--brand-foreground)] rounded-[24px] p-8 sm:p-10 shadow-sm text-center space-y-8">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight mb-4">
                12. Changes to This Policy
              </h2>
              <p className="opacity-90 leading-relaxed max-w-xl mx-auto">
                We may update this Privacy Policy from time to time. Continued use of Nestmate after updates constitutes acceptance of the revised policy.
              </p>
            </div>

            <div className="h-px w-16 mx-auto bg-[color:var(--brand-foreground)] opacity-20"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight mb-4">
                13. Contact Us
              </h2>
              <p className="opacity-90 mb-4">For privacy-related questions, contact:</p>
              <a href="mailto:support@nestmate.in" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[color:var(--brand-foreground)] text-[color:var(--brand)] font-bold transition hover:opacity-90">
                support@nestmate.in
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
