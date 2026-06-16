const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data: user } = await supabase.from("users").select("id").limit(1).single();
  const { data: listing } = await supabase.from("listings").select("id, host_id").limit(1).single();
  const userId = user ? user.id : "00000000-0000-0000-0000-000000000000";
  const listingId = listing ? listing.id : "00000000-0000-0000-0000-000000000000";
  const hostId = listing ? listing.host_id : userId;

  const statuses = ["pending", "paid", "completed", "failed", "refunded"];
  for (const status of statuses) {
    const res = await supabase.from("bookings").insert({
      listing_id: listingId,
      guest_id: userId,
      host_id: hostId,
      move_in_date: "2026-10-10",
      rent_amount: 10000,
      booking_status: "confirmed",
      payment_status: status,
    });
    console.log(`TEST 6 (booking payment_status: ${status}):`, res.error ? res.error.message : "Success");
  }
}

test();
