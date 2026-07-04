"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateListingAvailability(listingId: string, newUnits: number) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // Ensure the user owns this listing
  const { data: listing, error: fetchError } = await (supabase.from("listings") as any)
    .select("host_id")
    .eq("id", listingId)
    .single();

  if (fetchError || !listing) {
    throw new Error("Listing not found");
  }

  if (listing.host_id !== user.id) {
    throw new Error("Forbidden: You do not own this listing");
  }

  // Use the RPC function created in our earlier migration
  const { error: updateError } = await (supabase as any).rpc("update_listing_availability", {
    p_listing_id: listingId,
    p_new_units: newUnits,
  });

  if (updateError) {
    console.error("Failed to update availability:", updateError);
    throw new Error("Failed to update listing availability");
  }

  revalidatePath("/host/dashboard");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/listings/${listingId}`);
  
  return { success: true };
}
