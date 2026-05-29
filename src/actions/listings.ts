"use server";

import { listingWizardSchema } from "@/lib/validators/listing";

export async function createListingDraftAction(input: unknown) {
  const draft = listingWizardSchema.partial().parse(input);
  return { saved: true, draft } as const;
}

export async function publishListingAction(input: unknown) {
  const listing = listingWizardSchema.parse(input);
  return { published: true, listing } as const;
}