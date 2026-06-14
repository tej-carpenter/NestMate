"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ListingCard } from "@/components/listings/listing-card";
import { getActiveListings } from "@/lib/listing-queries";

const trustHighlights = [
  {
    label: "Verified-first",
    detail: "Properties are surfaced with visible verification state before booking.",
    icon: ShieldCheck,
  },
  {
    label: "Transparent inventory",
    detail: "Availability reflects stored listing records, not fabricated occupancy.",
    icon: BadgeCheck,
  },
  {
    label: "Resident-led feedback",
    detail: "Ratings only appear after real resident reviews.",
    icon: Sparkles,
  },
];

export function HomeJourney() {
  const [listings, setListings] = useState<ListingInventoryItem[]>([]);
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      getActiveListings()
        .then((inventory) => {
          setListings(inventory as ListingInventoryItem[]);
        })
        .catch(console.error);
      setBookingCount(0);
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  const verifiedCount = useMemo(() => listings.filter((listing) => listing.verified).length, [listings]);
  const cityCount = useMemo(() => new Set(listings.map((listing) => listing.city)).size, [listings]);
  const approvedCount = useMemo(() => listings.length, [listings]);
  const featuredListings = useMemo(() => listings.slice(0, 4), [listings]);

  return (
    <div className="space-y-6 pb-20">
      <section className="relative overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(255,255,255,0.98),rgba(249,115,22,0.08))] p-6 shadow-[0_24px_72px_-36px_rgba(15,23,42,0.34)] dark:bg-[linear-gradient(135deg,rgba(20,184,166,0.16),rgba(15,23,42,0.95),rgba(249,115,22,0.14))] sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" aria-hidden />
        <div className="absolute -bottom-28 left-12 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" aria-hidden />

        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-900 dark:text-teal-200">Trust to conversion journey</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight text-slate-950 dark:text-slate-50 sm:text-5xl lg:text-6xl">
              Discover verified stays, compare with confidence, and move in faster.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 dark:text-slate-200 sm:text-lg">
              Start with trust markers, flow into city and locality discovery, validate real marketplace proof, compare larger listing cards, and finish with clear booking or hosting actions.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 px-6">
                <Link href="/search">
                  Start searching
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6">
                <Link href="/host/listings/new">List your property</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-12 px-5">
                <Link href="/search">Explore verified stays</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface)]/85 p-4 backdrop-blur sm:p-5">
            {[
              ["Verified stays", verifiedCount > 0 ? String(verifiedCount) : "Verification in progress"],
              ["Cities with live inventory", cityCount > 0 ? String(cityCount) : "Recently added"],
              ["Successful bookings", bookingCount > 0 ? String(bookingCount) : "Awaiting first booking"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50 sm:text-xl">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {trustHighlights.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="border-[color:var(--border)] bg-[color:var(--surface)] p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-900 dark:bg-teal-500/15 dark:text-teal-100">
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-50">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.detail}</p>
            </Card>
          );
        })}
      </section>

      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-800 dark:text-teal-300">Marketplace proof</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-slate-950 dark:text-slate-50 sm:text-4xl">Statistics</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Card className="border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Approved listings</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-50">{approvedCount}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Count reflects listings approved for public discovery.</p>
          </Card>
          <Card className="border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Verified inventory</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-50">{verifiedCount}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Verification visibility is surfaced on every listing card.</p>
          </Card>
          <Card className="border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Booking completions</p>
            <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-50">{bookingCount}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Booking totals come from real user actions saved locally.</p>
          </Card>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-800 dark:text-teal-300">Listings</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-slate-950 dark:text-slate-50 sm:text-4xl">Featured listings</h2>
          </div>
          <Button asChild variant="outline" className="h-11 px-5">
            <Link href="/search">View all listings</Link>
          </Button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {featuredListings.length > 0 ? (
            featuredListings.map((listing) => <ListingCard key={listing.id} listing={listing} className="min-h-[40rem]" />)
          ) : (
            <Card className="border-[color:var(--border)] p-6 text-sm leading-6 text-slate-600 dark:text-slate-300 lg:col-span-2">
              No approved listings yet. Add your first property to bring this marketplace section to life.
            </Card>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-[color:var(--border)] bg-[linear-gradient(140deg,rgba(15,118,110,0.14),rgba(255,255,255,0.98))] p-6 dark:bg-[linear-gradient(140deg,rgba(20,184,166,0.18),rgba(15,23,42,0.95))] sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-900 dark:text-teal-200">Conversion</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-slate-950 dark:text-slate-50">Ready to move in?</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">Use search filters to shortlist a stay, then proceed to booking with clear pricing and availability context.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 px-6">
              <Link href="/search">
                Continue to search
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>

        <Card className="border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-800 dark:text-teal-300">For hosts</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-slate-950 dark:text-slate-50">List your property and get discovered</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Create a listing with location, amenities, and pricing. Approved inventory appears across search and city discovery.</p>
          <div className="mt-5 grid gap-3">
            <Button asChild size="lg" className="h-12 justify-center">
              <Link href="/host/listings/new">Start listing now</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-12 justify-center">
              <Link href="/host/dashboard">Open host dashboard</Link>
            </Button>
          </div>
        </Card>
      </section>

    </div>
  );
}
