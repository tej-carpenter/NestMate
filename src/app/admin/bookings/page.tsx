import { RouteAccessGate } from "@/components/auth/route-access-gate";
import { AdminBookingsClient } from "@/components/admin/admin-bookings-client";

export default function AdminBookingsPage() {
  return (
    <RouteAccessGate
      variant="moderator"
      title="Admin Access Required"
      description="You must be an administrator to view system-wide bookings."
      actionLabel="Return to home"
      actionHref="/"
    >
      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--foreground)]">System Bookings</h1>
          <p className="mt-2 text-[15px] text-[color:var(--muted)]">Comprehensive view of all transactions and bookings.</p>
        </div>

        <AdminBookingsClient />
      </main>
    </RouteAccessGate>
  );
}
