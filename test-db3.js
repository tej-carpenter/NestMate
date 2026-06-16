const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data: user } = await supabase.from("users").select("id").limit(1).single();
  const userId = user ? user.id : "00000000-0000-0000-0000-000000000000";

  const types = ["payment", "booking", "deposit", "refund", "wallet_topup", "payout", "withdrawal"];
  for (const type of types) {
    const res = await supabase.from("transactions").insert({
      user_id: userId,
      amount: 100,
      transaction_type: type,
      payment_status: "pending",
      description: "test"
    });
    console.log(`TEST 4 (type: ${type}):`, res.error ? res.error.message : "Success");
  }
}

test();
