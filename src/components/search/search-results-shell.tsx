"use client";

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
      <div className="flex flex-col gap-6">
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
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="min-h-96 animate-pulse border-[color:var(--border)] bg-[color:var(--surface)] p-5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
          {querySummary}
        </h1>
        <p className="mt-2 text-[15px] text-[color:var(--muted)]">
          {listings.length} verified {listings.length === 1 ? "property" : "properties"} available.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {quickChips.map((chip) => (
            <Badge key={chip} className="rounded-full bg-black/5 px-4 py-2 text-[13px] font-medium text-[color:var(--foreground)] border-0 dark:bg-white/10">
              {chip}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {listings.length > 0 ? (
          listings.map((property) => <ListingCard key={property.id} listing={property} />)
        ) : (
          <Card className="col-span-full border-dashed bg-transparent p-12 text-center shadow-none">
            <p className="text-[15px] text-[color:var(--muted)]">No verified listings match your current filters. Try expanding your search area or adjusting your budget.</p>
          </Card>
        )}
      </div>
    </div>
  );
}