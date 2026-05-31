"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, CalendarDays, CreditCard, MapPinned } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupee } from "@/lib/format";
import { getBookings, getPaymentForBooking } from "@/lib/local-data";
import { readLocalSession } from "@/lib/session";

export default function GuestBookingsPage() {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<ReturnType<typeof readLocalSession>>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSession(readLocalSession());
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  if (!mounted) {
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
  if (!session || (session.role !== "user" && session.role !== "admin")) {
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

  const bookings = session ? getBookings(session.phone) : [];
  const confirmedCount = bookings.filter((booking) => booking.status === "confirmed").length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-20 sm:px-6 sm:py-10 lg:px-8">
      <div className="space-y-6">
        <Card className="overflow-hidden border-white/70 bg-white/90 p-0 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.3)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
          <div className="bg-[linear-gradient(135deg,rgba(15,118,110,0.16),rgba(255,255,255,0.96),rgba(20,184,166,0.10))] p-6 sm:p-8 dark:bg-[linear-gradient(135deg,rgba(15,118,110,0.22),rgba(15,23,42,0.92),rgba(20,184,166,0.12))]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Booking history</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-slate-950 dark:text-slate-50">Review stays, deposits, and payment status</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">All booked rooms, PGs, hostels, and bedspaces are stored locally per signed-in account and linked to the NestPay ledger.</p>
          </div>
        </Card>

        {bookings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { label: "Bookings", value: bookings.length.toString(), icon: CalendarDays },
              { label: "Confirmed", value: confirmedCount.toString(), icon: BadgeCheck },
              { label: "Payment links", value: bookings.filter((booking) => getPaymentForBooking(booking.id)).length.toString(), icon: CreditCard },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.label} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.label}</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-50">{item.value}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-900 dark:bg-teal-500/15 dark:text-teal-100">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}

        {bookings.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-300">No bookings yet. Start from search or map.</p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/search">Browse listings <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => {
              const payment = getPaymentForBooking(booking.id);

              return (
                <Card key={booking.id} className="p-6 sm:p-7">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-900 dark:bg-teal-500/15 dark:text-teal-100">
                        <MapPinned className="h-3.5 w-3.5" />
                        {booking.listingKind}
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-slate-50">{booking.listingTitle}</h2>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        {booking.checkInDate} to {booking.checkOutDate} · Units: {booking.quantity} · Guests: {booking.guestCount}
                      </p>
                    </div>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900 dark:bg-teal-500/15 dark:text-teal-100">
                      {booking.status}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      Amount: <strong>{formatRupee(booking.amount)}</strong> · Payment: <strong>{payment?.status ?? "pending"}</strong>
                    </p>
                    <Button asChild variant="outline" size="sm">
                      <Link href={payment ? `/payment/${payment.id}` : `/book/${booking.listingSlug}`}>
                        Open payment
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
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