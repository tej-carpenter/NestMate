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
            <Card key={review.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{review.reviewerName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900">
                  {review.rating.toFixed(1)}
                </div>
              </div>
              <p className="mt-3 text-sm text-[color:var(--muted)]">{review.text}</p>
            </Card>
          ))
        ) : (
          <Card className="p-4 text-sm leading-6 text-[color:var(--muted)]">
            No reviews yet. This listing is awaiting resident feedback.
          </Card>
        )}
      </div>

      <div className="mt-6 rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
        <p className="text-sm font-semibold">Leave a review</p>
        <p className="mt-2 text-sm text-[color:var(--muted)]">Only users who booked this property can submit a review.</p>
        <form className="mt-3 grid gap-2" onSubmit={handleSubmit}>
          <Input value={rating} onChange={(e: ChangeEvent<HTMLInputElement>) => setRating(Number(e.target.value) || 5)} type="number" min={1} max={5} />
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your experience (optional)" />
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={!session}>Submit review</Button>
            {status ? <p className="text-sm text-[color:var(--muted)]">{status}</p> : null}
          </div>
        </form>
      </div>
    </div>
  );
}
