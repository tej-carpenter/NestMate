export interface MockProperty {
  id: string;
  slug: string;
  title: string;
  city: string;
  locality: string;
  address?: string;
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
  status: "draft" | "pending_review" | "approved" | "rejected" | "expired" | "archived";
  moderationState?: "active" | "suspended";
  rejectionReason?: string | null;
  description: string;
  amenities: string[];
  mapPosition: { left: string; top: string };
  thumbnail: string;
}
