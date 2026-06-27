"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, CalendarDays, CreditCard, MapPinned } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupee } from "@/lib/format";
import { loadSupabaseSessionProfile, readLocalSession } from "@/lib/session";
import { isAuthenticatedSession } from "@/lib/auth/permissions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function GuestBookingsPage() {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<ReturnType<typeof readLocalSession>>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      let currentSession = readLocalSession();
      setSession(currentSession);

      try {
        currentSession = await loadSupabaseSessionProfile();
        if (active) setSession(currentSession);
      } catch {
        if (active) setSession(readLocalSession());
      }

      if (currentSession?.userId) {
        const supabase = createSupabaseBrowserClient();
        const { data } = await (supabase.from("bookings") as any)
          .select(`
            id,
            move_in_date,
            move_out_date,
            rent_amount,
            booking_status,
            quantity,
            guest_count,
            listings!inner(title, space_type),
            transactions(id, payment_status, transaction_type)
          `)
          .eq("guest_id", currentSession.userId)
          .order("created_at", { ascending: false });

        if (active && data) {
          const formattedBookings = data.map((b: any) => ({
            id: b.id,
            listingTitle: b.listings?.title || "Unknown Listing",
            listingKind: b.listings?.space_type || "Space",
            checkInDate: b.move_in_date,
            checkOutDate: b.move_out_date,
            quantity: b.quantity || 1,
            guestCount: b.guest_count || 1,
            status: b.booking_status,
            amount: b.rent_amount,
            // Find the payment transaction if it exists
            payment: (b.transactions || []).find((t: any) => t.transaction_type === "payment"),
          }));
          setBookings(formattedBookings);
        }
      }
      
      if (active) {
        setLoadingBookings(false);
        setMounted(true);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  if (!mounted || loadingBookings) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-20 sm:px-6 sm:py-10 lg:px-8">
        <div className="space-y-6">
          <Card className="h-56 animate-pulse border-white/70 bg-white/90 dark:border-white/10 dark:bg-slate-950/45" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="h-28 animate-pulse border-[color:var(--border)] bg-[color:var(--surface)]" />
            ))}
          </div>
          <Card className="h-56 animate-pulse border-[color:var(--border)] bg-[color:var(--surface)]" />
        </div>
      </main>
    );
  }

  if (!isAuthenticatedSession(session)) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-20 sm:px-6 sm:py-10 lg:px-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Sign in to view bookings</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Anonymous visitors can browse listings, but bookings are available only after login.</p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  const confirmedCount = bookings.filter((booking) => booking.status === "confirmed").length;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">Guest Dashboard</h1>
        <p className="mt-2 text-[15px] text-[color:var(--muted)]">Manage your stays, profile, and payments.</p>
        
        {/* Simple Tab Navigation */}
        <div className="mt-6 flex items-center gap-6 border-b border-[color:var(--border)]">
          <Link href="/profile" className="pb-3 text-[15px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors">
            Profile
          </Link>
          <Link href="/guest/bookings" className="border-b-2 border-[color:var(--foreground)] pb-3 text-[15px] font-semibold text-[color:var(--foreground)]">
            My Bookings
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        {bookings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Total Bookings", value: bookings.length.toString(), icon: CalendarDays },
              { label: "Confirmed", value: confirmedCount.toString(), icon: BadgeCheck },
              { label: "Payment Links", value: bookings.filter((booking) => booking.payment).length.toString(), icon: CreditCard },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.label} className="p-6 rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-medium text-[color:var(--muted)]">{item.label}</p>
                      <p className="mt-1 text-2xl font-bold text-[color:var(--foreground)]">{item.value}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-[color:var(--foreground)] dark:bg-white/5">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}

        {bookings.length === 0 ? (
          <div className="rounded-[24px] border border-[color:var(--border)] bg-black/5 p-12 text-center dark:bg-white/5">
            <CalendarDays className="mx-auto h-12 w-12 text-[color:var(--muted)] opacity-50" />
            <h3 className="mt-4 text-lg font-semibold text-[color:var(--foreground)]">No bookings yet</h3>
            <p className="mt-2 text-[15px] text-[color:var(--muted)]">Start exploring to find your next stay.</p>
            <Button asChild className="mt-6">
              <Link href="/search">Browse listings <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => {
              const payment = booking.payment;

              return (
                <Card key={booking.id} className="overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-0 shadow-sm transition-shadow hover:shadow-md">
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-black/5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--foreground)] dark:bg-white/10">
                            <MapPinned className="h-3.5 w-3.5" />
                            {booking.listingKind}
                          </span>
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            {booking.status}
                          </span>
                        </div>
                        <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--foreground)]">{booking.listingTitle}</h2>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-[color:var(--muted)]">
                          <span>{booking.checkInDate} to {booking.checkOutDate}</span>
                          <span>&middot;</span>
                          <span>{booking.quantity} Unit(s)</span>
                          <span>&middot;</span>
                          <span>{booking.guestCount} Guest(s)</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-4 border-t border-[color:var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-[13px] font-medium text-[color:var(--muted)]">Total Amount</p>
                          <p className="mt-1 text-[16px] font-bold text-[color:var(--foreground)]">{formatRupee(booking.amount)}</p>
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-[color:var(--muted)]">Payment Status</p>
                          <p className="mt-1 text-[16px] font-semibold capitalize text-[color:var(--foreground)]">{payment?.payment_status ?? "Pending"}</p>
                        </div>
                      </div>
                      {booking.status === "confirmed" ? (
                        <Button asChild className="h-10 px-6 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
                          <Link href={`/payment/${booking.id}/receipt`}>
                            View Receipt
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild variant="outline" className="h-10 px-6 font-semibold">
                          <Link href={`/payment/${booking.id}`}>
                            Open Payment
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
