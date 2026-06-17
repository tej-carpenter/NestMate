import { RouteAccessGate } from "@/components/auth/route-access-gate";
import { HostDashboardClient } from "@/components/host/host-dashboard-client";

export default function HostDashboardPage() {
  return (
    <RouteAccessGate
      variant="creator"
      title="Sign in as a user to open the host dashboard"
      description="Only user and admin accounts can manage listings, bookings, and payout workflows."
      actionLabel="Go to login"
      actionHref="/auth/login"
    >
      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--foreground)]">Host Dashboard</h1>
          <p className="mt-2 text-[15px] text-[color:var(--muted)]">Track bookings, performance, and manage your properties.</p>
        </div>

        <HostDashboardClient />
      </main>
    </RouteAccessGate>
  );
}