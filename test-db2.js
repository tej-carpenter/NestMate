const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data: user } = await supabase.from("users").select("id").limit(1).single();
  const userId = user ? user.id : "00000000-0000-0000-0000-000000000000";

  const statuses = ["pending", "processing", "paid", "failed", "refund_requested", "refunded", "success", "completed", "successful", "active", "draft"];
  for (const status of statuses) {
    const res = await supabase.from("transactions").insert({
      user_id: userId,
      amount: 100,
      transaction_type: "payment",
      payment_status: status,
      description: "test"
    });
    console.log(`TEST 3 (type: payment, status: ${status}):`, res.error ? res.error.message : "Success");
  }
}

test();
