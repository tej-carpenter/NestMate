"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RouteAccessGate } from "@/components/auth/route-access-gate";
import {
  getBookings,
  getListingInventory,
  getPayouts,
  getTransactions,
  getUsers,
  setPayoutNote,
  updatePayoutStatus,
  type LedgerStatus,
} from "@/lib/local-data";
import { formatDateTime, formatRupee } from "@/lib/format";

const statusOptions: Array<"all" | LedgerStatus> = ["all", "pending", "processing", "paid", "failed"];

export default function AdminPayoutsPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("all");
  const [hostFilter, setHostFilter] = useState("all");
  const [transactions, setTransactions] = useState<ReturnType<typeof getTransactions>>([]);
  const [payouts, setPayouts] = useState<ReturnType<typeof getPayouts>>([]);
  const [bookings, setBookings] = useState<ReturnType<typeof getBookings>>([]);
  const [listings, setListings] = useState<ReturnType<typeof getListingInventory>>([]);
  const [users, setUsers] = useState<ReturnType<typeof getUsers>>([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setTransactions(getTransactions());
      setPayouts(getPayouts());
      setBookings(getBookings());
      setListings(getListingInventory());
      setUsers(getUsers());
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(handle);
  }, [refreshToken]);

  const usersByPhone = useMemo(() => new Map(users.map((user) => [user.phone, user.name || user.phone])), [users]);
  const listingsById = useMemo(() => new Map(listings.map((listing) => [listing.id, listing])), [listings]);
  const bookingsById = useMemo(() => new Map(bookings.map((booking) => [booking.id, booking])), [bookings]);

  const totalCollected = useMemo(
    () => transactions.filter((transaction) => transaction.status === "paid").reduce((sum, transaction) => sum + transaction.amount, 0),
    [transactions],
  );
  const totalPaid = useMemo(
    () => payouts.filter((payout) => payout.status === "paid").reduce((sum, payout) => sum + payout.amount, 0),
    [payouts],
  );
  const pendingPayoutAmount = useMemo(
    () => payouts.filter((payout) => payout.status === "pending" || payout.status === "processing").reduce((sum, payout) => sum + payout.amount, 0),
    [payouts],
  );

  const hostOptions = useMemo(() => {
    const phones = Array.from(new Set(payouts.map((payout) => payout.hostUserPhone)));
    return phones.map((phone) => ({ phone, label: usersByPhone.get(phone) ?? phone }));
  }, [payouts, usersByPhone]);

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return transactions.filter((transaction) => {
      if (statusFilter !== "all" && transaction.status !== statusFilter) {
        return false;
      }

      if (hostFilter !== "all" && transaction.hostUserPhone !== hostFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const listing = listingsById.get(transaction.listingId);
      const haystack = [
        transaction.id,
        transaction.bookingId,
        transaction.paymentId,
        transaction.guestUserPhone,
        transaction.hostUserPhone ?? "",
        listing?.title ?? "",
        listing?.city ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [hostFilter, listingsById, searchQuery, statusFilter, transactions]);

  const filteredPayouts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return payouts.filter((payout) => {
      if (statusFilter !== "all" && payout.status !== statusFilter) {
        return false;
      }

      if (hostFilter !== "all" && payout.hostUserPhone !== hostFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const listing = listingsById.get(payout.listingId);
      const haystack = [
        payout.id,
        payout.transactionId,
        payout.paymentId,
        payout.bookingId,
        payout.hostUserPhone,
        payout.note ?? "",
        listing?.title ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [hostFilter, listingsById, payouts, searchQuery, statusFilter]);

  const pendingPayouts = filteredPayouts.filter((payout) => payout.status === "pending" || payout.status === "processing");
  const completedPayouts = filteredPayouts.filter((payout) => payout.status === "paid");
  const payoutHistory = filteredPayouts;

  const selectedTransaction = selectedTransactionId ? transactions.find((transaction) => transaction.id === selectedTransactionId) ?? null : null;

  function refreshData() {
    setRefreshToken((value) => value + 1);
  }

  function handleMarkPayout(payoutId: string, status: LedgerStatus) {
    updatePayoutStatus({
      payoutId,
      nextStatus: status,
      note: status === "paid" ? "Marked completed manually by admin." : "Marked failed manually by admin.",
    });
    refreshData();
  }

  function handleSavePayoutNote(payoutId: string) {
    const note = (noteDrafts[payoutId] ?? "").trim();
    setPayoutNote({ payoutId, note });
    refreshData();
  }

  if (!mounted) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card className="h-32 animate-pulse" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="h-28 animate-pulse" />
            <Card className="h-28 animate-pulse" />
            <Card className="h-28 animate-pulse" />
          </div>
          <Card className="h-[32rem] animate-pulse" />
        </div>
      </main>
    );
  }

  return (
    <RouteAccessGate
      variant="moderator"
      title="Admin access required"
      description="Payout operations are available only to admin accounts."
      actionLabel="Go to login"
      actionHref="/auth/login"
    >
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Admin payouts</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-slate-950 dark:text-slate-50">Payout operations dashboard</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Track guest collections, host payout queues, and manual payout outcomes with searchable operational records.</p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Total collected</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-50">{formatRupee(totalCollected)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Total paid</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-50">{formatRupee(totalPaid)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Pending payouts</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-50">{formatRupee(pendingPayoutAmount)}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{pendingPayouts.length} records</p>
          </Card>
        </div>

        <Card className="p-5">
          <div className="grid gap-3 lg:grid-cols-[1.2fr_0.4fr_0.4fr]">
            <Input placeholder="Search by transaction, booking, host, listing, or note" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as (typeof statusOptions)[number])}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status === "all" ? "All statuses" : status}</option>
              ))}
            </Select>
            <Select value={hostFilter} onChange={(event) => setHostFilter(event.target.value)}>
              <option value="all">All hosts</option>
              {hostOptions.map((host) => (
                <option key={host.phone} value={host.phone}>{host.label}</option>
              ))}
            </Select>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <Card className="p-6 lg:self-start">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Transaction list</p>
            <div className="mt-4 space-y-3">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => {
                  const listing = listingsById.get(transaction.listingId);
                  return (
                    <button
                      key={transaction.id}
                      type="button"
                      onClick={() => setSelectedTransactionId(transaction.id)}
                      className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-left transition hover:border-teal-500/40"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{formatRupee(transaction.amount)}</p>
                        <Chip className="!rounded-full px-3 py-1 text-xs font-semibold">{transaction.status}</Chip>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{listing?.title ?? transaction.listingId}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Guest: {transaction.guestUserPhone} · Host: {transaction.hostUserPhone ?? "Unassigned"}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Updated {formatDateTime(transaction.updatedAt)}</p>
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">No transactions match your filters.</p>
              )}
            </div>
          </Card>

          <Card className="p-6 lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Review transaction</p>
            {selectedTransaction ? (
              <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                  <p className="font-semibold text-slate-950 dark:text-slate-50">{selectedTransaction.id}</p>
                  <p className="mt-1">Booking: {selectedTransaction.bookingId}</p>
                  <p>Payment: {selectedTransaction.paymentId}</p>
                  <p>Amount: {formatRupee(selectedTransaction.amount)}</p>
                  <p>Status: {selectedTransaction.status}</p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                  <p className="font-semibold text-slate-950 dark:text-slate-50">Context</p>
                  <p className="mt-1">Listing: {listingsById.get(selectedTransaction.listingId)?.title ?? selectedTransaction.listingId}</p>
                  <p>Check-in: {bookingsById.get(selectedTransaction.bookingId)?.checkInDate ?? "N/A"}</p>
                  <p>Guest: {selectedTransaction.guestUserPhone}</p>
                  <p>Host: {selectedTransaction.hostUserPhone ?? "Unassigned"}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Choose a transaction to review operational details.</p>
            )}
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="p-6 xl:col-span-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Pending payouts</p>
            <div className="mt-4 space-y-3">
              {pendingPayouts.length > 0 ? (
                pendingPayouts.map((payout) => (
                  <div key={payout.id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{formatRupee(payout.amount)}</p>
                      <Chip className="!rounded-full px-3 py-1 text-xs font-semibold">{payout.status}</Chip>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Host: {usersByPhone.get(payout.hostUserPhone) ?? payout.hostUserPhone}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Created: {formatDateTime(payout.createdAt)}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Button className="h-10" onClick={() => handleMarkPayout(payout.id, "paid")}>Mark completed</Button>
                      <Button variant="outline" className="h-10" onClick={() => handleMarkPayout(payout.id, "failed")}>Mark failed</Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">No pending payouts.</p>
              )}
            </div>
          </Card>

          <Card className="p-6 xl:col-span-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Completed payouts</p>
            <div className="mt-4 space-y-3">
              {completedPayouts.length > 0 ? (
                completedPayouts.map((payout) => (
                  <div key={payout.id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{formatRupee(payout.amount)}</p>
                      <Chip className="!rounded-full px-3 py-1 text-xs font-semibold">paid</Chip>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Host: {usersByPhone.get(payout.hostUserPhone) ?? payout.hostUserPhone}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Completed: {payout.completedAt ? formatDateTime(payout.completedAt) : "N/A"}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">No completed payouts for the current filter.</p>
              )}
            </div>
          </Card>

          <Card className="p-6 xl:col-span-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Payout history</p>
            <div className="mt-4 space-y-3">
              {payoutHistory.length > 0 ? (
                payoutHistory.map((payout) => (
                  <div key={payout.id} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{formatRupee(payout.amount)}</p>
                      <Chip className="!rounded-full px-3 py-1 text-xs font-semibold">{payout.status}</Chip>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Host: {usersByPhone.get(payout.hostUserPhone) ?? payout.hostUserPhone}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Transaction: {payout.transactionId}</p>
                    <label className="mt-3 block space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Payout note</span>
                      <Input
                        value={noteDrafts[payout.id] ?? payout.note ?? ""}
                        onChange={(event) => setNoteDrafts((current) => ({ ...current, [payout.id]: event.target.value }))}
                        placeholder="Add operational note"
                      />
                    </label>
                    <div className="mt-2">
                      <Button variant="outline" className="h-10" onClick={() => handleSavePayoutNote(payout.id)}>Save note</Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300">No payout history for the current filter.</p>
              )}
            </div>
          </Card>
        </div>
        </div>
      </main>
    </RouteAccessGate>
  );
}
