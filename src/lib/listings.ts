import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export async function createListing(payload: {
  host_id: string;
  title: string;
  description: string;
  city: string;
  locality: string;
  address: string;
  space_type: string;
  price: number;
  price_type: string;
  amenities: string[];
  gender_preference: string;
  expires_in_days?: string;
  available_units?: number;
}) {
  const supabase = createSupabaseBrowserClient();

  const expires_at = payload.expires_in_days 
    ? new Date(Date.now() + parseInt(payload.expires_in_days) * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { expires_in_days, ...restPayload } = payload;

  const { data, error } = await supabase
    .from("listings")
    .insert({
      ...restPayload,
      expires_at,
      status: "pending",
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}