import type { ListingWizardInput } from "@/lib/validators/listing";
import {
  approveListingById,
  archiveListingById,
  createListingFromWizard,
  getListingBySlug,
  getListingInventory,
  getPublicListingBySlug,
  getPublicListingInventory,
  rejectListingById,
  renewExpiredListingById,
  suspendListingById,
  type ListingInventoryItem,
} from "@/lib/local-data";

export type { ListingInventoryItem };

export function listAllListings() {
  return getListingInventory();
}

export function listPublicListings() {
  return getPublicListingInventory();
}

export function findListingById(listingId: string) {
  return getListingInventory().find((listing) => listing.id === listingId) ?? null;
}

export function findListingBySlug(slug: string) {
  return getListingBySlug(slug);
}

export function findPublicListingBySlug(slug: string) {
  return getPublicListingBySlug(slug);
}

export function createPendingReviewListing(input: ListingWizardInput) {
  return createListingFromWizard(input);
}

export function approveListing(listingId: string) {
  return approveListingById(listingId);
}

export function rejectListing(listingId: string, reason: string) {
  return rejectListingById(listingId, reason);
}

export function suspendListing(listingId: string, reason?: string) {
  return suspendListingById(listingId, reason);
}

export function archiveListing(listingId: string, reason?: string) {
  return archiveListingById(listingId, reason);
}

export function renewExpiredListing(listingId: string) {
  return renewExpiredListingById(listingId);
}