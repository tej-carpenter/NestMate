"use server";

import { z } from "zod";
import { calculateNestScore } from "@/lib/nestscore";

const reviewSchema = z.object({
  safety: z.number().min(1).max(5),
  cleanliness: z.number().min(1).max(5),
  connectivity: z.number().min(1).max(5),
  value: z.number().min(1).max(5),
  food: z.number().min(1).max(5),
  reviewText: z.string().max(4000).optional(),
});

export async function submitNestScoreReviewAction(input: unknown) {
  const parsed = reviewSchema.parse(input);
  const overall = calculateNestScore(parsed);

  return {
    submitted: true,
    overall,
  } as const;
}