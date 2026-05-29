import { Card } from "@/components/ui/card";

export default function HostDashboardPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">Host dashboard</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-slate-950">Track bookings, NestScore, and payouts</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">This area is reserved for host analytics, booking management, listing moderation, and payout reconciliation.</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Modules</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li>Listing performance and conversion.</li>
            <li>Inbox for enquiries and chats.</li>
            <li>Payout history and reconciliation.</li>
          </ul>
        </Card>
      </div>
    </main>
  );
}