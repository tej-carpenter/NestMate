"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, ChevronDown, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRupee } from "@/lib/format";
import { formatPricePeriod } from "@/lib/pricing";
import { loadSupabaseSessionProfile, readLocalSession } from "@/lib/session";
import { isAuthenticatedSession } from "@/lib/auth/permissions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function BookingPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<ReturnType<typeof readLocalSession>>(null);
  const [listing, setListing] = useState<any>(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedParams = use(params as Promise<{ slug: string }>);

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

      const supabase = createSupabaseBrowserClient();
      const { data: listingData } = await supabase
        .from("listings")
        .select(`
          id, host_id, title, description, city, locality, space_type, price, price_type, nestscore
        `)
        .eq("id", resolvedParams.slug)
        .maybeSingle();

      if (active && listingData) {
        setListing({
          id: listingData.id,
          hostId: listingData.host_id,
          title: listingData.title,
          description: listingData.description,
          city: listingData.city,
          locality: listingData.locality,
          kind: listingData.space_type,
          price: Number(listingData.price),
          priceType: listingData.price_type,
          nestscore: listingData.nestscore ? Number(listingData.nestscore) : 0,
          reviewCount: listingData.nestscore ? 1 : 0, // Mock review count for NestScore UI
          availableUnits: 1, // Defaulting to 1 since schema doesn't track inventory currently
          totalUnits: 1,
        });
      }
      if (active) setMounted(true);
    }

    loadData();

    return () => {
      active = false;
    };
  }, [resolvedParams.slug]);

  const moveInTotal = listing ? listing.price * 1 : 0;

  if (!mounted) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-10 sm:pb-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
          <Card className="h-[42rem] animate-pulse border-white/70 bg-white/90 dark:border-white/10 dark:bg-slate-950/45" />
          <Card className="h-[32rem] animate-pulse border-[color:var(--border)] bg-[color:var(--surface)]" />
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">Listing not found</h1>
          <p className="mt-3 text-sm text-[color:var(--muted)]">The item you selected is not available anymore.</p>
          <div className="mt-5">
            <Button onClick={() => router.push("/search")}>Back to search</Button>
          </div>
        </Card>
      </main>
    );
  }

  const selectedListing = listing;
  const isAuthenticated = isAuthenticatedSession(session);
  const hasResidentFeedback = (selectedListing.reviewCount ?? 0) > 0;
  const hasAvailabilityData = selectedListing.totalUnits > 0 && selectedListing.availableUnits > 0;

  async function handleCreateBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated || !session) {
      setStatus("Please login first to continue booking.");
      return;
    }

    if (!checkInDate || !checkOutDate) {
      setStatus("Select both check-in and check-out dates.");
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const supabase = createSupabaseBrowserClient();

      const { data: booking, error: bookingError } = await (supabase.from("bookings") as any)
        .insert({
          listing_id: selectedListing.id,
          guest_id: session.userId,
          host_id: selectedListing.hostId,
          move_in_date: checkInDate,
          move_out_date: checkOutDate,
          rent_amount: selectedListing.price * quantity,
          deposit_amount: 0,
          booking_status: "pending",
          payment_status: "pending",
          notes: notes,
          quantity: quantity,
          guest_count: guestCount,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      setStatus("Booking created. Redirecting to payment...");
      router.push(`/payment/${booking.id}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to create booking right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-10 sm:pb-10 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
        <Card className="overflow-hidden border-white/70 bg-white/90 p-0 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.3)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
          <div className="border-b border-[color:var(--border)] bg-[linear-gradient(135deg,rgba(15,118,110,0.16),rgba(255,255,255,0.96),rgba(20,184,166,0.10))] p-5 sm:p-8 dark:bg-[linear-gradient(135deg,rgba(15,118,110,0.22),rgba(15,23,42,0.92),rgba(20,184,166,0.12))]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900 dark:bg-teal-500/15 dark:text-teal-100">
                <Sparkles className="h-3.5 w-3.5" />
                NestPay booking
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-100">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Verified inventory
              </span>
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-[color:var(--foreground)] sm:text-5xl">{selectedListing.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)] sm:text-base sm:leading-7">
              {selectedListing.locality}, {selectedListing.city} · {String(selectedListing.kind).toUpperCase()} · {hasResidentFeedback ? `NestScore ${selectedListing.nestscore.toFixed(1)}` : "Awaiting resident feedback"}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">{selectedListing.description}</p>

            <details className="mt-5 rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-950 dark:text-slate-50">
                What stays visible
                <ChevronDown className="h-4 w-4 text-slate-500 transition-transform open:rotate-180" />
              </summary>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Secure hold", value: "Payment handoff" },
                  { label: "Transparent fees", value: "No hidden steps" },
                  { label: "Secure Payment", value: "Razorpay Checkout" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.4rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-slate-50">{item.value}</p>
                  </div>
                ))}
              </div>
            </details>
          </div>

          <form id="booking-form" className="grid gap-4 p-5 sm:p-8 sm:pt-7 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]" onSubmit={(e) => { void handleCreateBooking(e); }}>
            {!isAuthenticated ? (
              <div className="sm:col-span-2">
                <Card className="p-4 mb-4">
                  <p className="text-sm text-[color:var(--muted)]">Sign in to create bookings and access payment history.</p>
                  <div className="mt-3">
                    <Button asChild>
                      <Link href="/auth/login">Sign in to continue</Link>
                    </Button>
                  </div>
                </Card>
              </div>
            ) : null}
            <div className="sm:col-span-2 grid gap-4 rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 sm:grid-cols-2 sm:p-5">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)]"><CalendarDays className="h-4 w-4 text-teal-700 dark:text-teal-300" /> Check-in</span>
                <Input type="date" value={checkInDate} onChange={(event) => setCheckInDate(event.target.value)} />
              </label>
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)]"><CalendarDays className="h-4 w-4 text-teal-700 dark:text-teal-300" /> Check-out</span>
                <Input type="date" value={checkOutDate} onChange={(event) => setCheckOutDate(event.target.value)} />
              </label>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">Guests</span>
              <Input
                type="number"
                min={1}
                max={8}
                value={guestCount}
                onChange={(event) => setGuestCount(Math.max(1, Number(event.target.value) || 1))}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[color:var(--foreground)]">Units</span>
              <Input
                type="number"
                min={1}
                max={Math.max(1, selectedListing.availableUnits)}
                value={quantity}
                onChange={(event) => setQuantity(Math.min(Math.max(1, selectedListing.availableUnits), Math.max(1, Number(event.target.value) || 1)))}
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)]"><CreditCard className="h-4 w-4 text-teal-700 dark:text-teal-300" /> Notes</span>
              <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Any special requirement, timing, or move-in note" />
            </label>
            <div className="sm:col-span-2 flex flex-col gap-3 rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Booking action</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">Continue to payment only after you lock the stay details.</p>
              </div>
              <Button type="submit" disabled={isSubmitting || !isAuthenticated} className="w-full sm:w-auto">
                {isSubmitting ? "Creating booking..." : "Continue to payment"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {status ? <p className="border-t border-[color:var(--border)] px-5 py-4 text-sm text-[color:var(--foreground)] sm:px-8" aria-live="polite">{status}</p> : null}
        </Card>

        <Card className="p-6 sm:p-8 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.6rem] border border-[color:var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,252,0.96))] p-5 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.88))]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Booking summary</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">{formatRupee(selectedListing.price * quantity)}</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Pricing {formatPricePeriod(selectedListing.priceType)} · Units selected {quantity}</p>
            <div className="mt-4 flex items-center justify-between rounded-[1.25rem] bg-teal-50 px-4 py-3 text-sm text-teal-950 dark:bg-teal-500/15 dark:text-teal-50">
              <span className="font-medium">Resident feedback</span>
              <span className="font-semibold">{hasResidentFeedback ? `${selectedListing.nestscore.toFixed(1)} / 5` : "No reviews yet"}</span>
            </div>
          </div>

          <details className="mt-4 rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950 dark:text-slate-50">More booking context</summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                { label: "Availability", value: hasAvailabilityData ? `${selectedListing.availableUnits}/${selectedListing.totalUnits}` : "Not listed yet" },
                { label: "Move-in total", value: formatRupee(moveInTotal) },
                { label: "Login required", value: session ? session.name : "Yes" },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="mt-1 text-base font-semibold text-slate-950 dark:text-slate-50">{item.value}</p>
                </div>
              ))}
              <div className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 text-sm text-[color:var(--muted)]">
                <p className="font-semibold text-[color:var(--foreground)]">Trust-first handoff</p>
                <p className="mt-1 leading-6">This page captures stay details only. NestPay will handle secure confirmation via Razorpay on the next screen.</p>
              </div>
            </div>
          </details>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-[5.25rem] z-40 border-t border-[color:var(--border)] bg-[color:var(--surface)]/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-1">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Move-in total</p>
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">{formatRupee(selectedListing.price)} {formatPricePeriod(selectedListing.priceType)}</p>
          </div>
          <Button type="submit" form="booking-form" className="flex-1" disabled={!isAuthenticated}>
            Continue
          </Button>
        </div>
      </div>
    </main>
  );
}
