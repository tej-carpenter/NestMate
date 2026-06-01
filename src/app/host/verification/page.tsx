import { Card } from "@/components/ui/card";
import { RouteAccessGate } from "@/components/auth/route-access-gate";

export default function HostVerificationPage() {
  return (
    <RouteAccessGate
      variant="creator"
      title="Sign in as a user to access verification"
      description="User and admin accounts can complete verification before publishing listings."
      actionLabel="Go to login"
      actionHref="/auth/login"
    >
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">Host verification</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-slate-950">Aadhaar KYC and identity review</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">Wire this page to your KYC provider and Supabase role checks before enabling listing publication for hosts.</p>
        </Card>
      </main>
    </RouteAccessGate>
  );
}