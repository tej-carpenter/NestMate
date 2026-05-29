import type { AppAccessRole } from "@/lib/session";
import type { ListingWizardInput } from "@/lib/validators/listing";
import { buildListingThumbnail } from "@/lib/listing-thumbnail";

type ListingBaseRecord = {
  id: string;
  slug: string;
  title: string;
  city: string;
  locality: string;
  latitude?: number;
  longitude?: number;
  genderPreference: "male" | "female" | "any";
  price: number;
  priceType: "monthly" | "daily" | "bedspace";
  spaceType: "pg" | "room" | "bed" | "lodge" | "apartment";
  nestscore: number;
  verified: boolean;
  reviewCount: number;
  status: "draft" | "published" | "suspended";
  description: string;
  amenities: string[];
  mapPosition: { left: string; top: string };
  thumbnail: string;
};

export interface PersistedUser {
  id: string;
  phone: string;
  name: string;
  role: AppAccessRole;
  createdAt: number;
  lastLoginAt: number;
  loginCount: number;
}

export interface LoginEvent {
  id: string;
  userPhone: string;
  role: AppAccessRole;
  at: number;
}

export interface ListingInventoryItem extends ListingBaseRecord {
  kind: "hotel" | "pg" | "hostel" | "room" | "bed" | "apartment" | "lodge";
  totalUnits: number;
  availableUnits: number;
  blacklisted: boolean;
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
  loginEvents: "nestmate.login-events.v1",
  listings: "nestmate.listing-inventory.v1",
  bookings: "nestmate.bookings.v1",
  payments: "nestmate.payments.v1",
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

type LegacyListingLike = Partial<ListingBaseRecord> &
  Partial<ListingInventoryItem> & {
    kind?: ListingInventoryItem["kind"];
    totalUnits?: number;
    availableUnits?: number;
    blacklisted?: boolean;
  };

function normalizeListingRecord(property: LegacyListingLike): ListingInventoryItem {
  const title = property.title ?? "Untitled stay";
  const city = property.city ?? "Unknown city";
  const locality = property.locality ?? "Unknown locality";
  const spaceType = property.spaceType ?? "pg";
  const kind = property.kind ?? inferListingKind({ spaceType });

  const nestscore = typeof property.nestscore === "number" ? property.nestscore : 0;

  return {
    id: property.id ?? makeId("lst"),
    slug: property.slug ?? toSlug(`${title}-${city}-${locality}`),
    title,
    city,
    locality,
    latitude: property.latitude,
    longitude: property.longitude,
    genderPreference: property.genderPreference ?? "any",
    price: property.price ?? 0,
    priceType: property.priceType ?? "monthly",
    spaceType,
    nestscore,
    verified: property.verified ?? false,
    reviewCount: Math.max(0, property.reviewCount ?? 0),
    status: property.status ?? "draft",
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
        verified: property.verified ?? false,
        nestscore,
        status: property.status ?? "draft",
      }),
    kind,
    totalUnits: property.totalUnits ?? (spaceType === "bed" ? 2 : 12),
    availableUnits: property.availableUnits ?? (spaceType === "bed" ? 2 : 8),
    blacklisted: property.blacklisted ?? false,
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

export function updateListingInventory(next: ListingInventoryItem[]) {
  writeList(storageKeys.listings, next);
}

export function getListingBySlug(slug: string) {
  return getListingInventory().find((listing) => listing.slug === slug) ?? null;
}

export function updateListingById(listingId: string, patch: Partial<ListingInventoryItem>) {
  const listings = getListingInventory();
  const next = listings.map((listing) => (listing.id === listingId ? { ...listing, ...patch } : listing));
  updateListingInventory(next);
}

export function deleteListingById(listingId: string) {
  const listings = getListingInventory();
  const next = listings.filter((listing) => listing.id !== listingId);
  updateListingInventory(next);
}

export function createListingFromWizard(input: ListingWizardInput) {
  const listings = getListingInventory();
  const now = Date.now();
  const slugBase = toSlug(`${input.title}-${input.city}-${input.locality}`);
  const slug = listings.some((listing) => listing.slug === slugBase) ? `${slugBase}-${now.toString(36)}` : slugBase;
  const listing: ListingInventoryItem = {
    id: makeId("lst"),
    slug,
    title: input.title,
    city: input.city,
    locality: input.locality,
    latitude: input.latitude,
    longitude: input.longitude,
    genderPreference: input.genderPreference,
    price: input.price,
    priceType: input.priceType,
    spaceType: input.propertyType,
    nestscore: 0,
    verified: false,
    reviewCount: 0,
    status: "draft",
    description: input.description,
    amenities: input.amenities,
    mapPosition: buildMapPosition(slug),
    kind: inferListingKindFromWizard(input.propertyType),
    totalUnits: input.propertyType === "bed" ? 2 : 8,
    availableUnits: input.propertyType === "bed" ? 2 : 6,
    blacklisted: false,
    thumbnail: buildListingThumbnail({
      title: input.title,
      city: input.city,
      locality: input.locality,
      spaceType: input.propertyType,
      verified: false,
      nestscore: 0,
      status: "draft",
      reviewCount: 0,
    }),
  };

  updateListingInventory([listing, ...listings]);
  return listing;
}

export function upsertUserOnLogin(input: { phone: string; name: string; role: AppAccessRole }) {
  const users = readList<PersistedUser>(storageKeys.users, []);
  const now = Date.now();
  const existing = users.find((user) => user.phone === input.phone);

  if (existing) {
    existing.name = input.name || existing.name;
    existing.role = input.role;
    existing.lastLoginAt = now;
    existing.loginCount += 1;
  } else {
    users.push({
      id: makeId("usr"),
      phone: input.phone,
      name: input.name || "Nestmate user",
      role: input.role,
      createdAt: now,
      lastLoginAt: now,
      loginCount: 1,
    });
  }

  writeList(storageKeys.users, users);

  const events = readList<LoginEvent>(storageKeys.loginEvents, []);
  events.unshift({
    id: makeId("lgn"),
    userPhone: input.phone,
    role: input.role,
    at: now,
  });
  writeList(storageKeys.loginEvents, events.slice(0, 200));

  return users.find((user) => user.phone === input.phone) ?? null;
}

export function getUsers() {
  return readList<PersistedUser>(storageKeys.users, []);
}

export function getLoginEvents() {
  return readList<LoginEvent>(storageKeys.loginEvents, []);
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
  const user = users.find((u) => u.phone === input.userPhone);
  if (!user || user.role === "guest") {
    throw new Error("Guests cannot create bookings. Please sign in as a full user to book.");
  }
  const listingInventory = getListingInventory();
  const listing = listingInventory.find((item) => item.slug === input.listingSlug);

  if (!listing) {
    throw new Error("Listing not found.");
  }

  if (listing.blacklisted) {
    throw new Error("This listing is currently unavailable.");
  }

  if (input.quantity > listing.availableUnits) {
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
          availableUnits: Math.max(0, item.availableUnits - input.quantity),
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
  const user = users.find((u) => u.phone === input.userPhone);
  if (!user || user.role === "guest") {
    throw new Error("Guests cannot create payments. Please sign in as a full user.");
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
