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
}) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("listings")
    .insert({
      ...payload,
      status: "pending",
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}