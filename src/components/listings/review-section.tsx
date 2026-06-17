"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { loadSupabaseSessionProfile, readLocalSession } from "@/lib/session";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Review = {
  id: string;
  listingId: string;
  reviewerName: string;
  rating: number;
  text: string | null;
  createdAt: number;
};

export default function ReviewSection({ listingId, listingSlug }: { listingId: string; listingSlug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [session, setSession] = useState<ReturnType<typeof readLocalSession>>(null);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      const currentSession = readLocalSession();
      setSession(currentSession);
      try {
        const profile = await loadSupabaseSessionProfile();
        if (profile) setSession(profile);
      } catch (err) {
        // ignore
      }

      const supabase = createSupabaseBrowserClient();
      const { data } = await (supabase.from("reviews") as any)
        .select(`
          id, 
          listing_id, 
          overall_score, 
          review_text, 
          created_at,
          users:guest_id(name)
        `)
        .eq("listing_id", listingId)
        .order("created_at", { ascending: false });

      if (data) {
        setReviews(
          data.map((r: any) => ({
            id: r.id,
            listingId: r.listing_id,
            reviewerName: r.users?.name ?? "Guest",
            rating: Number(r.overall_score ?? 5),
            text: r.review_text,
            createdAt: new Date(r.created_at).getTime(),
          }))
        );
      }
    }

    fetchReviews();
  }, [listingId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session) {
      setStatus("Please login to submit a review.");
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await (supabase.from("reviews") as any)
        .insert({
          listing_id: listingId,
          guest_id: session.userId, // session.userId maps to users table id
          overall_score: rating,
          review_text: text,
          status: "published",
        })
        .select(`
          id, 
          listing_id, 
          overall_score, 
          review_text, 
          created_at
        `)
        .single();

      if (error) throw new Error(error.message);

      if (data) {
        const newReview: Review = {
          id: data.id,
          listingId: data.listing_id,
          reviewerName: session.name || "You",
          rating: Number(data.overall_score ?? 5),
          text: data.review_text,
          createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
        };
        setReviews((s) => [newReview, ...s]);
        setText("");
        setRating(5);
        setStatus("Review submitted");
      }
    } catch (err) {
      setStatus(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div>
      <div className="mt-5 grid gap-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id} className="p-6 rounded-[24px] border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm dark:shadow-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-bold text-[color:var(--foreground)]">{review.reviewerName}</p>
                  <p className="mt-0.5 text-[13px] font-medium text-[color:var(--muted)]">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--brand)] px-3 py-1 text-[13px] font-bold text-white dark:text-black">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {review.rating.toFixed(1)}
                </div>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--muted)]">{review.text}</p>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center rounded-[24px] border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm dark:shadow-white/5">
            <p className="text-[15px] font-medium text-[color:var(--muted)]">No reviews yet. This listing is awaiting resident feedback.</p>
          </Card>
        )}
      </div>

      <div className="mt-8 rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6 sm:p-8">
        <h4 className="text-[18px] font-semibold text-[color:var(--foreground)]">Leave a review</h4>
        <p className="mt-1 text-[14px] text-[color:var(--muted)]">Only users who booked this property can submit a review.</p>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[14px] font-medium text-[color:var(--foreground)]">Rating (1-5)</span>
              <Input className="h-12 rounded-xl" value={rating} onChange={(e: ChangeEvent<HTMLInputElement>) => setRating(Number(e.target.value) || 5)} type="number" min={1} max={5} />
            </label>
          </div>
          <label className="space-y-2">
            <span className="text-[14px] font-medium text-[color:var(--foreground)]">Share your experience</span>
            <Input className="h-12 rounded-xl" value={text} onChange={(e) => setText(e.target.value)} placeholder="What was your stay like?" />
          </label>
          <div className="mt-2 flex items-center gap-4">
            <Button type="submit" disabled={!session} className="h-12 px-8">Submit review</Button>
            {status ? <p className="text-[14px] font-medium text-[color:var(--muted)]">{status}</p> : null}
          </div>
        </form>
      </div>
    </div>
  );
}
