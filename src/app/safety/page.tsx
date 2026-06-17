import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accommodation Safety Disclaimer",
  description: "Accommodation safety disclaimer for Nestmate",
};

export default function SafetyDisclaimerPage() {
  return (
    <div className="bg-[color:var(--background)]">
      {/* Header Section */}
      <div className="bg-[color:var(--brand)] text-[color:var(--brand-foreground)] py-20 px-6 sm:px-12 lg:px-24 rounded-b-[32px] sm:rounded-b-[64px]">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">Last Updated: June 2026</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Accommodation Safety Disclaimer
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
            Important information regarding property safety, platform role, and user responsibilities on Nestmate.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto max-w-4xl px-6 sm:px-12 py-16 sm:py-24">
        <div className="space-y-16">
          
          {/* 1 & 2 */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm space-y-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                1. Purpose
              </h2>
              <p className="text-[color:var(--muted)] leading-relaxed mb-4">
                Nestmate is an online accommodation marketplace that connects guests with hosts offering accommodations such as PGs, Hostels, Rooms, Shared rooms, Beds, Lodges, Apartments, and other residential accommodations.
              </p>
              <div className="p-4 bg-[color:var(--background)] border border-[color:var(--border)] rounded-lg">
                <p className="text-[color:var(--foreground)] font-medium text-sm">
                  Nestmate does not own, operate, manage, lease, maintain, inspect, or control the accommodations listed on the platform unless explicitly stated otherwise.
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                2. Marketplace Role
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Nestmate acts solely as a technology platform facilitating:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Property discovery</li>
                <li>Communication between users</li>
                <li>Booking requests</li>
                <li>Payment processing support</li>
              </ul>
              <p className="text-[color:var(--muted)] text-sm italic">
                The actual accommodation experience is provided by the host. Hosts are independent parties and are not employees, representatives, agents, or partners of Nestmate.
              </p>
            </div>
          </section>

          {/* 3. No Safety Guarantee */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight mb-4">
              3. No Safety Guarantee
            </h2>
            <p className="text-[color:var(--muted)] mb-4">
              While Nestmate may implement verification procedures and moderation measures, Nestmate does not guarantee:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                "Property safety", "Building condition", "Fire safety compliance",
                "Structural integrity", "Security arrangements", "Neighborhood safety",
                "Host behavior", "Guest behavior", "Accuracy of safety claims"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[color:var(--muted)]">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-[color:var(--foreground)] font-bold">
              Users assume responsibility for evaluating accommodations before and during occupancy.
            </p>
          </section>

          {/* 4 & 5 */}
          <div className="grid sm:grid-cols-2 gap-6">
            <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 border border-[color:var(--border)] shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                4. User Responsibility
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Guests are encouraged to:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Review listing details carefully.</li>
                <li>Verify property information.</li>
                <li>Read reviews and ratings.</li>
                <li>Communicate with hosts before booking.</li>
                <li>Visit or inspect accommodations when feasible.</li>
                <li>Exercise reasonable judgment and caution.</li>
              </ul>
              <p className="text-[color:var(--muted)] text-sm italic">Guests should not rely solely on information displayed on the platform.</p>
            </section>
            
            <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 border border-[color:var(--border)] shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                5. Host Responsibility
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Hosts are solely responsible for:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Property maintenance and Safety standards</li>
                <li>Legal compliance and Occupancy compliance</li>
                <li>Utility availability</li>
                <li>Hygiene and cleanliness</li>
                <li>Security arrangements and Emergency preparedness</li>
              </ul>
              <p className="text-[color:var(--muted)] text-sm italic">Hosts must ensure listings accurately represent the accommodation.</p>
            </section>
          </div>

          {/* 6, 7 */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm space-y-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                6. Verification Disclaimer
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Nestmate may provide indicators such as verified account status, identity verification status, review scores, and NestScore ratings. These indicators do not constitute a guarantee of:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Safety</li>
                <li>Reliability</li>
                <li>Legality</li>
                <li>Suitability or Quality</li>
              </ul>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                7. Emergencies
              </h2>
              <p className="text-[color:var(--muted)] mb-3">In case of emergencies, users should immediately contact:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Local emergency services or Police authorities</li>
                <li>Medical services or Fire services</li>
                <li>Appropriate government agencies</li>
              </ul>
              <p className="text-[color:var(--foreground)] font-bold text-sm">Nestmate should not be relied upon as an emergency response service.</p>
            </div>
          </section>

          {/* 8, 9, 10, 11 */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm space-y-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                8. Personal Property
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Nestmate is not responsible for:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Lost property</li>
                <li>Stolen property</li>
                <li>Damaged property</li>
                <li>Property left behind at accommodations</li>
              </ul>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                9. Personal Interactions
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Users acknowledge that interactions occur at their own risk. Nestmate does not guarantee user identity, conduct, intentions, or future behavior.</p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                10. Health and Hygiene
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Nestmate does not independently inspect accommodations for sanitation, cleanliness, pest control, air quality, water quality, or food safety. Any representations regarding these matters are made by hosts.</p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                11. Limitation of Liability
              </h2>
              <p className="text-[color:var(--muted)] mb-3">To the fullest extent permitted by applicable law, Nestmate shall not be liable for:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                <li>Injury, Death, or Illness</li>
                <li>Property damage, Theft, or Criminal acts</li>
                <li>Accidents or Disputes between users</li>
                <li>Accommodation-related losses</li>
              </ul>
            </div>
          </section>

          {/* 12, 13, 14 */}
          <section className="bg-[color:var(--brand)] text-[color:var(--brand-foreground)] rounded-[24px] p-8 sm:p-10 shadow-sm text-center space-y-8">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight mb-4">
                12 & 13. Reporting & Acknowledgement
              </h2>
              <p className="opacity-90 leading-relaxed max-w-xl mx-auto mb-4">
                Users are encouraged to report unsafe properties, fraudulent listings, and harassment. By using Nestmate, you acknowledge that Nestmate is a marketplace and not an accommodation provider, and that you assume the risks associated with accommodations.
              </p>
            </div>

            <div className="h-px w-16 mx-auto bg-[color:var(--brand-foreground)] opacity-20"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight mb-4">
                14. Contact
              </h2>
              <p className="opacity-90 mb-4">For safety-related concerns, reports, or questions:</p>
              <a href="mailto:safety@nestmate.in" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[color:var(--brand-foreground)] text-[color:var(--brand)] font-bold transition hover:opacity-90">
                safety@nestmate.in
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
