import { RouteAccessGate } from "@/components/auth/route-access-gate";
import { HostBookingsClient } from "@/components/host/host-bookings-client";

export default function HostBookingsPage() {
  return (
    <RouteAccessGate
      variant="creator"
      title="Sign in as a user to view your bookings"
      description="Only host accounts can manage their bookings."
      actionLabel="Go to login"
      actionHref="/auth/login"
    >
      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--foreground)]">Your Bookings</h1>
          <p className="mt-2 text-[15px] text-[color:var(--muted)]">View and manage all bookings across your listings.</p>
        </div>

        <HostBookingsClient />
      </main>
    </RouteAccessGate>
  );
}
