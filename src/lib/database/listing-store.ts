import { randomUUID } from "crypto";
import { getListingApprovalExpiry, isPublicListingStatus, normalizeListingStatus, normalizeModerationState } from "@/lib/listings/status";
import type { ListingRecord } from "@/lib/database/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export type ListingActor = {
  id: string;
  role: "user" | "admin";
};

export type ListingCreateInput = {
  host_id: string;
  title: string;
  description: string;
  city: string;
  locality: string;
  address: string;
  google_maps_url?: string | null;
  latitude: number | null;
  longitude: number | null;
  space_type: ListingRecord["space_type"];
  price: number;
  price_type: ListingRecord["price_type"];
  amenities: string[];
  gender_preference: ListingRecord["gender_preference"];
  images: string[];
};

export type ListingUpdateInput = Partial<Pick<ListingRecord, "title" | "description" | "city" | "locality" | "address" | "google_maps_url" | "latitude" | "longitude" | "space_type" | "price" | "price_type" | "amenities" | "gender_preference" | "images" | "status" | "moderation_state" | "rejection_reason" | "suspension_reason" | "approved_at" | "reviewed_at" | "expires_at" | "archived_at">>;

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

// Function to get a service role client to bypass RLS for admin operations in the store
function getServiceRoleClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase URL or Service Role Key");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function listListings(includeHidden = false) {
  const supabase = getServiceRoleClient();
  let query = (supabase.from("listings") as any).select("*");
  if (!includeHidden) {
    query = query.in("status", ["approved"]).in("moderation_state", ["active"]);
  }
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
  return data as ListingRecord[];
}

export async function getListingById(listingId: string, includeHidden = true) {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase.from("listings").select("*").eq("id", listingId).single();
  if (error || !data) return null;
  
  if (!includeHidden && (!isPublicListingStatus(data.status, data.moderation_state))) {
    return null;
  }
  
  return data as ListingRecord;
}

export async function getListingBySlug(slug: string, includeHidden = true) {
  const supabase = getServiceRoleClient();
  // slug might be the actual slug or generated on the fly. 
  // Wait, in Supabase we might not have 'slug' column properly populated in old data, or we do.
  const { data, error } = await supabase.from("listings").select("*").eq("slug", slug).single();
  
  if (error || !data) {
    // try finding by ID just in case
    return getListingById(slug, includeHidden);
  }

  if (!includeHidden && (!isPublicListingStatus(data.status, data.moderation_state))) {
    return null;
  }
  
  return data as ListingRecord;
}

export async function createListing(input: ListingCreateInput, actor: ListingActor) {
  const supabase = await createSupabaseServerClient();
  const slug = createSlugSource(input.title, input.city, input.locality);
  
  const listing = {
    host_id: input.host_id,
    title: input.title,
    description: input.description,
    city: input.city,
    locality: input.locality,
    address: input.address,
    google_maps_url: input.google_maps_url ?? null,
    latitude: input.latitude,
    longitude: input.longitude,
    space_type: input.space_type,
    price: input.price,
    price_type: input.price_type,
    amenities: input.amenities,
    gender_preference: input.gender_preference,
    images: input.images,
    status: "pending_review",
    slug,
    total_units: 1,
    available_units: 1,
  };

  const { data, error } = await (supabase.from("listings").insert(listing) as any).select().single();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}

export async function updateListing(listingId: string, patch: ListingUpdateInput) {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("listings")
    .update(patch)
    .eq("id", listingId)
    .select()
    .single();

  if (error) {
    console.error("Error updating listing:", error);
    return null;
  }
  
  return data as ListingRecord;
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

export async function restoreListing(listingId: string, reason?: string) {
  return updateListing(listingId, {
    status: "pending_review",
    moderation_state: "active",
    rejection_reason: null,
    suspension_reason: reason?.trim() || null,
    approved_at: null,
    reviewed_at: new Date().toISOString(),
    expires_at: null,
    archived_at: null,
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