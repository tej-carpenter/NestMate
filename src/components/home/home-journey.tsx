"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles, MapPin, Building, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ListingCard } from "@/components/listings/listing-card";
import { getActiveListings } from "@/lib/listing-queries";
import type { ListingInventoryItem } from "@/types/models";

const trustHighlights = [
  {
    label: "Verified Properties",
    detail: "Every stay undergoes a strict verification process before it's listed on our platform.",
    icon: ShieldCheck,
  },
  {
    label: "Real Availability",
    detail: "What you see is what you get. Live inventory synced instantly.",
    icon: BadgeCheck,
  },
  {
    label: "Resident Reviews",
    detail: "100% authentic feedback from real residents through our NestScore system.",
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
    <div className="space-y-8 pb-24 sm:space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[24px] bg-[color:var(--surface-strong)] px-6 py-16 text-center sm:px-12 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight text-[color:var(--foreground)] sm:text-6xl lg:text-7xl">
            Premium stays, <br className="hidden sm:block" />
            verified for trust.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-8 text-[color:var(--muted)]">
            Discover verified PGs, hostels, and apartments across India. Compare with confidence, book seamlessly, and move in faster.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-14 px-8 text-base shadow-lg shadow-black/5">
              <Link href="/search">
                Find your stay
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
              <Link href="/host/listings/new">List your property</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Highlights - Bento Grid */}
      <section className="grid gap-4 sm:grid-cols-3">
        {trustHighlights.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border-0 bg-[color:var(--surface)] p-8 shadow-sm">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-black/5 dark:bg-white/10">
                <Icon className="h-6 w-6 text-[color:var(--foreground)]" />
              </div>
              <h3 className="text-[17px] font-semibold text-[color:var(--foreground)]">{item.label}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--muted)]">{item.detail}</p>
            </Card>
          );
        })}
      </section>

      {/* Featured Listings */}
      <section className="pt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
              Featured stays
            </h2>
            <p className="mt-2 text-[15px] text-[color:var(--muted)]">Handpicked, highly-rated accommodations.</p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:flex">
            <Link href="/search">View all stays →</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {featuredListings.length > 0 ? (
            featuredListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
          ) : (
            <Card className="col-span-full p-12 text-center border-dashed bg-transparent shadow-none">
              <p className="text-[15px] text-[color:var(--muted)]">No verified listings available yet. Be the first to host!</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/host/listings/new">Add a property</Link>
              </Button>
            </Card>
          )}
        </div>
        
        <Button asChild variant="outline" className="mt-6 w-full sm:hidden">
          <Link href="/search">View all stays</Link>
        </Button>
      </section>

      {/* Statistics & Conversion - Bento Grid */}
      <section className="grid gap-4 pt-8 lg:grid-cols-[1fr_2fr]">
        <Card className="flex flex-col justify-between border-0 bg-[color:var(--foreground)] p-8 text-[color:var(--background)]">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">The Nestmate standard</h2>
            <p className="mt-4 text-[15px] leading-relaxed opacity-80">
              We are building the most trusted infrastructure for Indian accommodations. No fake listings. No hidden charges.
            </p>
          </div>
          <Button asChild className="mt-8 self-start border-0 shadow-none hover:opacity-90" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
            <Link href="/about">Learn more about us</Link>
          </Button>
        </Card>

        <Card className="border-0 bg-[color:var(--surface)] p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-[color:var(--foreground)]">Host on Nestmate</h3>
              </div>
              <p className="mt-4 text-[16px] leading-relaxed text-[color:var(--muted)] max-w-lg">
                Turn your property into a trusted stay. Reach verified guests, manage bookings seamlessly, and get paid securely.
              </p>
            </div>
            <Button asChild size="lg" className="shrink-0 h-12 px-8 text-[15px]">
              <Link href="/host/dashboard">Start hosting</Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
