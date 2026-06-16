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
  restoreListingById,
} from "@/lib/local-data";
import type { ListingInventoryItem } from "@/types/models";

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

export function restoreListing(listingId: string, reason?: string) {
  return restoreListingById(listingId, reason);
}

export function archiveListing(listingId: string, reason?: string) {
  return archiveListingById(listingId, reason);
}

export function renewExpiredListing(listingId: string) {
  return renewExpiredListingById(listingId);
}