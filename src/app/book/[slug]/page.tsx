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
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
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

    if (!agreedToDisclaimer) {
      setStatus("You must acknowledge the accommodation disclaimer to proceed.");
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const supabase = createSupabaseBrowserClient();

      const { data: bookingResult, error: bookingError } = await (supabase as any).rpc(
        "create_booking_transaction",
        {
          booking_payload: {
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
          }
        }
      );

      if (bookingError) throw bookingError;
      if (!bookingResult?.success || !bookingResult?.booking_id) {
        throw new Error("Failed to secure booking. Please try again.");
      }

      await supabase.from("user_policy_acceptances").insert({
        user_id: session.userId,
        policy_type: "booking_acknowledgement",
        policy_version: "June 2026",
        user_agent: window.navigator.userAgent,
      });

      const booking = { id: bookingResult.booking_id };

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
        <Card className="overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-lg shadow-black/5 dark:shadow-white/5">
          <div className="border-b border-[color:var(--border)] p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
                <Sparkles className="h-3.5 w-3.5" /> NestPay Secure
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified stay
              </span>
            </div>
            
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--foreground)] sm:text-4xl">{selectedListing.title}</h1>
            <p className="mt-2 text-lg text-[color:var(--muted)]">
              {selectedListing.locality}, {selectedListing.city} · {String(selectedListing.kind).toUpperCase()}
            </p>
          </div>

          <form id="booking-form" className="p-6 sm:p-10" onSubmit={(e) => { void handleCreateBooking(e); }}>
            {!isAuthenticated ? (
              <div className="mb-8 rounded-xl bg-black/5 p-6 text-center dark:bg-white/5">
                <p className="text-[15px] font-medium text-[color:var(--foreground)]">Sign in to continue</p>
                <p className="mt-1 text-[14px] text-[color:var(--muted)]">You need an account to create bookings and access payment history.</p>
                <Button asChild className="mt-4">
                  <Link href="/auth/login">Sign in</Link>
                </Button>
              </div>
            ) : null}

            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-6">
                <h3 className="text-[18px] font-semibold text-[color:var(--foreground)]">Stay dates</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-[14px] font-medium text-[color:var(--foreground)]">Check-in</span>
                    <Input type="date" className="h-12 rounded-xl" value={checkInDate} onChange={(event) => setCheckInDate(event.target.value)} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[14px] font-medium text-[color:var(--foreground)]">Check-out</span>
                    <Input type="date" className="h-12 rounded-xl" value={checkOutDate} onChange={(event) => setCheckOutDate(event.target.value)} />
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[18px] font-semibold text-[color:var(--foreground)]">Guest details</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-[14px] font-medium text-[color:var(--foreground)]">Guests</span>
                    <Input
                      type="number"
                      min={1}
                      max={8}
                      className="h-12 rounded-xl"
                      value={guestCount}
                      onChange={(event) => setGuestCount(Math.max(1, Number(event.target.value) || 1))}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[14px] font-medium text-[color:var(--foreground)]">Units required</span>
                    <Input
                      type="number"
                      min={1}
                      max={Math.max(1, selectedListing.availableUnits)}
                      className="h-12 rounded-xl"
                      value={quantity}
                      onChange={(event) => setQuantity(Math.min(Math.max(1, selectedListing.availableUnits), Math.max(1, Number(event.target.value) || 1)))}
                    />
                  </label>
                </div>
              </div>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-[14px] font-medium text-[color:var(--foreground)]">Special requests (optional)</span>
                <Input className="h-12 rounded-xl" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Any special requirement or move-in note" />
              </label>
            </div>

            <label className="mt-8 flex items-start gap-3">
              <input 
                type="checkbox" 
                className="mt-1 h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--brand)] focus:ring-[color:var(--brand)]" 
                checked={agreedToDisclaimer}
                onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
              />
              <span className="text-[13px] leading-relaxed text-[color:var(--muted)]">
                I understand that Nestmate is a marketplace platform and does not own or operate the listed accommodation.
              </span>
            </label>

            <div className="mt-8 flex items-center justify-end border-t border-[color:var(--border)] pt-8">
              <Button type="submit" disabled={isSubmitting || !isAuthenticated} className="h-12 px-8 text-[15px]">
                {isSubmitting ? "Creating booking..." : "Continue to payment"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>

          {status ? <p className="border-t border-[color:var(--border)] px-6 py-4 text-[14px] text-[color:var(--muted)]" aria-live="polite">{status}</p> : null}
        </Card>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Card className="flex flex-col gap-6 overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-xl shadow-black/5 dark:shadow-white/5">
            <div>
              <p className="text-[24px] font-bold text-[color:var(--foreground)]">{formatRupee(selectedListing.price * quantity)}</p>
              <p className="text-[15px] font-normal text-[color:var(--muted)]">{formatPricePeriod(selectedListing.priceType)}</p>
            </div>

            <div className="grid gap-3 border-y border-[color:var(--border)] py-6">
              {[
                { label: "Selected units", value: quantity },
                { label: "Move-in total", value: formatRupee(moveInTotal) },
                { label: "Availability", value: hasAvailabilityData ? `${selectedListing.availableUnits}/${selectedListing.totalUnits}` : "Not listed yet" },
                { label: "NestScore", value: hasResidentFeedback ? `${selectedListing.nestscore.toFixed(1)} / 5` : "New" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <p className="text-[14px] font-medium text-[color:var(--muted)]">{item.label}</p>
                  <p className="text-[14px] font-medium text-[color:var(--foreground)]">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-black/5 p-4 dark:bg-white/5">
              <p className="text-[13px] font-semibold text-[color:var(--foreground)]">Secure Checkout</p>
              <p className="mt-1 text-[13px] text-[color:var(--muted)] leading-relaxed">
                You will be redirected to Razorpay to securely complete your payment on the next screen.
              </p>
            </div>
          </Card>
        </aside>
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
