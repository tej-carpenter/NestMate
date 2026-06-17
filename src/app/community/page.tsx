import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Standards",
  description: "Community standards and content policy for Nestmate",
};

export default function CommunityStandardsPage() {
  return (
    <div className="bg-[color:var(--background)]">
      {/* Header Section */}
      <div className="bg-[color:var(--brand)] text-[color:var(--brand-foreground)] py-20 px-6 sm:px-12 lg:px-24 rounded-b-[32px] sm:rounded-b-[64px]">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">Last Updated: June 2026</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Community Standards & Content Policy
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
            Nestmate is built on trust, transparency, and safety. All users must follow these standards.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto max-w-4xl px-6 sm:px-12 py-16 sm:py-24">
        <div className="space-y-16">
          
          {/* 1, 2, 3 */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm space-y-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                1. Purpose
              </h2>
              <p className="text-[color:var(--muted)] leading-relaxed">
                Nestmate is built on trust, transparency, and safety. All users must follow these standards.
              </p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                2. Respectful Conduct
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Users must not:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                <li>Harass others</li>
                <li>Threaten others</li>
                <li>Intimidate others</li>
                <li>Use abusive language</li>
                <li>Discriminate against others</li>
              </ul>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                3. Prohibited Content
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Users may not post:</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                {["Fraudulent information", "Fake listings", "Fake reviews", "Spam", "Malware", "Illegal content", "Copyright-infringing content"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[color:var(--muted)]">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4 & 5 */}
          <div className="grid sm:grid-cols-2 gap-6">
            <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 border border-[color:var(--border)] shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                4. Chat and Messaging Rules
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Users may not use messaging features for:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Harassment or Scams</li>
                <li>Illegal activity or Threats</li>
                <li>Impersonation</li>
              </ul>
              <p className="text-[color:var(--muted)] text-sm italic">Nestmate may review reported conversations for safety purposes.</p>
            </section>
            
            <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 border border-[color:var(--border)] shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                5. Reviews and Ratings
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Reviews must:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Reflect genuine experiences.</li>
                <li>Be truthful and relevant to the booking.</li>
              </ul>
              <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium">
                Purchased reviews, fake ratings, and review extortion are prohibited.
              </div>
            </section>
          </div>

          {/* 6, 7 */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm space-y-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                6. Images and Media
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Uploaded content must not contain:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                <li>Illegal material or Explicit sexual content</li>
                <li>Violent content or Hate speech</li>
                <li>Copyright violations</li>
              </ul>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                7. Fraud Prevention
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Activities considered fraudulent include:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Fake bookings and Fake payments</li>
                <li>Identity misrepresentation</li>
                <li>Account sharing and Listing scams</li>
              </ul>
              <p className="text-[color:var(--foreground)] font-bold text-sm">Accounts involved may be suspended immediately.</p>
            </div>
          </section>

          {/* 8, 9, 10 */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm space-y-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                8. Reporting Violations
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Users may report:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Fraud or Harassment</li>
                <li>Fake listings or Policy violations</li>
              </ul>
              <p className="text-[color:var(--muted)] text-sm italic">Nestmate may investigate reports and take action.</p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                9. Enforcement Actions
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Nestmate may:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                <li>Remove content or reviews</li>
                <li>Suspend accounts or archive listings</li>
                <li>Permanently ban users</li>
              </ul>
              <p className="text-[color:var(--muted)] mt-3">depending on severity.</p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                10. Repeat Violations
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Repeated violations may result in:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                <li>Permanent account termination</li>
                <li>Listing removal</li>
                <li>Legal reporting where required</li>
              </ul>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
