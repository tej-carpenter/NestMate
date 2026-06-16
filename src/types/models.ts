import type { AppAccessRole } from "@/lib/session";
import type { ListingStatus, ListingModerationState } from "@/lib/listings/status";

export type ListingBaseRecord = {
  id: string;
  slug: string;
  ownerId: string;
  createdAt: number;
  title: string;
  city: string;
  locality: string;
  address: string;
  googleMapsUrl?: string;
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

export interface ListingInventoryItem extends ListingBaseRecord {
  kind: "hotel" | "pg" | "hostel" | "room" | "bed" | "apartment" | "lodge";
  totalUnits: number;
  availableUnits: number;
  hostUserPhone?: string;
}

export type ListingActor = {
  id: string;
  phone: string;
  role: AppAccessRole;
};

export type HostContactChannel = "in_app_chat" | "visit_request" | "call_request";

export interface HostResponsePreference {
  preferredChannel: HostContactChannel;
  responseWindow: "within_1_hour" | "within_4_hours" | "within_24_hours";
  availabilityNote: string;
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
