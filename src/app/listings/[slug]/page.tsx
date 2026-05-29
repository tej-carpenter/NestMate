"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ListingPageTemplate from "@/components/listings/listing-page-template";
import { getHostProfileForListing, getListingBySlug, getListingInventory, type ListingInventoryItem, type PublicHostProfile } from "@/lib/local-data";

function ListingDetailLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <Card className="h-[44rem] animate-pulse border-[color:var(--border)] bg-[color:var(--surface)]" />
        <Card className="h-[32rem] animate-pulse border-[color:var(--border)] bg-[color:var(--surface)]" />
      </div>
    </main>
  );
}

export default function ListingDetailPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const resolvedParams = use(params as Promise<{ slug: string }>);
  const [mounted, setMounted] = useState(false);
  const [listing, setListing] = useState<ListingInventoryItem | null>(null);
  const [inventory, setInventory] = useState<ListingInventoryItem[]>([]);
  const [hostProfile, setHostProfile] = useState<PublicHostProfile | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const nextInventory = getListingInventory();
      const nextListing = getListingBySlug(resolvedParams.slug);

      setInventory(nextInventory);
      setListing(nextListing);
      setHostProfile(nextListing ? getHostProfileForListing(nextListing) : null);
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(handle);
  }, [resolvedParams.slug]);

  const body = useMemo(() => {
    if (!mounted) {
      return <ListingDetailLoading />;
    }

    if (!listing) {
      return (
        <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <Card className="p-6">
            <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">Listing not found</h1>
            <p className="mt-3 text-sm text-[color:var(--muted)]">The listing was not found in your saved inventory. It may be a draft or the local data was cleared.</p>
            <div className="mt-5">
              <Button asChild>
                <Link href="/search">Back to search</Link>
              </Button>
            </div>
          </Card>
        </main>
      );
    }

    return <ListingPageTemplate listing={listing} inventory={inventory} hostProfile={hostProfile} />;
  }, [hostProfile, inventory, listing, mounted]);

  return body;
}
