export type UserRole = "guest" | "host" | "admin";

export interface UserRecord {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  aadhaar_verified: boolean;
  created_at: string;
}

export interface ListingRecord {
  id: string;
  host_id: string;
  title: string;
  description: string;
  city: string;
  locality: string;
  latitude: number | null;
  longitude: number | null;
  space_type: "pg" | "room" | "bed" | "lodge" | "apartment";
  price: number;
  price_type: "monthly" | "daily" | "bedspace";
  amenities: string[];
  gender_preference: "male" | "female" | "any";
  images: string[];
  status: "draft" | "published" | "suspended";
  created_at: string;
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