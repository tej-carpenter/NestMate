"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function NestScoreExplanation() {
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewedListings, setReviewedListings] = useState(0);
  const [awaitingFeedbackListings, setAwaitingFeedbackListings] = useState(0);
  const [listingCount, setListingCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const supabase = createSupabaseBrowserClient();
      
      const [listingsResponse, reviewsResponse] = await Promise.all([
        supabase.from("listings").select("id").eq("status", "approved"),
        supabase.from("reviews").select("listing_id")
      ]);

      const listings = listingsResponse.data || [];
      const reviews = reviewsResponse.data || [];

      const reviewedIds = new Set(reviews.map((review) => review.listing_id));

      setListingCount(listings.length);
      setReviewCount(reviews.length);
      setReviewedListings(reviewedIds.size);
      setAwaitingFeedbackListings(listings.filter((listing) => !reviewedIds.has(listing.id)).length);
    }

    fetchData();
  }, []);

  const overallState = useMemo(() => {
    if (reviewCount === 0) {
      return "Awaiting resident feedback";
    }

    return "Computed from verified review records";
  }, [reviewCount]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
      <Card className="p-6 sm:p-7">
        <Badge className="w-fit gap-2 border-teal-900/10 bg-teal-50 px-4 py-2 text-xs uppercase tracking-[0.18em] text-teal-950 dark:border-teal-400/20 dark:bg-teal-500/15 dark:text-teal-100">
          <BadgeCheck className="h-3.5 w-3.5" />
          NestScore transparency
        </Badge>

        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-tight text-slate-950 dark:text-slate-50 sm:text-5xl">
          Trust signals are shown only when real feedback exists.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Nestmate does not publish fabricated ratings or marketplace-wide percentages. Listings without verified reviews are shown as new and awaiting resident feedback.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Review records</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{reviewCount > 0 ? reviewCount : "No reviews yet"}</p>
          </div>
          <div className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Listings with feedback</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{reviewedListings > 0 ? reviewedListings : "Recently added"}</p>
          </div>
          <div className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Current state</p>
            <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-slate-50">{overallState}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-slate-950 dark:text-slate-50">Database-first rules</h2>
            <ShieldCheck className="h-5 w-5 text-teal-700 dark:text-teal-300" />
          </div>
          <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <div className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">Only verified booking activity can create a review record.</div>
            <div className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">If no reviews exist, listings show honest states like New listing and Awaiting resident feedback.</div>
            <div className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">No hardcoded percentages, satisfaction scores, or popularity indicators are shown.</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-slate-950 dark:text-slate-50">Current marketplace state</h2>
            <Users className="h-5 w-5 text-teal-700 dark:text-teal-300" />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {listingCount === 0
              ? "No listings are approved yet. NestScore states will appear as listings and reviews are created."
              : awaitingFeedbackListings > 0
                ? `${awaitingFeedbackListings} listings are awaiting first resident feedback.`
                : "All current listings with reviews already show live feedback data."}
          </p>
        </Card>
      </div>
    </div>
  );
}
