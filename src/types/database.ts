export type ListingRow = {
  id: string;
  host_id: string;

  title: string;
  description: string | null;

  city: string;
  locality: string;

  address: string | null;

  latitude: number | null;
  longitude: number | null;

  space_type: string;

  price: number;

  price_type: string;

  amenities: string[] | null;

  gender_preference: string | null;

  nestscore: number | null;
  images: string[] | null;
};