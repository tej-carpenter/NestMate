export type UserRole = "user" | "admin";

export interface UserRecord {
  id: string;
  phone: string | null;
  name: string | null;
  email: string | null;
  role: UserRole;
  aadhaar_verified: boolean;
  created_at: string;
}

export interface ListingRecord {
  id: string;
  host_id: string;
  slug: string;
  title: string;
  description: string;
  city: string;
  locality: string;
  address: string;
  google_maps_url: string | null;
  // Legacy optional fields. Latitude/longitude are no longer required for
  // listing creation; they are kept for backwards compatibility.
  latitude: number | null;
  longitude: number | null;
  space_type: "pg" | "room" | "bed" | "lodge" | "apartment";
  price: number;
  price_type: "monthly" | "daily" | "bedspace";
  amenities: string[];
  gender_preference: "male" | "female" | "any";
  images: string[];
  status: "draft" | "pending_review" | "approved" | "rejected" | "expired" | "archived";
  moderation_state: "active" | "suspended";
  rejection_reason: string | null;
  suspension_reason: string | null;
  approved_at: string | null;
  reviewed_at: string | null;
  expires_at: string | null;
  archived_at: string | null;
  created_at: string;
}

export type ArchivedPropertyReason = "owner_removed" | "admin_removed" | "policy_violation" | "duplicate_listing" | "expired" | "other";

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
    price_type: ListingRecord["price_type"];
  };
  property_type: ListingRecord["space_type"];
  status: ListingRecord["status"];
  archived_reason: ArchivedPropertyReason;
  archived_by: string;
  archived_at: string;
  original_created_at: string;
  restored_by: string | null;
  restored_at: string | null;
  listing_snapshot: ListingRecord;
}

export interface BookingRecord {
  id: string;
  listing_id: string;
  guest_id: string;
  move_in_date: string;
  rent_amount: number;
  deposit_amount: number;
  booking_status: "pending" | "confirmed" | "cancelled" | "completed";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  created_at: string;
}

export interface NestScoreRecord {
  id: string;
  listing_id: string;
  reviewer_id: string;
  safety_score: number;
  cleanliness_score: number;
  connectivity_score: number;
  value_score: number;
  food_score: number;
  overall_score: number;
  review_text: string | null;
  created_at: string;
}

export interface TransactionRecord {
  id: string;
  user_id: string;
  booking_id: string | null;
  amount: number;
  transaction_type: "booking" | "deposit" | "refund" | "wallet_topup" | "payout";
  payment_method: "upi" | "card" | "wallet" | "emi";
  payment_status: "pending" | "processing" | "paid" | "failed";
  razorpay_transaction_id: string | null;
  created_at: string;
}

export interface PayoutRecord {
  id: string;
  transaction_id: string;
  booking_id: string;
  host_id: string;
  amount: number;
  payout_status: "pending" | "processing" | "paid" | "failed";
  payout_processor: "manual" | "automated";
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  note: string | null;
}

export interface MessageRecord {
  id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  message_body: string;
  is_read: boolean;
  sent_at: string;
}

export type VerificationSubjectType = "user" | "listing";

export type VerificationLevel = "contact" | "owner" | "property" | "photos";

export type VerificationStatus = "draft" | "pending_review" | "needs_action" | "approved" | "rejected" | "revoked";

export interface VerificationRequestRecord {
  id: string;
  subject_type: VerificationSubjectType;
  subject_id: string;
  subject_label: string | null;
  level: VerificationLevel;
  status: VerificationStatus;
  approval_mode: "system" | "admin";
  checklist: Array<{
    key: string;
    label: string;
    completed: boolean;
    completed_at: string | null;
  }>;
  evidence_summary: string[];
  requester_user_id: string | null;
  requester_phone: string | null;
  reviewer_user_id: string | null;
  reviewer_phone: string | null;
  review_note: string | null;
  requested_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  updated_at: string;
}
