"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getActiveListings } from "@/lib/listing-queries";
import { ListingCard } from "@/components/listings/listing-card";
import type { ListingInventoryItem } from "@/types/models";

const quickChips = ["Verified only", "Under 15k", "Near metro", "Food included", "Female-friendly", "Move-in ready"];

export function SearchResultsShell({ querySummary }: { querySummary: string }) {
  const [mounted, setMounted] = useState(false);
  const [listings, setListings] = useState<ListingInventoryItem[]>([]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      getActiveListings()
        .then((data) => {
          setListings(data as ListingInventoryItem[]);
          setMounted(true);
        })
        .catch((error) => {
          console.error(error);
          setMounted(true);
        });
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  if (!mounted) {
    return (
      <div className="grid gap-5 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
        <div className="space-y-5">
          <Card className="border-[color:var(--border)] p-5 sm:p-7 lg:p-8">
            <div className="h-6 w-36 rounded-full bg-slate-200/80 dark:bg-slate-800/70" />
            <div className="mt-4 h-10 w-full max-w-2xl rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                  <div className="h-4 w-24 rounded-full bg-slate-200/80 dark:bg-slate-800/70" />
                  <div className="mt-3 h-4 w-full rounded-full bg-slate-200/70 dark:bg-slate-800/60" />
                  <div className="mt-2 h-4 w-5/6 rounded-full bg-slate-200/60 dark:bg-slate-800/50" />
                </div>
              ))}
            </div>
          </Card>
          <div className="grid gap-5 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] xl:grid-cols-[repeat(auto-fit,minmax(330px,1fr))]">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="min-h-96 animate-pulse border-[color:var(--border)] bg-[color:var(--surface)] p-5" />
            ))}
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="h-44 border-[color:var(--border)] p-5 sm:p-6" />
          <Card className="h-48 border-[color:var(--border)] p-5 sm:p-6" />
          <Card className="h-44 border-[color:var(--border)] p-5 sm:p-6" />
        </aside>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
      <div className="space-y-5">
        <Card className="overflow-hidden border-[color:var(--border)] bg-[linear-gradient(160deg,rgba(15,118,110,0.14),rgba(255,255,255,0.96),rgba(20,184,166,0.08))] p-0 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.34)] dark:bg-[linear-gradient(160deg,rgba(15,118,110,0.22),rgba(15,23,42,0.94),rgba(20,184,166,0.10))]">
          <div className="p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge className="bg-white/90 text-teal-950 dark:bg-teal-500/15 dark:text-teal-100">Search status</Badge>
                  <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-3xl leading-tight text-slate-950 dark:text-slate-50 sm:text-4xl">{querySummary}</h2>
                </div>
                <div className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:max-w-sm">
                  Results stay compact by default. Open any listing to view real availability and feedback status.
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {quickChips.map((chip) => (
                  <Badge key={chip} className="shrink-0 border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm text-slate-700 dark:text-slate-200">
                    {chip}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] xl:grid-cols-[repeat(auto-fit,minmax(330px,1fr))]">
          {listings.length > 0 ? listings.map((property) => <ListingCard key={property.id} listing={property} />) : (
            <Card className="border-[color:var(--border)] p-6 text-sm leading-6 text-slate-600 dark:text-slate-300 md:col-span-2">
              No listings match your current filters yet. Try a wider city or price range.
            </Card>
          )}
        </div>

        <Card className="border-[color:var(--border)] p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Personalized feed</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            {[
              ["Recently added", "New properties appear here before they receive resident feedback."],
              ["Awaiting resident feedback", "Some listings are new and will show ratings after verified stays."],
              ["Budget focus", "Use price filters to compare rent without relying on popularity labels."],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <Card className="border-[color:var(--border)] p-5 sm:p-6">
          <details>
            <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Search stack</summary>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
              <li className="rounded-[1.25rem] bg-[color:var(--surface-strong)] px-4 py-3">Full-text and faceted filters through Supabase Postgres.</li>
              <li className="rounded-[1.25rem] bg-[color:var(--surface-strong)] px-4 py-3">SSR city pages for SEO and locality landing pages.</li>
              <li className="rounded-[1.25rem] bg-[color:var(--surface-strong)] px-4 py-3">Map discovery with location-aware property cards.</li>
            </ul>
          </details>
        </Card>
        <Card className="border-[color:var(--border)] p-5 sm:p-6">
          <details>
            <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Quick links</summary>
            <div className="mt-4 grid gap-3 text-sm text-teal-800 dark:text-teal-300">
              <Link className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 transition hover:border-teal-500/40 hover:text-teal-900 dark:hover:text-teal-100" href="/map">Map discovery</Link>
              <Link className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 transition hover:border-teal-500/40 hover:text-teal-900 dark:hover:text-teal-100" href="/profile">Profile</Link>
              <Link className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 transition hover:border-teal-500/40 hover:text-teal-900 dark:hover:text-teal-100" href="/city/Indore">Indore city page</Link>
              <Link className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 transition hover:border-teal-500/40 hover:text-teal-900 dark:hover:text-teal-100" href="/host/listings/new">Create a listing</Link>
            </div>
          </details>
        </Card>
        <Card className="border-[color:var(--border)] p-5 sm:p-6">
          <details>
            <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Feed guidance</summary>
            <div className="mt-4 grid gap-3">
              {[
                ["Trust first", "Verification and review state stay visible before the click."],
                ["Compare faster", "Cards are denser and easier to scan on mobile."],
                ["Book with clarity", "The booking route keeps the CTA hierarchy simple."],
              ].map(([title, detail]) => (
                <div key={title} className="rounded-[1.25rem] bg-[color:var(--surface-strong)] px-4 py-3">
                  <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{detail}</p>
                </div>
              ))}
            </div>
          </details>
        </Card>
      </aside>
    </div>
  );
}