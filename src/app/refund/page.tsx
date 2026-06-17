import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Refund and cancellation policy for Nestmate platform",
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-[color:var(--background)]">
      {/* Header Section */}
      <div className="bg-[color:var(--brand)] text-[color:var(--brand-foreground)] py-20 px-6 sm:px-12 lg:px-24 rounded-b-[32px] sm:rounded-b-[64px]">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">Last Updated: June 2026</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Refund & Cancellation Policy
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
            This Refund & Cancellation Policy governs cancellations, refunds, and payment disputes made through Nestmate.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto max-w-4xl px-6 sm:px-12 py-16 sm:py-24">
        <div className="space-y-16">
          <section>
            <p className="text-lg leading-8 text-[color:var(--muted)]">
              Nestmate facilitates accommodation bookings between guests and hosts. Refund eligibility may vary depending on the circumstances of the booking.
            </p>
          </section>

          {/* 1. Overview & 2. Cancellation by Guest */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm space-y-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                1. Overview
              </h2>
              <p className="text-[color:var(--muted)] leading-relaxed">
                This Refund & Cancellation Policy governs cancellations, refunds, and payment disputes made through Nestmate. Nestmate facilitates accommodation bookings between guests and hosts. Refund eligibility may vary depending on the circumstances of the booking.
              </p>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                2. Cancellation by Guest
              </h2>
              <p className="text-[color:var(--muted)] mb-4">Guests may request cancellation through their Nestmate account.</p>
              
              <h3 className="text-lg font-semibold mb-2">Before Booking Confirmation</h3>
              <p className="text-[color:var(--muted)] mb-3">If payment has been made but the booking has not yet been confirmed:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-6">
                <li>Full refund may be issued.</li>
                <li>Payment gateway charges may be deducted where applicable.</li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">After Booking Confirmation</h3>
              <p className="text-[color:var(--muted)] mb-3">Refund eligibility depends on:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Time remaining before move-in date</li>
                <li>Host cancellation policy</li>
                <li>Applicable platform fees</li>
              </ul>
              
              <p className="text-[color:var(--muted)] mb-3">Nestmate may deduct:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                <li>Payment gateway charges</li>
                <li>Service fees</li>
                <li>Applicable taxes</li>
              </ul>
            </div>
          </section>

          {/* 3 & 4 */}
          <div className="grid sm:grid-cols-2 gap-6">
            <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 border border-[color:var(--border)] shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                3. Cancellation by Host
              </h2>
              <p className="text-[color:var(--muted)] mb-3">If a host cancels a confirmed booking:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Guest will receive a full refund of amounts paid through Nestmate.</li>
                <li>Repeated cancellations may result in penalties, listing suspension, or account review.</li>
              </ul>
            </section>
            
            <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 border border-[color:var(--border)] shadow-sm">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                4. Property Misrepresentation
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Guests may request review and potential refund if:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Property materially differs from listing description.</li>
                <li>Property is unavailable upon arrival.</li>
                <li>Listing contains fraudulent information.</li>
              </ul>
              <p className="text-[color:var(--muted)] text-sm italic">Nestmate reserves the right to investigate and determine eligibility. Evidence may include photos, videos, messages, and booking records.</p>
            </section>
          </div>

          {/* 5, 6, 7 */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm space-y-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                5. No-Show Policy
              </h2>
              <p className="text-[color:var(--muted)] mb-3">If a guest fails to occupy the accommodation without cancellation:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Refund may not be available.</li>
                <li>Host may retain booking charges according to platform rules.</li>
              </ul>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                6. Payment Failures
              </h2>
              <p className="text-[color:var(--muted)] mb-3">If a payment is deducted but booking is not created:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2 mb-4">
                <li>Users should contact support.</li>
                <li>Refunds are generally processed within 5–10 business days after verification.</li>
              </ul>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                7. Refund Processing Time
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Approved refunds are generally processed within <strong>5–10 business days</strong>. Actual timelines depend on:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                <li>Banks</li>
                <li>UPI providers</li>
                <li>Card issuers</li>
                <li>Payment gateways</li>
              </ul>
            </div>
          </section>

          {/* 8, 9 */}
          <section className="bg-[color:var(--surface-strong)] rounded-[24px] p-8 sm:p-10 border border-[color:var(--border)] shadow-sm space-y-10">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                8. Chargebacks
              </h2>
              <p className="text-[color:var(--muted)] mb-4">Users should contact Nestmate before initiating chargebacks.</p>
              <div className="p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium">
                Fraudulent chargebacks may result in account suspension, investigation, or legal action where appropriate.
              </div>
            </div>

            <div className="h-px w-full bg-[color:var(--border)]"></div>

            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight mb-4">
                9. Non-Refundable Situations
              </h2>
              <p className="text-[color:var(--muted)] mb-3">Refunds may be denied where:</p>
              <ul className="list-disc pl-5 text-[color:var(--muted)] space-y-2">
                <li>False claims are submitted</li>
                <li>Platform rules are violated</li>
                <li>Fraudulent activity is detected</li>
                <li>Required verification information is not provided</li>
              </ul>
            </div>
          </section>

          {/* 10 */}
          <section className="bg-[color:var(--brand)] text-[color:var(--brand-foreground)] rounded-[24px] p-8 sm:p-10 shadow-sm text-center space-y-8">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight mb-4">
                10. Contact
              </h2>
              <p className="opacity-90 mb-4">Refund requests should be submitted through:</p>
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
