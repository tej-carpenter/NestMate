import { Card } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Card className="p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Analytics panel</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-slate-950 dark:text-slate-50">Track the search-to-booking funnel</h1>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">Monitor search activity, payment failures, retention, and conversion trends from a single place.</p>
      </Card>
    </main>
  );
}