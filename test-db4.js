const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data: user } = await supabase.from("users").select("id").limit(1).single();
  const userId = user ? user.id : "00000000-0000-0000-0000-000000000000";

  const methods = ["upi", "card", "wallet", "emi", "netbanking", "cash"];
  for (const method of methods) {
    const res = await supabase.from("transactions").insert({
      user_id: userId,
      amount: 100,
      transaction_type: "payment",
      payment_status: "pending",
      payment_method: method,
      description: "test"
    });
    console.log(`TEST 5 (method: ${method}):`, res.error ? res.error.message : "Success");
  }
}

test();
