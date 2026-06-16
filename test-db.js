const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data: user } = await supabase.from("users").select("id").limit(1).single();
  const userId = user ? user.id : "00000000-0000-0000-0000-000000000000";

  const { data, error } = await supabase.from("transactions").insert({
    user_id: userId,
    amount: 100,
    transaction_type: "payment",
    payment_status: "pending",
    description: "test"
  });
  console.log("TEST 1 (type: payment, status: pending):", error ? error.message : "Success");

  const statuses = ["pending", "processing", "paid", "failed", "refund_requested", "refunded"];
  for (const status of statuses) {
    const res = await supabase.from("transactions").insert({
      user_id: userId,
      amount: 100,
      transaction_type: "booking",
      payment_status: status,
      description: "test"
    });
    console.log(`TEST 2 (type: booking, status: ${status}):`, res.error ? res.error.message : "Success");
  }
}

test();
