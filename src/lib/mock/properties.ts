export interface MockProperty {
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
  status: "draft" | "pending_review" | "approved" | "rejected" | "expired" | "archived";
  moderationState?: "active" | "suspended";
  rejectionReason?: string | null;
  description: string;
  amenities: string[];
  mapPosition: { left: string; top: string };
  thumbnail: string;
}
