"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { RouteAccessGate } from "@/components/auth/route-access-gate";
import {
  approveListingById,
  archiveListingById,
  deleteListingById,
  getBookings,
  getListingInventory,
  getPayments,
  getPayouts,
  getTrafficEvents,
  getTransactions,
  getUsers,
  rejectListingById,
  renewExpiredListingById,
  suspendListingById,
  updatePayoutStatus,
} from "@/lib/local-data";
import { formatDateTime, formatRupee } from "@/lib/format";
import { getListingStatusLabel, isPublicListingStatus } from "@/lib/listings/status";

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [listings, setListings] = useState<ReturnType<typeof getListingInventory>>([]);
  const [users, setUsers] = useState<ReturnType<typeof getUsers>>([]);
  const [bookings, setBookings] = useState<ReturnType<typeof getBookings>>([]);
  const [payments, setPayments] = useState<ReturnType<typeof getPayments>>([]);
  const [transactions, setTransactions] = useState<ReturnType<typeof getTransactions>>([]);
  const [payouts, setPayouts] = useState<ReturnType<typeof getPayouts>>([]);
  const [traffic, setTraffic] = useState<ReturnType<typeof getTrafficEvents>>([]);
  const [refreshToken, setRefreshToken] = useState(0);

  void refreshToken;

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setListings(getListingInventory());
      setUsers(getUsers());
      setBookings(getBookings());
      setPayments(getPayments());
      setTransactions(getTransactions());
      setPayouts(getPayouts());
      setTraffic(getTrafficEvents());
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(handle);
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

  function approveListing(listingId: string) {
    approveListingById(listingId);
    refresh();
  }

  function rejectListing(listingId: string) {
    const reason = window.prompt("Enter the rejection reason")?.trim();
    if (!reason) {
      return;
    }

    rejectListingById(listingId, reason);
    refresh();
  }

  function suspendListing(listingId: string) {
    const reason = window.prompt("Enter the suspension reason")?.trim();
    suspendListingById(listingId, reason);
    refresh();
  }

  function archiveListing(listingId: string) {
    const reason = window.prompt("Enter the archive reason")?.trim();
    archiveListingById(listingId, reason);
    refresh();
  }

  function renewExpiredListing(listingId: string) {
    renewExpiredListingById(listingId);
    refresh();
  }

  function removeListing(listingId: string) {
    deleteListingById(listingId);
    refresh();
  }

  function completePayout(payoutId: string) {
    updatePayoutStatus({
      payoutId,
      nextStatus: "paid",
      note: "Completed manually by admin.",
    });
    refresh();
  }

  function formatAvailability(listing: (typeof listings)[number]) {
    if (!isPublicListingStatus(listing.status, listing.moderationState)) {
      return "Unavailable";
    }

    if (listing.totalUnits <= 0 || listing.availableUnits <= 0) {
      return "Availability not listed yet";
    }

    return `${listing.availableUnits}/${listing.totalUnits} available`;
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
          <div className="mt-5">
            <Button asChild>
              <Link href="/admin/payouts">Open payout operations</Link>
            </Button>
          </div>
        </Card>

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
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Booking: {transaction.bookingId}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Host: {transaction.hostUserPhone ?? "Unassigned"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Updated: {formatDateTime(transaction.updatedAt)}</p>
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
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Host: {payout.hostUserPhone}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Created: {formatDateTime(payout.createdAt)}</p>
                    <div className="mt-3">
                      <Button className="h-10" onClick={() => completePayout(payout.id)}>Mark as completed</Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">No pending payouts.</p>
              )}
            </div>
          </Card>
        </div>

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
                {property.amenities.map((amenity) => (
                  <Chip key={amenity} className="!rounded-full px-3 py-1 text-xs font-medium">{amenity}</Chip>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Units: {formatAvailability(property)}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="outline" className="sm:flex-1">
                  <Link href={`/host/listings/new?edit=${property.slug}`}>Edit</Link>
                </Button>
                {property.status === "pending_review" ? (
                  <Button variant="outline" className="sm:flex-1" onClick={() => approveListing(property.id)}>
                    Approve
                  </Button>
                ) : null}
                {property.status === "pending_review" || property.status === "approved" ? (
                  <Button variant="outline" className="sm:flex-1" onClick={() => rejectListing(property.id)}>
                    Reject
                  </Button>
                ) : null}
                {property.status === "approved" ? (
                  <Button variant="outline" className="sm:flex-1" onClick={() => suspendListing(property.id)}>
                    Suspend
                  </Button>
                ) : null}
                {property.status !== "archived" ? (
                  <Button variant="outline" className="sm:flex-1" onClick={() => archiveListing(property.id)}>
                    Archive
                  </Button>
                ) : null}
                {property.status === "expired" ? (
                  <Button variant="outline" className="sm:flex-1" onClick={() => renewExpiredListing(property.id)}>
                    Renew
                  </Button>
                ) : null}
                <Button variant="ghost" className="sm:flex-1" onClick={() => removeListing(property.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
        </div>
      </main>
    </RouteAccessGate>
  );
}