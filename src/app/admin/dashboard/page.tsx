"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { AvailabilityBadge } from "@/components/listings/availability-badge";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { RouteAccessGate } from "@/components/auth/route-access-gate";
import { formatDateTime, formatRupee } from "@/lib/format";
import { getListingStatusLabel, isPublicListingStatus } from "@/lib/listings/status";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [traffic, setTraffic] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  void refreshToken;

  useEffect(() => {
    let active = true;

    async function loadData() {
      const supabase = createSupabaseBrowserClient();
      
      const [
        { data: dbListings },
        { data: dbUsers },
        { data: dbBookings },
        { data: dbTransactions },
        { data: dbSettings },
      ] = await Promise.all([
        supabase.from("listings").select("*"),
        supabase.from("users").select("*"),
        supabase.from("bookings").select("*"),
        supabase.from("transactions").select("*"),
        (supabase.from("platform_settings").select("*") as any).limit(1).maybeSingle(),
      ]);
      
      if (active) {
        setListings(dbListings?.map(l => ({
          id: l.id,
          title: l.title,
          slug: l.slug ?? l.id,
          kind: l.space_type,
          city: l.city,
          locality: l.locality,
          address: l.address,
          description: l.description,
          status: l.status,
          moderationState: "approved",
          totalUnits: l.available_units ?? 1,
          availableUnits: l.available_units ?? 1,
          amenities: l.amenities ?? [],
        })) as any || []);
        
        setUsers(dbUsers as any || []);
        setBookings(dbBookings as any || []);
        
        const txs = dbTransactions || [];
        setTransactions(txs as any);
        setPayments(txs.filter(t => t.transaction_type === "payment") as any);
        setPayouts(txs.filter(t => t.transaction_type === "payout") as any);
        setTraffic([]);
        setSettings(dbSettings);
        setMounted(true);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [refreshToken]);

  if (!mounted) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card className="h-40 animate-pulse p-6" />
          <div className="grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="h-32 animate-pulse p-5" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
            <Card className="h-44 animate-pulse p-6" />
            <Card className="h-44 animate-pulse p-6" />
          </div>
        </div>
      </main>
    );
  }

  const approvedListings = listings.filter((listing) => isPublicListingStatus(listing.status, listing.moderationState));
  const pendingListings = listings.filter((listing) => listing.status === "pending_review");
  const rejectedListings = listings.filter((listing) => listing.status === "rejected");
  const expiredListings = listings.filter((listing) => listing.status === "expired");
  const archivedListings = listings.filter((listing) => listing.status === "archived");
  const suspendedListings = listings.filter((listing) => listing.moderationState === "suspended");
  const bookedListingIds = new Set(bookings.filter((booking) => booking.status === "confirmed").map((booking) => booking.listingId));
  const totalVisitors = new Set(traffic.map((event) => event.visitorId)).size;
  const pendingPayouts = payouts.filter((payout) => payout.status === "pending");
  const routeCounts = traffic.reduce<Record<string, number>>((acc, event) => {
    acc[event.route] = (acc[event.route] ?? 0) + 1;
    return acc;
  }, {});
  const listingTypeCounts = listings.reduce<Record<string, number>>((acc, listing) => {
    acc[listing.kind] = (acc[listing.kind] ?? 0) + 1;
    return acc;
  }, {});

  const topRoutes = Object.entries(routeCounts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);

  function refresh() {
    setRefreshToken((value) => value + 1);
  }

  async function approveListing(listingId: string) {
    const supabase = createSupabaseBrowserClient();
    await (supabase.from("listings") as any).update({ status: "approved" }).eq("id", listingId);
    refresh();
  }

  async function rejectListing(listingId: string) {
    const reason = window.prompt("Enter the rejection reason")?.trim();
    if (!reason) return;
    const supabase = createSupabaseBrowserClient();
    await (supabase.from("listings") as any).update({ status: "rejected" }).eq("id", listingId);
    refresh();
  }

  async function suspendListing(listingId: string) {
    const reason = window.prompt("Enter the suspension reason")?.trim();
    const supabase = createSupabaseBrowserClient();
    await (supabase.from("listings") as any).update({ status: "archived" }).eq("id", listingId);
    refresh();
  }

  async function restoreListing(listingId: string) {
    const reason = window.prompt("Enter the restore note")?.trim();
    const supabase = createSupabaseBrowserClient();
    await (supabase.from("listings") as any).update({ status: "approved" }).eq("id", listingId);
    refresh();
  }

  async function archiveListing(listingId: string) {
    const reason = window.prompt("Enter the archive reason")?.trim();
    const supabase = createSupabaseBrowserClient();
    await (supabase.from("listings") as any).update({ status: "archived" }).eq("id", listingId);
    refresh();
  }

  async function renewExpiredListing(listingId: string) {
    const supabase = createSupabaseBrowserClient();
    await (supabase.from("listings") as any).update({ status: "approved" }).eq("id", listingId);
    refresh();
  }

  async function removeListing(listingId: string) {
    const confirm = window.confirm("Are you sure you want to delete this listing permanently?");
    if (!confirm) return;
    const supabase = createSupabaseBrowserClient();
    await (supabase.from("listings") as any).delete().eq("id", listingId);
    refresh();
  }

  async function markPayoutPaid(payoutId: string) {
    const supabase = createSupabaseBrowserClient();
    await (supabase.from("transactions") as any).update({ status: "paid" }).eq("id", payoutId);
    refresh();
  }

  async function markPayoutFailed(payoutId: string) {
    const supabase = createSupabaseBrowserClient();
    await (supabase.from("transactions") as any).update({ status: "failed" }).eq("id", payoutId);
    refresh();
  }

  async function toggleRazorpay() {
    const supabase = createSupabaseBrowserClient();
    if (!settings) return;
    const newValue = !settings.razorpay_enabled;
    const { error } = await (supabase.from("platform_settings") as any).update({ razorpay_enabled: newValue }).eq("id", settings.id);
    if (error) {
      toast.error(error.message || "Failed to update settings");
      return;
    }
    setSettings((prev: any) => ({ ...prev, razorpay_enabled: newValue }));
    toast.success("Settings updated");
  }

  return (
    <RouteAccessGate
      variant="moderator"
      title="Admin access required"
      description="The admin dashboard is limited to moderators who can review listings and platform activity."
      actionLabel="Go to login"
      actionHref="/auth/login"
    >
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Admin dashboard</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-slate-950 dark:text-slate-50">Monitoring, moderation, and inventory health</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">Track users, traffic, bookings, payment states, and listing status across hotels, PGs, hostels, rooms, and bedspaces.</p>
          <div className="mt-5 flex gap-3 flex-wrap">
            <Button asChild>
              <Link href="/admin/bookings">View Bookings</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/payouts">Open payout operations</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/archived-properties">Archived properties</Link>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Platform Settings</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Global toggles for platform functionality.</p>
          <div className="mt-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-950 dark:text-slate-50">Alternate Payment Method (UPI)</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Allow users to pay via the universal UPI ID.</p>
            </div>
            <Button onClick={() => void toggleRazorpay()} variant={settings?.razorpay_enabled ? "default" : "outline"} className={settings?.razorpay_enabled ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}>
              {settings?.razorpay_enabled ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </Card>



        <div className="grid gap-4 lg:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
          {listings.map((property) => (
            <Card key={property.id} className="min-h-72 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{property.city}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{property.title}</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{property.locality}</p>
                </div>
                <Chip className="!rounded-full px-3 py-1 text-xs font-semibold">{getListingStatusLabel(property.status, property.moderationState)}</Chip>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{property.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {property.amenities?.map((amenity: string, index: number) => (
                  <Chip key={`${amenity}-${index}`} className="!rounded-full px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {amenity}
                  </Chip>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                Units: <AvailabilityBadge availableUnits={property.availableUnits ?? 0} />
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row flex-wrap">
                <Button asChild variant="outline" className="sm:flex-1 min-w-[100px]">
                  <Link href={`/host/listings/new?edit=${property.slug}`}>Edit</Link>
                </Button>
                {property.status !== "approved" ? (
                  <Button variant="outline" className="sm:flex-1 min-w-[100px] border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50" onClick={() => void approveListing(property.id)}>
                    Approve
                  </Button>
                ) : null}
                {property.status !== "rejected" && property.status !== "approved" ? (
                  <Button variant="outline" className="sm:flex-1 min-w-[100px]" onClick={() => void rejectListing(property.id)}>
                    Reject
                  </Button>
                ) : null}
                {property.status === "archived" ? (
                  <Button variant="outline" className="sm:flex-1 min-w-[100px]" onClick={() => void restoreListing(property.id)}>
                    Restore
                  </Button>
                ) : null}
                {property.status === "approved" ? (
                  <Button variant="outline" className="sm:flex-1 min-w-[100px]" onClick={() => void suspendListing(property.id)}>
                    Suspend
                  </Button>
                ) : null}
                {property.status !== "archived" ? (
                  <Button variant="outline" className="sm:flex-1 min-w-[100px]" onClick={() => void archiveListing(property.id)}>
                    Archive
                  </Button>
                ) : null}
                {property.status === "expired" ? (
                  <Button variant="outline" className="sm:flex-1 min-w-[100px]" onClick={() => void renewExpiredListing(property.id)}>
                    Renew
                  </Button>
                ) : null}
                <Button variant="outline" className="sm:flex-1 min-w-[100px] text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={() => void removeListing(property.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <Card className="p-6 lg:self-start">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Transactions</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Guest-to-Nestmate payment ledger for reconciliation and payout readiness.</p>
            <div className="mt-4 space-y-3">
              {transactions.length > 0 ? (
                transactions.slice(0, 8).map((transaction) => (
                  <div key={transaction.id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{formatRupee(transaction.amount)}</p>
                      <Chip className="!rounded-full px-3 py-1 text-xs font-semibold">{transaction.status}</Chip>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Booking: {transaction.booking_id}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Host: {transaction.host_phone ?? "Unassigned"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Updated: {formatDateTime(transaction.updated_at || transaction.created_at)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">No transaction records yet.</p>
              )}
            </div>
          </Card>

          <Card className="p-6 lg:self-start">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Pending payouts</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Manual host payout queue. Automation can replace status transitions later without changing domain records.</p>
            <div className="mt-4 space-y-3">
              {pendingPayouts.length > 0 ? (
                pendingPayouts.map((payout) => (
                  <div key={payout.id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{formatRupee(payout.amount)}</p>
                      <Chip className="!rounded-full px-3 py-1 text-xs font-semibold">{payout.status}</Chip>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Host: {payout.host_phone}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Created: {formatDateTime(payout.created_at)}</p>
                    <div className="mt-3">
                      <Button className="h-10" onClick={() => void markPayoutPaid(payout.id)}>Mark as completed</Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">No pending payouts.</p>
              )}
            </div>
          </Card>
        </div>



        <div className="grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
          {[
            ["Total users", String(users.length)],
            ["Unique visitors", String(totalVisitors)],
            ["Total bookings", String(bookings.length)],
            ["Total payments", String(payments.length)],
            ["Tracked transactions", String(transactions.length)],
            ["Payout records", String(payouts.length)],
            ["Pending payouts", String(pendingPayouts.length)],
            ["Total listings", String(listings.length)],
            ["Booked listings", String(bookedListingIds.size)],
            ["Approved listings", String(approvedListings.length)],
            ["Pending review", String(pendingListings.length)],
            ["Rejected", String(rejectedListings.length)],
            ["Expired", String(expiredListings.length)],
            ["Archived", String(archivedListings.length)],
            ["Suspended", String(suspendedListings.length)],
          ].map(([label, value]) => (
            <Card key={label} className="min-h-32 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">{value}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <Card className="p-6 lg:self-start">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Traffic overview</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
              {topRoutes.length > 0 ? topRoutes.map(([route, count]) => <li key={route} className="flex items-center justify-between"><span>{route}</span><strong>{count}</strong></li>) : <li>No traffic events recorded yet.</li>}
            </ul>
          </Card>

          <Card className="p-6 lg:self-start">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Listing types</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
              {Object.entries(listingTypeCounts).map(([type, count]) => (
                <li key={type} className="flex items-center justify-between">
                  <span className="uppercase">{type}</span>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        </div>
      </main>
    </RouteAccessGate>
  );
}