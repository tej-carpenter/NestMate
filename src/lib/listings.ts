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
  duration_days?: number;
  duration_hours?: number;
  available_units?: number;
  images?: string[];
  upi_id?: string;
}) {
  const supabase = createSupabaseBrowserClient();

  const totalHours = (payload.duration_days || 0) * 24 + (payload.duration_hours || 0);
  const expires_at = totalHours > 0 
    ? new Date(Date.now() + totalHours * 60 * 60 * 1000).toISOString()
    : null;

  const { duration_days, duration_hours, upi_id, ...restPayload } = payload;
  let finalDescription = payload.description;
  if (upi_id) {
    finalDescription = `${finalDescription}\n\n---UPI_ID:${upi_id}---`;
  }

  const { data, error } = await supabase
    .from("listings")
    .insert({
      ...restPayload,
      description: finalDescription,
      expires_at,
      status: "pending_review",
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}