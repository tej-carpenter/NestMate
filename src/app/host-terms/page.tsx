import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Host Terms & Listing Policy",
  description: "Terms and policies for hosts creating listings on Nestmate",
};

export default function HostTermsPage() {
  return (
    <div className="bg-[color:var(--background)]">
      {/* Header Section */}
      <div className="bg-[color:var(--brand)] text-[color:var(--brand-foreground)] py-20 px-6 sm:px-12 lg:px-24 rounded-b-[32px] sm:rounded-b-[64px]">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">Last Updated: June 2026</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Host Terms & Listing Policy
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
            These Host Terms govern all property listings published on Nestmate. By creating a listing, you agree to these rules.
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
                These Host Terms govern all property listings published on Nestmate. By creating a listing, you agree to these rules.
              </p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                2. Listing Ownership
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Hosts must:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Own the property, OR</li>
                <li>Have legal authority to rent, lease, or manage it.</li>
              </ul>
              <p className="text-[color:var(--muted)] text-sm italic">Hosts may be required to provide verification documents.</p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                3. Accurate Information
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Hosts must ensure:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Photos are authentic.</li>
                <li>Pricing is accurate.</li>
                <li>Amenities are accurate.</li>
                <li>Availability is accurate.</li>
                <li>Property descriptions are truthful.</li>
              </ul>
              <div className="p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium">
                Misleading information is prohibited.
              </div>
            </div>
          </section>

          {/* 4. Prohibited Listings */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight mb-6">
              4. Prohibited Listings
            </h2>
            <p className="text-[color:var(--muted)] mb-6">The following may not be listed:</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Illegal accommodations",
                "Fraudulent properties",
                "Properties violating local laws",
                "Temporary listings intended to scam users",
                "Duplicate listings",
                "Fake addresses"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[color:var(--background)] border border-[color:var(--border)] text-[color:var(--muted)]">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 5 & 6 */}
          <div className="grid sm:grid-cols-2 gap-6">
            <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 border border-[color:var(--border)] shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                5. Pricing Rules
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Hosts must:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Display accurate rent amounts.</li>
                <li>Clearly disclose deposits.</li>
                <li>Clearly disclose recurring fees.</li>
              </ul>
              <p className="text-[color:var(--foreground)] font-bold text-sm">Hidden charges are prohibited.</p>
            </section>
            
            <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 border border-[color:var(--border)] shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                6. Availability Management
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Hosts must:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Maintain accurate availability.</li>
                <li>Remove unavailable properties promptly.</li>
                <li>Respond to booking requests reasonably.</li>
              </ul>
            </section>
          </div>

          {/* 7, 8, 9, 10 */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm space-y-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                7. Host Verification
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Nestmate may request:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Government-issued identification</li>
                <li>Ownership proof</li>
                <li>Lease documentation</li>
                <li>Utility bills</li>
                <li>Other verification materials</li>
              </ul>
              <p className="text-[color:var(--muted)] text-sm italic">Failure to comply may result in listing removal.</p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                8. Booking Responsibilities
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Hosts are responsible for:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Honoring confirmed bookings.</li>
                <li>Maintaining safe accommodations.</li>
                <li>Providing access as described.</li>
              </ul>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                9. Safety Obligations
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Hosts must ensure accommodations comply with applicable laws regarding:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Safety and Occupancy</li>
                <li>Fire regulations</li>
                <li>Local housing requirements</li>
              </ul>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                10. Listing Removal
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Nestmate may remove or archive listings that:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                <li>Violate policies</li>
                <li>Receive repeated complaints</li>
                <li>Are suspected of fraud</li>
                <li>Pose safety risks</li>
              </ul>
            </div>
          </section>

          {/* 11 & 12 */}
          <div className="grid sm:grid-cols-2 gap-6">
            <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 border border-[color:var(--border)] shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                11. Fees and Commissions
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Nestmate may charge:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Listing fees</li>
                <li>Booking commissions</li>
                <li>Service charges</li>
              </ul>
              <p className="text-[color:var(--muted)] text-sm italic">Applicable fees will be communicated separately.</p>
            </section>
            
            <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 border border-[color:var(--border)] shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                12. Liability
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Hosts remain solely responsible for:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                <li>Property condition</li>
                <li>Tenant disputes</li>
                <li>Legal compliance</li>
                <li>Accuracy of information</li>
              </ul>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
