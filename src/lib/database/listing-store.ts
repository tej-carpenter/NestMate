import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { getListingApprovalExpiry, isPublicListingStatus, normalizeListingStatus, normalizeModerationState } from "@/lib/listings/status";
import type { ListingRecord } from "@/lib/database/schema";

const storageDirectory = path.join(process.cwd(), ".nestmate-data");
const storageFile = path.join(storageDirectory, "listings.json");

export type ListingActor = {
  id: string;
  role: "owner" | "admin";
};

export type ListingCreateInput = {
  host_id: string;
  title: string;
  description: string;
  city: string;
  locality: string;
  latitude: number | null;
  longitude: number | null;
  space_type: ListingRecord["space_type"];
  price: number;
  price_type: ListingRecord["price_type"];
  amenities: string[];
  gender_preference: ListingRecord["gender_preference"];
  images: string[];
};

export type ListingUpdateInput = Partial<Pick<ListingRecord, "title" | "description" | "city" | "locality" | "latitude" | "longitude" | "space_type" | "price" | "price_type" | "amenities" | "gender_preference" | "images" | "status" | "moderation_state" | "rejection_reason" | "suspension_reason" | "approved_at" | "reviewed_at" | "expires_at" | "archived_at">>;

function nowIso() {
  return new Date().toISOString();
}

function createSlugSource(title: string, city: string, locality: string) {
  return `${title}-${city}-${locality}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `listing-${randomUUID().slice(0, 8)}`;
}

async function ensureStorageDirectory() {
  await fs.mkdir(storageDirectory, { recursive: true });
}

async function readRawListings(): Promise<ListingRecord[]> {
  try {
    const raw = await fs.readFile(storageFile, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    return Array.isArray(parsed) ? (parsed as ListingRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeRawListings(listings: ListingRecord[]) {
  await ensureStorageDirectory();
  await fs.writeFile(storageFile, JSON.stringify(listings, null, 2), "utf8");
}

function normalizeListing(listing: ListingRecord): ListingRecord {
  const status = normalizeListingStatus(listing.status, "draft");
  const moderationState = normalizeModerationState(listing.moderation_state);
  const slug = listing.slug || createSlugSource(listing.title, listing.city, listing.locality);
  const approvedAt = listing.approved_at ?? (status === "approved" ? nowIso() : null);
  const expiresAt =
    listing.expires_at ??
    (status === "approved" ? new Date(getListingApprovalExpiry(new Date(approvedAt ?? nowIso()).getTime())).toISOString() : null);

  return {
    ...listing,
    slug,
    status: status === "approved" && expiresAt && Date.parse(expiresAt) <= Date.now() ? "expired" : status,
    moderation_state: moderationState,
    rejection_reason: listing.rejection_reason ?? null,
    suspension_reason: listing.suspension_reason ?? null,
    approved_at: approvedAt,
    reviewed_at: listing.reviewed_at ?? null,
    expires_at: expiresAt,
    archived_at: listing.archived_at ?? null,
  };
}

export async function listListings(includeHidden = false) {
  const listings = (await readRawListings()).map(normalizeListing);
  return includeHidden ? listings : listings.filter((listing) => isPublicListingStatus(listing.status, listing.moderation_state));
}

export async function getListingById(listingId: string, includeHidden = true) {
  const listings = await listListings(includeHidden);
  return listings.find((listing) => listing.id === listingId) ?? null;
}

export async function getListingBySlug(slug: string, includeHidden = true) {
  const listings = await listListings(includeHidden);
  return listings.find((listing) => listing.slug === slug || createSlugSource(listing.title, listing.city, listing.locality) === slug) ?? null;
}

export async function createListing(input: ListingCreateInput, actor: ListingActor) {
  const listings = await listListings(true);
  const now = nowIso();
  const slugBase = createSlugSource(input.title, input.city, input.locality);
  const slug = listings.some((listing) => createSlugSource(listing.title, listing.city, listing.locality) === slugBase)
    ? `${slugBase}-${randomUUID().slice(0, 8)}`
    : slugBase;

  const listing: ListingRecord = {
    id: `lst-${randomUUID()}`,
    host_id: input.host_id || actor.id,
    slug,
    title: input.title,
    description: input.description,
    city: input.city,
    locality: input.locality,
    latitude: input.latitude,
    longitude: input.longitude,
    space_type: input.space_type,
    price: input.price,
    price_type: input.price_type,
    amenities: input.amenities,
    gender_preference: input.gender_preference,
    images: input.images,
    status: "pending_review",
    moderation_state: "active",
    rejection_reason: null,
    suspension_reason: null,
    approved_at: null,
    reviewed_at: now,
    expires_at: null,
    archived_at: null,
    created_at: now,
  };

  await writeRawListings([listing, ...listings]);
  return { ...listing, slug };
}

export async function updateListing(listingId: string, patch: ListingUpdateInput) {
  const listings = await listListings(true);
  const next = listings.map((listing) => (listing.id === listingId ? normalizeListing({ ...listing, ...patch }) : listing));
  await writeRawListings(next);
  return next.find((listing) => listing.id === listingId) ?? null;
}

export async function approveListing(listingId: string) {
  const now = nowIso();
  return updateListing(listingId, {
    status: "approved",
    moderation_state: "active",
    rejection_reason: null,
    suspension_reason: null,
    reviewed_at: now,
    approved_at: now,
    expires_at: new Date(getListingApprovalExpiry(Date.parse(now))).toISOString(),
    archived_at: null,
  });
}

export async function rejectListing(listingId: string, reason: string) {
  const now = nowIso();
  return updateListing(listingId, {
    status: "rejected",
    moderation_state: "active",
    rejection_reason: reason.trim(),
    suspension_reason: null,
    reviewed_at: now,
    approved_at: null,
    expires_at: null,
  });
}

export async function suspendListing(listingId: string, reason?: string) {
  return updateListing(listingId, {
    moderation_state: "suspended",
    suspension_reason: reason?.trim() || "Suspended by admin.",
  });
}

export async function archiveListing(listingId: string, reason?: string) {
  const now = nowIso();
  return updateListing(listingId, {
    status: "archived",
    moderation_state: "active",
    suspension_reason: reason?.trim() || null,
    archived_at: now,
    expires_at: null,
  });
}

export async function renewExpiredListing(listingId: string) {
  const now = nowIso();
  return updateListing(listingId, {
    status: "pending_review",
    moderation_state: "active",
    rejection_reason: null,
    suspension_reason: null,
    reviewed_at: now,
    approved_at: null,
    expires_at: null,
    archived_at: null,
  });
}