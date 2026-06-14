import { readLocalSession, type AppAccessRole } from "@/lib/session";
import { normalizeRole } from "@/lib/auth/roles";
import { canCreateListing, canDeleteListing, canEditListing, canModerateListings, isAuthenticatedSession } from "@/lib/auth/permissions";
import type { ListingWizardInput } from "@/lib/validators/listing";
import { buildListingThumbnail } from "@/lib/listing-thumbnail";
import { getListingApprovalExpiry, isPublicListingStatus, normalizeListingStatus, normalizeModerationState, type ListingModerationState, type ListingStatus, listingReviewValidityMs } from "@/lib/listings/status";
import { ensureVerificationRequest, getVerificationSummary, updateVerificationChecklist } from "@/lib/verification/requests";
import { resolveGoogleMapsUrl } from "@/lib/google-maps";

type ListingBaseRecord = {
  id: string;
  slug: string;
  ownerId: string;
  createdAt: number;
  title: string;
  city: string;
  locality: string;
  address: string;
  googleMapsUrl?: string;
  // Legacy optional fields. Latitude/longitude are no longer required for
  // listing creation; they are kept for backwards compatibility.
  latitude?: number;
  longitude?: number;
  genderPreference: "male" | "female" | "any";
  price: number;
  priceType: "monthly" | "daily" | "bedspace";
  spaceType: "pg" | "hostel" | "hotel" | "room" | "bed" | "lodge" | "apartment";
  nestscore: number;
  verified: boolean;
  reviewCount: number;
  status: ListingStatus;
  moderationState: ListingModerationState;
  rejectionReason: string | null;
  suspensionReason: string | null;
  approvedAt: number | null;
  reviewedAt: number | null;
  expiresAt: number | null;
  archivedAt: number | null;
  description: string;
  amenities: string[];
  mapPosition: { left: string; top: string };
  thumbnail: string;
};

export interface PersistedUser {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  role: AppAccessRole;
  phoneVerifiedAt: number | null;
  emailVerifiedAt: number | null;
  createdAt: number;
  lastLoginAt: number;
  loginCount: number;
}

export interface LoginEvent {
  id: string;
  userPhone: string;
  userEmail?: string | null;
  role: AppAccessRole;
  at: number;
}

export interface ListingInventoryItem extends ListingBaseRecord {
  kind: "hotel" | "pg" | "hostel" | "room" | "bed" | "apartment" | "lodge";
  totalUnits: number;
  availableUnits: number;
  hostUserPhone?: string;
}

export const archivedPropertyReasons = ["owner_removed", "admin_removed", "policy_violation", "duplicate_listing", "expired", "other"] as const;

export type ArchivedPropertyReason = (typeof archivedPropertyReasons)[number];

export interface ArchivedPropertyRecord {
  id: string;
  original_property_id: string;
  owner_id: string;
  owner_phone: string;
  owner_name: string;
  title: string;
  description: string;
  location: string;
  pricing: {
    amount: number;
    price_type: ListingInventoryItem["priceType"];
  };
  property_type: ListingInventoryItem["spaceType"];
  status: ListingInventoryItem["status"];
  archived_reason: ArchivedPropertyReason;
  archived_by: string;
  archived_at: number;
  original_created_at: number;
  restored_by: string | null;
  restored_at: number | null;
  snapshot: ListingInventoryItem;
}

export type ListingActor = Pick<PersistedUser, "id" | "phone" | "role">;

export type HostContactChannel = "in_app_chat" | "visit_request" | "call_request";

export interface HostResponsePreference {
  preferredChannel: HostContactChannel;
  responseWindow: "within_1_hour" | "within_4_hours" | "within_24_hours";
  availabilityNote: string;
}

export interface HostProfileRecord {
  id: string;
  userPhone: string;
  displayName: string;
  profilePhoto: string;
  verified: boolean;
  joinedAt: number;
  responsePreference: HostResponsePreference;
}

export interface PublicHostProfile {
  id: string;
  verificationSubjectId: string | null;
  displayName: string;
  profilePhoto: string;
  verified: boolean;
  joinedAt: number;
  responsePreference: HostResponsePreference;
  contactOptions: HostContactChannel[];
  activeListings: Array<Pick<ListingInventoryItem, "id" | "slug" | "title" | "city" | "locality" | "thumbnail" | "verified">>;
}

export interface BookingRecord {
  id: string;
  userPhone: string;
  listingId: string;
  listingSlug: string;
  listingTitle: string;
  listingKind: ListingInventoryItem["kind"];
  quantity: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  notes: string;
  bookedAt: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  amount: number;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  userPhone: string;
  amount: number;
  method: "upi" | "card" | "wallet";
  status: "pending" | "paid" | "refund_requested" | "refunded";
  createdAt: number;
  updatedAt: number;
}

export type LedgerStatus = "pending" | "processing" | "paid" | "failed";

export interface TransactionRecord {
  id: string;
  paymentId: string;
  bookingId: string;
  listingId: string;
  guestUserPhone: string;
  hostUserPhone: string | null;
  amount: number;
  status: LedgerStatus;
  createdAt: number;
  updatedAt: number;
}

export interface PayoutRecord {
  id: string;
  transactionId: string;
  paymentId: string;
  bookingId: string;
  listingId: string;
  hostUserPhone: string;
  amount: number;
  status: LedgerStatus;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
  note: string | null;
}

export interface PayoutProcessor {
  transitionPayout(input: { payout: PayoutRecord; nextStatus: LedgerStatus; note?: string }): { status: LedgerStatus; note?: string };
}

export interface ReviewRecord {
  id: string;
  listingId: string;
  listingSlug: string;
  userPhone: string;
  reviewerName: string;
  rating: number;
  text: string | null;
  createdAt: number;
}

export interface TrafficEvent {
  id: string;
  route: string;
  at: number;
  visitorId: string;
  role: AppAccessRole | "anonymous";
}

const storageKeys = {
  users: "nestmate.users.v1",
  hostProfiles: "nestmate.host-profiles.v1",
  loginEvents: "nestmate.login-events.v1",
  listings: "nestmate.listing-inventory.v1",
  archivedProperties: "nestmate.archived-properties.v1",
  bookings: "nestmate.bookings.v1",
  payments: "nestmate.payments.v1",
  transactions: "nestmate.transactions.v1",
  payouts: "nestmate.payouts.v1",
  traffic: "nestmate.traffic.v1",
  visitor: "nestmate.visitor-id.v1",
  reviews: "nestmate.reviews.v1",
} as const;

function canUseStorage() {
  return typeof window !== "undefined";
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function readList<T>(key: string, fallback: T[]) {
  if (!canUseStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeList<T>(key: string, value: T[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function inferListingKind(property: Pick<ListingBaseRecord, "spaceType">): ListingInventoryItem["kind"] {
  if (property.spaceType === "pg") return "pg";
  if (property.spaceType === "room") return "room";
  if (property.spaceType === "bed") return "bed";
  if (property.spaceType === "apartment") return "apartment";
  if (property.spaceType === "lodge") return "lodge";
  return "hotel";
}

function inferListingKindFromWizard(propertyType: ListingWizardInput["propertyType"]): ListingInventoryItem["kind"] {
  if (propertyType === "pg") return "pg";
  if (propertyType === "room") return "room";
  if (propertyType === "bed") return "bed";
  if (propertyType === "apartment") return "apartment";
  if (propertyType === "lodge") return "lodge";
  return "hotel";
}

function toSlug(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || makeId("listing")
  );
}

function buildMapPosition(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000;
  }

  const left = 18 + (hash % 62);
  const top = 18 + Math.floor((hash / 97) % 58);

  return {
    left: `${left}%`,
    top: `${top}%`,
  };
}

function buildHostAvatar(displayName: string) {
  const initial = (displayName.trim().charAt(0) || "H").toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#0f766e'/><stop offset='100%' stop-color='#f97316'/></linearGradient></defs><rect width='128' height='128' rx='30' fill='url(#g)'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' font-size='54' font-family='system-ui, sans-serif' font-weight='700' fill='white'>${initial}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function defaultResponsePreference(): HostResponsePreference {
  return {
    preferredChannel: "in_app_chat",
    responseWindow: "within_4_hours",
    availabilityNote: "Best available between 9 AM and 9 PM.",
  };
}

function mapPaymentStatusToLedgerStatus(status: PaymentRecord["status"]): LedgerStatus {
  if (status === "paid") return "paid";
  if (status === "refund_requested") return "processing";
  if (status === "refunded") return "failed";
  return "pending";
}

function getBookingByIdFromList(bookings: BookingRecord[], bookingId: string) {
  return bookings.find((booking) => booking.id === bookingId) ?? null;
}

function getListingByIdFromList(listings: ListingInventoryItem[], listingId: string) {
  return listings.find((listing) => listing.id === listingId) ?? null;
}

function getArchivedPropertyByIdFromList(records: ArchivedPropertyRecord[], originalPropertyId: string) {
  return [...records]
    .filter((record) => record.original_property_id === originalPropertyId)
    .sort((left, right) => right.archived_at - left.archived_at)[0] ?? null;
}

function normalizeArchivedReason(value: string | null | undefined, fallback: ArchivedPropertyReason): ArchivedPropertyReason {
  return archivedPropertyReasons.includes(value as ArchivedPropertyReason) ? (value as ArchivedPropertyReason) : fallback;
}

function buildArchivedRecord(input: {
  listing: ListingInventoryItem;
  archivedReason: ArchivedPropertyReason;
  archivedBy: string;
  ownerName: string;
  ownerPhone: string;
}): ArchivedPropertyRecord {
  return {
    id: makeId("arc"),
    original_property_id: input.listing.id,
    owner_id: input.listing.ownerId,
    owner_phone: input.ownerPhone,
    owner_name: input.ownerName,
    title: input.listing.title,
    description: input.listing.description,
    location: `${input.listing.locality}, ${input.listing.city}`,
    pricing: {
      amount: input.listing.price,
      price_type: input.listing.priceType,
    },
    property_type: input.listing.spaceType,
    status: input.listing.status,
    archived_reason: input.archivedReason,
    archived_by: input.archivedBy,
    archived_at: Date.now(),
    original_created_at: input.listing.createdAt,
    restored_by: null,
    restored_at: null,
    snapshot: input.listing,
  };
}

function getArchivedOwnerName(ownerId: string, ownerPhone: string) {
  const user = getUsers().find((entry) => entry.id === ownerId || entry.phone === ownerPhone);
  return user?.name || "Nestmate user";
}

function readArchivedProperties() {
  return readList<ArchivedPropertyRecord>(storageKeys.archivedProperties, []);
}

function writeArchivedProperties(records: ArchivedPropertyRecord[]) {
  writeList(storageKeys.archivedProperties, records);
}

function archiveListingRecord(listing: ListingInventoryItem, archivedReason: ArchivedPropertyReason, archivedBy: string) {
  const archivedProperties = readArchivedProperties();
  const ownerPhone = listing.hostUserPhone ?? getUsers().find((user) => user.id === listing.ownerId)?.phone ?? "";
  const archivedRecord = buildArchivedRecord({
    listing,
    archivedReason,
    archivedBy,
    ownerName: getArchivedOwnerName(listing.ownerId, ownerPhone),
    ownerPhone,
  });

  writeArchivedProperties([archivedRecord, ...archivedProperties]);
  return archivedRecord;
}

export function getCurrentSessionUser(): ListingActor | null {
  const session = readLocalSession();
  if (!session) {
    return null;
  }

  const users = getUsers();
  return users.find((user) => user.id === session.userId) ?? users.find((user) => user.email === session.email) ?? users.find((user) => user.phone === session.phone) ?? null;
}

export function canManageListing(listing: ListingInventoryItem, actor: ListingActor | null = getCurrentSessionUser()) {
  return canEditListing(actor, listing);
}

const manualPayoutProcessor: PayoutProcessor = {
  transitionPayout(input) {
    return {
      status: input.nextStatus,
      note: input.note,
    };
  },
};

type LegacyListingLike = Partial<ListingBaseRecord> &
  Partial<ListingInventoryItem> & {
    ownerId?: string;
    owner_id?: string;
    createdAt?: number;
    created_at?: number;
    kind?: ListingInventoryItem["kind"];
    totalUnits?: number;
    availableUnits?: number;
    blacklisted?: boolean;
    hostUserPhone?: string;
  };

function applyListingLifecycleRules(listing: ListingInventoryItem, now = Date.now()) {
  if (listing.status === "approved") {
    const expiresAt = listing.expiresAt ?? getListingApprovalExpiry(listing.approvedAt ?? listing.createdAt, listingReviewValidityMs);

    if (expiresAt <= now) {
      return {
        ...listing,
        status: "expired" as const,
        expiresAt,
      };
    }

    return {
      ...listing,
      expiresAt,
    };
  }

  return listing;
}

function normalizeListingRecord(property: LegacyListingLike): ListingInventoryItem {
  const title = property.title ?? "Untitled stay";
  const city = property.city ?? "Unknown city";
  const locality = property.locality ?? "Unknown locality";
  const address = property.address && property.address.length > 0 ? property.address : `${locality}, ${city}`;
  const spaceType = property.spaceType ?? "pg";
  const kind = property.kind ?? inferListingKind({ spaceType });
  const users = getUsers();
  const now = Date.now();
  const matchedOwner =
    typeof property.ownerId === "string"
      ? property.ownerId
      : typeof property.owner_id === "string"
        ? property.owner_id
        : typeof property.hostUserPhone === "string"
          ? users.find((user) => user.phone === property.hostUserPhone)?.id ?? null
          : null;

  const nestscore = typeof property.nestscore === "number" ? property.nestscore : 0;
  const normalizedStatus = normalizeListingStatus(property.status, property.createdAt || property.created_at ? "draft" : "pending_review");
  const moderationState = normalizeModerationState(property.moderationState ?? (property.blacklisted ? "suspended" : null));
  const approvedAt = typeof property.approvedAt === "number" ? property.approvedAt : null;
  const reviewedAt = typeof property.reviewedAt === "number" ? property.reviewedAt : null;
  const rejectionReason = typeof property.rejectionReason === "string" ? property.rejectionReason : null;
  const suspensionReason = typeof property.suspensionReason === "string" ? property.suspensionReason : null;
  const archivedAt = typeof property.archivedAt === "number" ? property.archivedAt : null;
  const expiresAt = typeof property.expiresAt === "number" ? property.expiresAt : normalizedStatus === "approved" ? getListingApprovalExpiry(approvedAt ?? property.createdAt ?? now, listingReviewValidityMs) : null;
  const lifecycleStatus = normalizedStatus === "approved" && expiresAt !== null && expiresAt <= now ? "expired" : normalizedStatus;
  const propertyVerified = property.id ? getVerificationSummary("listing", property.id).levels.property.status === "approved" : false;

  return applyListingLifecycleRules({
    id: property.id ?? makeId("lst"),
    slug: property.slug ?? toSlug(`${title}-${city}-${locality}`),
    ownerId: matchedOwner ?? property.hostUserPhone ?? "",
    createdAt:
      typeof property.createdAt === "number"
        ? property.createdAt
        : typeof property.created_at === "number"
          ? property.created_at
          : Date.now(),
    title,
    city,
    locality,
    address,
    googleMapsUrl: property.googleMapsUrl,
    latitude: property.latitude,
    longitude: property.longitude,
    genderPreference: property.genderPreference ?? "any",
    price: property.price ?? 0,
    priceType: property.priceType ?? "monthly",
    spaceType,
    nestscore,
    verified: property.verified ?? propertyVerified,
    reviewCount: Math.max(0, property.reviewCount ?? 0),
    status: lifecycleStatus,
    moderationState,
    rejectionReason,
    suspensionReason,
    approvedAt,
    reviewedAt,
    expiresAt,
    archivedAt,
    description: property.description ?? "",
    amenities: property.amenities ?? [],
    mapPosition: property.mapPosition ?? buildMapPosition(`${title}-${city}-${locality}`),
    thumbnail:
      property.thumbnail ??
      buildListingThumbnail({
        title,
        city,
        locality,
        spaceType: spaceType as ListingInventoryItem["spaceType"],
        verified: property.verified ?? propertyVerified,
        nestscore,
        status: lifecycleStatus,
      }),
    kind,
    totalUnits: property.totalUnits ?? 0,
    availableUnits: property.availableUnits ?? 0,
    hostUserPhone: typeof property.hostUserPhone === "string" ? property.hostUserPhone : undefined,
  }, now);
}

export function getHostProfiles() {
  return readList<HostProfileRecord>(storageKeys.hostProfiles, []);
}

export function upsertHostProfile(input: {
  userPhone: string;
  displayName?: string;
  verified?: boolean;
  joinedAt?: number;
  profilePhoto?: string;
  responsePreference?: Partial<HostResponsePreference>;
}) {
  const profiles = getHostProfiles();
  const existing = profiles.find((profile) => profile.userPhone === input.userPhone);

  if (existing) {
    existing.displayName = input.displayName?.trim() || existing.displayName;
    existing.verified = input.verified ?? existing.verified;
    existing.joinedAt = input.joinedAt ?? existing.joinedAt;
    existing.profilePhoto = input.profilePhoto ?? existing.profilePhoto;
    existing.responsePreference = {
      ...existing.responsePreference,
      ...input.responsePreference,
    };
  } else {
    const displayName = input.displayName?.trim() || "Nestmate host";
    profiles.push({
      id: makeId("hst"),
      userPhone: input.userPhone,
      displayName,
      profilePhoto: input.profilePhoto ?? buildHostAvatar(displayName),
      verified: input.verified ?? false,
      joinedAt: input.joinedAt ?? Date.now(),
      responsePreference: {
        ...defaultResponsePreference(),
        ...input.responsePreference,
      },
    });
  }

  writeList(storageKeys.hostProfiles, profiles);
  return profiles.find((profile) => profile.userPhone === input.userPhone) ?? null;
}

function buildFallbackHostProfile(listing: ListingInventoryItem): PublicHostProfile {
  const displayName = `${listing.city} host team`;
  return {
    id: `fallback-${listing.id}`,
    verificationSubjectId: null,
    displayName,
    profilePhoto: buildHostAvatar(displayName),
    verified: false,
    joinedAt: Date.now(),
    responsePreference: {
      preferredChannel: "in_app_chat",
      responseWindow: "within_24_hours",
      availabilityNote: "Contact through in-app chat for a response from the host team.",
    },
    contactOptions: ["in_app_chat", "visit_request"],
    activeListings: [
      {
        id: listing.id,
        slug: listing.slug,
        title: listing.title,
        city: listing.city,
        locality: listing.locality,
        thumbnail: listing.thumbnail,
        verified: getVerificationSummary("listing", listing.id).levels.property.status === "approved",
      },
    ],
  };
}

export function getHostProfileForListing(listing: ListingInventoryItem): PublicHostProfile {
  const hostPhone = listing.hostUserPhone;
  if (!hostPhone) {
    return buildFallbackHostProfile(listing);
  }

  const profile = getHostProfiles().find((entry) => entry.userPhone === hostPhone);
  const users = getUsers();
  const user = users.find((entry) => entry.phone === hostPhone);
  const hostUserId = user?.id ?? null;
  const hostVerificationSummary = hostUserId ? getVerificationSummary("user", hostUserId) : null;
  const hostIsVerified = hostVerificationSummary
    ? hostVerificationSummary.levels.contact.status === "approved" && hostVerificationSummary.levels.owner.status === "approved"
    : false;
  const inventory = getListingInventory();
  const activeListings = inventory
    .filter((item) => item.hostUserPhone === hostPhone && isPublicListingStatus(item.status, item.moderationState))
    .slice(0, 6)
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      city: item.city,
      locality: item.locality,
      thumbnail: item.thumbnail,
      verified: getVerificationSummary("listing", item.id).levels.property.status === "approved",
    }));

  if (!profile) {
    const inferredName = user?.name || "Nestmate host";
    const inferred = upsertHostProfile({
      userPhone: hostPhone,
      displayName: inferredName,
      verified: Boolean(user && user.role === "admin"),
      joinedAt: user?.createdAt,
    });

    if (!inferred) {
      return buildFallbackHostProfile(listing);
    }

    return {
      id: inferred.id,
      verificationSubjectId: hostUserId,
      displayName: inferred.displayName,
      profilePhoto: inferred.profilePhoto,
      verified: hostIsVerified,
      joinedAt: inferred.joinedAt,
      responsePreference: inferred.responsePreference,
      contactOptions: ["in_app_chat", "visit_request", "call_request"],
      activeListings,
    };
  }

  return {
    id: profile.id,
    verificationSubjectId: hostUserId,
    displayName: profile.displayName,
    profilePhoto: profile.profilePhoto,
    verified: hostIsVerified,
    joinedAt: profile.joinedAt,
    responsePreference: profile.responsePreference,
    contactOptions: ["in_app_chat", "visit_request", "call_request"],
    activeListings,
  };
}

function applyReviewMetrics(listings: ListingInventoryItem[]) {
  const allReviews = getReviews();
  const ratingsByListing = new Map<string, number[]>();

  for (const review of allReviews) {
    const bucket = ratingsByListing.get(review.listingId) ?? [];
    bucket.push(review.rating);
    ratingsByListing.set(review.listingId, bucket);
  }

  return listings.map((listing) => {
    const ratings = ratingsByListing.get(listing.id) ?? [];
    if (ratings.length === 0) {
      return {
        ...listing,
        reviewCount: 0,
        nestscore: 0,
      };
    }

    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return {
      ...listing,
      reviewCount: ratings.length,
      nestscore: Math.round(average * 10) / 10,
    };
  });
}

function isLegacyDemoListing(listing: ListingInventoryItem) {
  return listing.id.startsWith("prop-");
}

export function getListingInventory() {
  const listings = readList<ListingInventoryItem>(storageKeys.listings, []);
  if (listings.length > 0) {
    const normalized = listings.map((listing) => normalizeListingRecord(listing));
    const filtered = normalized.filter((listing) => !isLegacyDemoListing(listing));
    const withReviewMetrics = applyReviewMetrics(filtered);
    if (withReviewMetrics.some((listing, index) => JSON.stringify(listing) !== JSON.stringify(listings[index]))) {
      writeList(storageKeys.listings, withReviewMetrics);
    }

    return withReviewMetrics;
  }

  // If there are no stored listings, return empty list (do not seed dummy data).
  return [];
}

export function getPublicListingInventory() {
  return getListingInventory().filter((listing) => isPublicListingStatus(listing.status, listing.moderationState));
}

export function updateListingInventory(next: ListingInventoryItem[]) {
  writeList(storageKeys.listings, next);
}

export function getArchivedProperties() {
  return readArchivedProperties().sort((left, right) => right.archived_at - left.archived_at);
}

export function getArchivedPropertiesForOwner(ownerId: string) {
  return getArchivedProperties().filter((record) => record.owner_id === ownerId);
}

export function getListingBySlug(slug: string) {
  return getListingInventory().find((listing) => listing.slug === slug) ?? null;
}

export function getPublicListingBySlug(slug: string) {
  return getPublicListingInventory().find((listing) => listing.slug === slug) ?? null;
}

export function updateListingById(listingId: string, patch: Partial<ListingInventoryItem>) {
  const listings = getListingInventory();
  const target = getListingByIdFromList(listings, listingId);

  if (!target) {
    throw new Error("Listing not found.");
  }

  if (!canEditListing(getCurrentSessionUser(), target)) {
    throw new Error("Only the listing owner or an admin can edit this listing.");
  }

  const actor = getCurrentSessionUser();
  const editablePatch = { ...(patch as Partial<ListingInventoryItem> & {
    id?: string;
    slug?: string;
    ownerId?: string;
    createdAt?: number;
    hostUserPhone?: string;
    kind?: ListingInventoryItem["kind"];
  }) };

  delete editablePatch.ownerId;
  delete editablePatch.createdAt;
  delete editablePatch.hostUserPhone;
  delete editablePatch.id;
  delete editablePatch.slug;
  delete editablePatch.kind;

  if (!canModerateListings(actor)) {
    delete editablePatch.status;
    delete editablePatch.moderationState;
    delete editablePatch.rejectionReason;
    delete editablePatch.suspensionReason;
    delete editablePatch.approvedAt;
    delete editablePatch.reviewedAt;
    delete editablePatch.expiresAt;
    delete editablePatch.archivedAt;
  }

  const next = listings.map((listing) => (listing.id === listingId ? { ...listing, ...editablePatch } : listing));
  updateListingInventory(next);
}

function archiveActiveListing(listingId: string, reason?: string) {
  const listings = getListingInventory();
  const target = getListingByIdFromList(listings, listingId);

  if (!target) {
    throw new Error("Listing not found.");
  }

  const actor = getCurrentSessionUser();
  if (!canDeleteListing(actor, target) && !canModerateListings(actor)) {
    throw new Error("Only the listing owner or an admin can archive this listing.");
  }

  const fallbackReason = target.status === "expired" ? "expired" : actor?.role === "admin" ? "admin_removed" : "owner_removed";
  const archivedReason = normalizeArchivedReason(reason, fallbackReason);
  const archivedRecord = archiveListingRecord(target, archivedReason, actor?.id ?? "system");
  updateListingInventory(listings.filter((listing) => listing.id !== listingId));
  return archivedRecord;
}

export function approveListingById(listingId: string) {
  const listings = getListingInventory();
  const target = getListingByIdFromList(listings, listingId);

  if (!target) {
    throw new Error("Listing not found.");
  }

  if (!canModerateListings(getCurrentSessionUser())) {
    throw new Error("Only admins can approve listings.");
  }

  const now = Date.now();
  const next = listings.map((listing) =>
    listing.id === listingId
      ? {
          ...listing,
          status: "approved" as const,
          moderationState: "active" as const,
          approvedAt: now,
          reviewedAt: now,
          rejectionReason: null,
          suspensionReason: null,
          archivedAt: null,
          expiresAt: getListingApprovalExpiry(now, listingReviewValidityMs),
        }
      : listing,
  );

  updateListingInventory(next);
}

export function rejectListingById(listingId: string, reason: string) {
  const listings = getListingInventory();
  const target = getListingByIdFromList(listings, listingId);

  if (!target) {
    throw new Error("Listing not found.");
  }

  if (!canModerateListings(getCurrentSessionUser())) {
    throw new Error("Only admins can reject listings.");
  }

  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    throw new Error("A rejection reason is required.");
  }

  const now = Date.now();
  const next = listings.map((listing) =>
    listing.id === listingId
      ? {
          ...listing,
          status: "rejected" as const,
          moderationState: "active" as const,
          reviewedAt: now,
          rejectionReason: trimmedReason,
          suspensionReason: null,
          approvedAt: null,
          expiresAt: null,
        }
      : listing,
  );

  updateListingInventory(next);
}

export function suspendListingById(listingId: string, reason?: string) {
  const listings = getListingInventory();
  const target = getListingByIdFromList(listings, listingId);

  if (!target) {
    throw new Error("Listing not found.");
  }

  if (!canModerateListings(getCurrentSessionUser())) {
    throw new Error("Only admins can suspend listings.");
  }

  const next = listings.map((listing) =>
    listing.id === listingId
      ? {
          ...listing,
          moderationState: "suspended" as const,
          suspensionReason: reason?.trim() || listing.suspensionReason || "Suspended by admin.",
        }
      : listing,
  );

  updateListingInventory(next);
}

export function restoreListingById(listingId: string, reason?: string) {
  const archivedProperties = readArchivedProperties();
  const target = getArchivedPropertyByIdFromList(archivedProperties, listingId);

  if (!target) {
    throw new Error("Archived listing not found.");
  }

  if (!canModerateListings(getCurrentSessionUser())) {
    throw new Error("Only admins can restore archived listings.");
  }

  const listings = getListingInventory();
  const restoredListing = normalizeListingRecord({
    ...target.snapshot,
    ownerId: target.owner_id,
    createdAt: target.original_created_at,
    archivedAt: null,
    moderationState: "active",
    status: target.snapshot.status === "approved" ? "approved" : target.snapshot.status === "draft" ? "draft" : "pending_review",
  });

  const nextListings = listings.some((listing) => listing.id === restoredListing.id) ? listings : [restoredListing, ...listings];
  updateListingInventory(nextListings);

  const now = Date.now();
  const nextArchived = archivedProperties.map((record) =>
    record.id === target.id
      ? {
          ...record,
          restored_by: getCurrentSessionUser()?.id ?? "system",
          restored_at: now,
        }
      : record,
  );

  writeArchivedProperties(nextArchived);

  return restoredListing;
}

export function archiveListingById(listingId: string, reason?: string) {
  return archiveActiveListing(listingId, reason);
}

export function renewExpiredListingById(listingId: string) {
  const listings = getListingInventory();
  const target = getListingByIdFromList(listings, listingId);

  if (!target) {
    throw new Error("Listing not found.");
  }

  if (!canEditListing(getCurrentSessionUser(), target)) {
    throw new Error("Only the listing owner or an admin can renew this listing.");
  }

  if (target.status !== "expired") {
    throw new Error("Only expired listings can be renewed.");
  }

  const next = listings.map((listing) =>
    listing.id === listingId
      ? {
          ...listing,
          status: "pending_review" as const,
          moderationState: "active" as const,
          rejectionReason: null,
          suspensionReason: null,
          reviewedAt: null,
          approvedAt: null,
          archivedAt: null,
          expiresAt: null,
        }
      : listing,
  );

  updateListingInventory(next);
}

export function deleteListingById(listingId: string) {
  return archiveActiveListing(listingId);
}

export function createListingFromWizard(input: ListingWizardInput) {
  const listings = getListingInventory();
  const now = Date.now();
  const actor = getCurrentSessionUser();

  if (!actor || !canCreateListing(actor)) {
    throw new Error("Only owners and admins can create listings.");
  }

  const currentActor = actor;
  const localSession = readLocalSession();
  const hostUserPhone = localSession?.phone || localSession?.email || currentActor.phone;
  const slugBase = toSlug(`${input.title}-${input.city}-${input.locality}`);
  const slug = listings.some((listing) => listing.slug === slugBase) ? `${slugBase}-${now.toString(36)}` : slugBase;
  const explicitGoogleMapsUrl = typeof input.googleMapsUrl === "string" && input.googleMapsUrl.trim().length > 0 ? input.googleMapsUrl.trim() : null;
  const listing: ListingInventoryItem = {
    id: makeId("lst"),
    slug,
    ownerId: currentActor.id,
    createdAt: now,
    title: input.title,
    city: input.city,
    locality: input.locality,
    address: input.address,
    googleMapsUrl: resolveGoogleMapsUrl({ title: input.title, locality: input.locality, city: input.city }, explicitGoogleMapsUrl),
    latitude: input.latitude,
    longitude: input.longitude,
    genderPreference: input.genderPreference,
    price: input.price,
    priceType: input.priceType,
    spaceType: input.propertyType,
    nestscore: 0,
    verified: false,
    reviewCount: 0,
    status: "pending_review",
    moderationState: "active",
    rejectionReason: null,
    suspensionReason: null,
    approvedAt: null,
    reviewedAt: null,
    expiresAt: null,
    archivedAt: null,
    description: input.description,
    amenities: input.amenities,
    mapPosition: buildMapPosition(slug),
    kind: inferListingKindFromWizard(input.propertyType),
    totalUnits: 0,
    availableUnits: 0,
    hostUserPhone,
    thumbnail: buildListingThumbnail({
      title: input.title,
      city: input.city,
      locality: input.locality,
      spaceType: input.propertyType,
      verified: false,
      nestscore: 0,
      status: "pending_review",
      reviewCount: 0,
    }),
  };

  if (hostUserPhone) {
    upsertHostProfile({
      userPhone: hostUserPhone,
      displayName: localSession?.name,
      joinedAt: localSession?.signedInAt,
      verified: false,
    });
  }

  updateListingInventory([listing, ...listings]);
  return listing;
}

export function upsertUserOnLogin(input: { id?: string; phone?: string | null; name: string; role: AppAccessRole; email: string }) {
  const users = getUsers();
  const now = Date.now();
  const phone = input.phone?.trim() || "";
  const email = input.email.trim().toLowerCase();
  const contactKey = phone || email;
  const existing = users.find((user) => user.id === input.id || user.email === email || (phone && user.phone === phone));
  const nextRole = normalizeRole(input.role) ?? input.role;

  if (existing) {
    existing.id = input.id ?? existing.id;
    existing.name = input.name || existing.name;
    existing.role = nextRole;
    existing.email = email;
    existing.phone = contactKey;
    existing.emailVerifiedAt = now;
    existing.lastLoginAt = now;
    existing.loginCount += 1;
  } else {
    users.push({
      id: input.id ?? makeId("usr"),
      phone: contactKey,
      name: input.name || "Nestmate user",
      email,
      role: nextRole,
      phoneVerifiedAt: null,
      emailVerifiedAt: now,
      createdAt: now,
      lastLoginAt: now,
      loginCount: 1,
    });
  }

  writeList(storageKeys.users, users);

  const currentUser = users.find((user) => user.id === input.id || user.email === email || user.phone === contactKey) ?? null;
  if (currentUser) {
    const contactRequest = ensureVerificationRequest({
      subjectType: "user",
      subjectId: currentUser.id,
      subjectLabel: currentUser.name,
      level: "contact",
      requesterUserId: currentUser.id,
      requesterPhone: currentUser.phone,
      checklist: {
        email_verified: Boolean(currentUser.emailVerifiedAt),
      },
    });

    updateVerificationChecklist({
      requestId: contactRequest.id,
      checklistItemKey: "email_verified",
      completed: true,
    });
  }

  if (currentUser && canCreateListing(currentUser)) {
    upsertHostProfile({
      userPhone: currentUser.phone,
      displayName: currentUser.name,
      joinedAt: currentUser.createdAt,
      verified: canModerateListings(currentUser),
    });
  }

  const events = readList<LoginEvent>(storageKeys.loginEvents, []);
  events.unshift({
    id: makeId("lgn"),
    userPhone: contactKey,
    userEmail: email,
    role: nextRole,
    at: now,
  });
  writeList(storageKeys.loginEvents, events.slice(0, 200));

  return currentUser;
}

export function getUsers() {
  const users = readList<PersistedUser>(storageKeys.users, []);
  const normalized = users.map((user) => ({
    ...user,
    phone: typeof user.phone === "string" ? user.phone : user.email ?? "",
    role: normalizeRole(user.role) ?? "user",
    email: typeof user.email === "string" ? user.email : null,
    phoneVerifiedAt: typeof user.phoneVerifiedAt === "number" ? user.phoneVerifiedAt : null,
    emailVerifiedAt: typeof user.emailVerifiedAt === "number" ? user.emailVerifiedAt : null,
  }));

  if (normalized.some((user, index) => user.role !== users[index]?.role)) {
    writeList(storageKeys.users, normalized);
  }

  return normalized;
}

export function getLoginEvents() {
  const events = readList<LoginEvent>(storageKeys.loginEvents, []);
  const normalized = events.map((event) => ({
    ...event,
    role: normalizeRole(event.role) ?? event.role,
  }));

  if (normalized.some((event, index) => event.role !== events[index]?.role)) {
    writeList(storageKeys.loginEvents, normalized);
  }

  return normalized;
}

export function getBookings(userPhone?: string) {
  const allBookings = readList<BookingRecord>(storageKeys.bookings, []);
  return userPhone ? allBookings.filter((booking) => booking.userPhone === userPhone) : allBookings;
}

export function getBookingById(id: string) {
  return getBookings().find((booking) => booking.id === id) ?? null;
}

export function createBooking(input: {
  userPhone: string;
  listingSlug: string;
  quantity: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  notes: string;
}) {
  // Prevent guests from creating bookings
  const users = getUsers();
  const user = users.find((u) => u.phone === input.userPhone || u.email === input.userPhone);
  if (!isAuthenticatedSession(user)) {
    throw new Error("Please sign in to create bookings.");
  }
  const listingInventory = getListingInventory();
  const listing = listingInventory.find((item) => item.slug === input.listingSlug);

  if (!listing) {
    throw new Error("Listing not found.");
  }

  if (!isPublicListingStatus(listing.status, listing.moderationState)) {
    throw new Error("This listing is not available for booking.");
  }

  if (listing.availableUnits > 0 && input.quantity > listing.availableUnits) {
    throw new Error("Requested quantity is not available.");
  }

  const amount = listing.price * input.quantity;
  const booking: BookingRecord = {
    id: makeId("bok"),
    userPhone: input.userPhone,
    listingId: listing.id,
    listingSlug: listing.slug,
    listingTitle: listing.title,
    listingKind: listing.kind,
    quantity: input.quantity,
    checkInDate: input.checkInDate,
    checkOutDate: input.checkOutDate,
    guestCount: input.guestCount,
    notes: input.notes,
    bookedAt: Date.now(),
    status: "pending",
    amount,
  };

  const bookings = readList<BookingRecord>(storageKeys.bookings, []);
  bookings.unshift(booking);
  writeList(storageKeys.bookings, bookings);

  const updatedListings = listingInventory.map((item) =>
    item.id === listing.id
      ? {
          ...item,
          availableUnits: item.availableUnits > 0 ? Math.max(0, item.availableUnits - input.quantity) : 0,
        }
      : item,
  );
  updateListingInventory(updatedListings);

  return booking;
}

export function getPayments(userPhone?: string) {
  const allPayments = readList<PaymentRecord>(storageKeys.payments, []);
  return userPhone ? allPayments.filter((payment) => payment.userPhone === userPhone) : allPayments;
}

export function getTransactions(userPhone?: string) {
  const allTransactions = readList<TransactionRecord>(storageKeys.transactions, []);
  return userPhone ? allTransactions.filter((transaction) => transaction.guestUserPhone === userPhone || transaction.hostUserPhone === userPhone) : allTransactions;
}

export function getPayouts(hostUserPhone?: string) {
  const allPayouts = readList<PayoutRecord>(storageKeys.payouts, []);
  return hostUserPhone ? allPayouts.filter((payout) => payout.hostUserPhone === hostUserPhone) : allPayouts;
}

export function getPendingPayouts() {
  return getPayouts().filter((payout) => payout.status === "pending");
}

function upsertTransactionForPayment(payment: PaymentRecord) {
  const transactions = readList<TransactionRecord>(storageKeys.transactions, []);
  const bookings = getBookings();
  const booking = getBookingByIdFromList(bookings, payment.bookingId);
  const listings = getListingInventory();
  const listing = booking ? getListingByIdFromList(listings, booking.listingId) : null;
  const hostUserPhone = listing?.hostUserPhone ?? null;
  const status = mapPaymentStatusToLedgerStatus(payment.status);

  const existing = transactions.find((transaction) => transaction.paymentId === payment.id);
  if (existing) {
    existing.status = status;
    existing.amount = payment.amount;
    existing.hostUserPhone = hostUserPhone;
    existing.updatedAt = Date.now();
    writeList(storageKeys.transactions, transactions);
    return existing;
  }

  if (!booking) {
    return null;
  }

  const created: TransactionRecord = {
    id: makeId("txn"),
    paymentId: payment.id,
    bookingId: booking.id,
    listingId: booking.listingId,
    guestUserPhone: payment.userPhone,
    hostUserPhone,
    amount: payment.amount,
    status,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  transactions.unshift(created);
  writeList(storageKeys.transactions, transactions);
  return created;
}

function ensurePayoutForTransaction(transaction: TransactionRecord) {
  if (!transaction.hostUserPhone || transaction.status !== "paid") {
    return null;
  }

  const payouts = readList<PayoutRecord>(storageKeys.payouts, []);
  const existing = payouts.find((payout) => payout.transactionId === transaction.id);
  if (existing) {
    return existing;
  }

  const payout: PayoutRecord = {
    id: makeId("pyt"),
    transactionId: transaction.id,
    paymentId: transaction.paymentId,
    bookingId: transaction.bookingId,
    listingId: transaction.listingId,
    hostUserPhone: transaction.hostUserPhone,
    amount: transaction.amount,
    status: "pending",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    completedAt: null,
    note: null,
  };

  payouts.unshift(payout);
  writeList(storageKeys.payouts, payouts);
  return payout;
}

export function updatePayoutStatus(input: {
  payoutId: string;
  nextStatus: LedgerStatus;
  note?: string;
  processor?: PayoutProcessor;
}) {
  const payouts = readList<PayoutRecord>(storageKeys.payouts, []);
  const payout = payouts.find((entry) => entry.id === input.payoutId);
  if (!payout) {
    throw new Error("Payout record not found.");
  }

  const transition = (input.processor ?? manualPayoutProcessor).transitionPayout({
    payout,
    nextStatus: input.nextStatus,
    note: input.note,
  });

  payout.status = transition.status;
  payout.note = transition.note ?? payout.note;
  payout.updatedAt = Date.now();
  payout.completedAt = transition.status === "paid" ? Date.now() : null;

  writeList(storageKeys.payouts, payouts);
  return payout;
}

export function setPayoutNote(input: { payoutId: string; note: string }) {
  const payouts = readList<PayoutRecord>(storageKeys.payouts, []);
  const payout = payouts.find((entry) => entry.id === input.payoutId);
  if (!payout) {
    throw new Error("Payout record not found.");
  }

  payout.note = input.note;
  payout.updatedAt = Date.now();

  writeList(storageKeys.payouts, payouts);
  return payout;
}

export function getReviews(listingId?: string) {
  const all = readList<ReviewRecord>(storageKeys.reviews, []);
  return listingId ? all.filter((r) => r.listingId === listingId) : all;
}

export function createReview(input: { listingId: string; listingSlug: string; userPhone: string; reviewerName: string; rating: number; text?: string | null }) {
  const bookings = getBookings(input.userPhone);
  const hasBooked = bookings.some((b) => b.listingId === input.listingId || b.listingSlug === input.listingSlug);

  if (!hasBooked) {
    throw new Error("Only users who have booked this property can submit a review.");
  }

  const reviews = readList<ReviewRecord>(storageKeys.reviews, []);
  const record: ReviewRecord = {
    id: makeId("rev"),
    listingId: input.listingId,
    listingSlug: input.listingSlug,
    userPhone: input.userPhone,
    reviewerName: input.reviewerName,
    rating: Math.max(1, Math.min(5, Math.round(input.rating * 10) / 10)),
    text: input.text ?? null,
    createdAt: Date.now(),
  };

  reviews.unshift(record);
  writeList(storageKeys.reviews, reviews);

  // Recompute listing trust metrics from real review records only.
  const listings = getListingInventory();
  const ratings = reviews.filter((r) => r.listingId === input.listingId).map((r) => r.rating);
  const average = ratings.length > 0 ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : 0;
  const updated = listings.map((l) =>
    l.id === input.listingId
      ? {
          ...l,
          reviewCount: ratings.length,
          nestscore: ratings.length > 0 ? Math.round(average * 10) / 10 : 0,
        }
      : l,
  );
  if (updated.some((u, i) => u !== listings[i])) {
    writeList(storageKeys.listings, updated);
  }

  return record;
}

export function getPaymentById(id: string) {
  return getPayments().find((payment) => payment.id === id) ?? null;
}

export function createPaymentForBooking(input: { bookingId: string; userPhone: string; amount: number }) {
  // Prevent guests from creating payments (extra safety)
  const users = getUsers();
  const user = users.find((u) => u.phone === input.userPhone || u.email === input.userPhone);
  if (!isAuthenticatedSession(user)) {
    throw new Error("Please sign in to create payments.");
  }

  const payments = readList<PaymentRecord>(storageKeys.payments, []);
  const existingPayment = payments.find((payment) => payment.bookingId === input.bookingId);

  if (existingPayment) {
    return existingPayment;
  }

  const payment: PaymentRecord = {
    id: makeId("pay"),
    bookingId: input.bookingId,
    userPhone: input.userPhone,
    amount: input.amount,
    method: "upi",
    status: "pending",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  payments.unshift(payment);
  writeList(storageKeys.payments, payments);

  // Track the guest-to-platform money movement in ledger form.
  upsertTransactionForPayment(payment);

  return payment;
}

export function setPaymentStatus(paymentId: string, status: PaymentRecord["status"], method?: PaymentRecord["method"]) {
  const payments = readList<PaymentRecord>(storageKeys.payments, []);
  const updatedPayments = payments.map((payment) =>
    payment.id === paymentId
      ? {
          ...payment,
          status,
          method: method ?? payment.method,
          updatedAt: Date.now(),
        }
      : payment,
  );
  writeList(storageKeys.payments, updatedPayments);

  const payment = updatedPayments.find((item) => item.id === paymentId);

  if (payment) {
    const transaction = upsertTransactionForPayment(payment);
    if (transaction) {
      ensurePayoutForTransaction(transaction);
    }

    const bookings = readList<BookingRecord>(storageKeys.bookings, []);
    const bookingStatus = status === "paid" ? "confirmed" : status === "refunded" ? "cancelled" : "pending";
    const updatedBookings = bookings.map((booking) =>
      booking.id === payment.bookingId
        ? {
            ...booking,
            status: bookingStatus,
          }
        : booking,
    );
    writeList(storageKeys.bookings, updatedBookings);
  }
}

export function getPaymentForBooking(bookingId: string) {
  return getPayments().find((payment) => payment.bookingId === bookingId) ?? null;
}

export function recordTrafficEvent(input: { route: string; role: AppAccessRole | "anonymous" }) {
  const traffic = readList<TrafficEvent>(storageKeys.traffic, []);
  const visitorId = getOrCreateVisitorId();

  traffic.unshift({
    id: makeId("trf"),
    route: input.route,
    at: Date.now(),
    visitorId,
    role: input.role,
  });

  writeList(storageKeys.traffic, traffic.slice(0, 1200));
}

export function getTrafficEvents() {
  return readList<TrafficEvent>(storageKeys.traffic, []);
}

function getOrCreateVisitorId() {
  if (!canUseStorage()) {
    return "server";
  }

  const existing = window.localStorage.getItem(storageKeys.visitor);
  if (existing) {
    return existing;
  }

  const next = makeId("vst");
  window.localStorage.setItem(storageKeys.visitor, next);
  return next;
}
