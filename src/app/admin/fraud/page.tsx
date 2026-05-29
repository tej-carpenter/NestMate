import { Card } from "@/components/ui/card";

export default function FraudPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Card className="p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">Fraud moderation</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-slate-950">Inspect suspicious listings and user reports</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">Feed moderation decisions into your audit log, trust score logic, and reporting pipeline.</p>
      </Card>
    </main>
  );
}