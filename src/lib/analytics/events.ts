export type AnalyticsEventName =
  | "search_executed"
  | "listing_viewed"
  | "booking_started"
  | "booking_paid"
  | "message_sent"
  | "review_submitted";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  userId?: string;
  listingId?: string;
  bookingId?: string;
  properties?: Record<string, string | number | boolean>;
}