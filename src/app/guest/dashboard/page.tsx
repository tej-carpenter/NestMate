import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GuestDashboardPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.88fr]">
        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Guest dashboard</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-slate-950 dark:text-slate-50">Browse listings before creating a full account</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">Guest access is read-only. Create a user account to unlock bookings, payments, and wallet history.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/search">Search properties</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/map">Open map</Link>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Next steps</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
            <p>1. Shortlist a property.</p>
            <p>2. Create a user account.</p>
            <p>3. Continue to booking and payment.</p>
          </div>
        </Card>
      </div>
    </main>
  );
}