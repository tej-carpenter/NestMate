const Razorpay = require("razorpay");

async function testRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  console.log("Found Key ID:", key_id ? key_id.substring(0, 10) + "..." : "undefined");
  console.log("Found Secret:", key_secret ? key_secret.substring(0, 5) + "..." : "undefined");

  if (!key_id || !key_secret) {
    console.log("Keys missing in .env.local!");
    return;
  }

  try {
    const rzp = new Razorpay({ key_id, key_secret });
    const order = await rzp.orders.create({
      amount: 100, // 1 INR
      currency: "INR",
      receipt: "test_receipt",
    });
    console.log("SUCCESS! Keys are perfectly valid. Test order created:", order.id);
  } catch (error) {
    console.error("FAILED! Razorpay rejected the keys.");
    console.error(error);
  }
}

testRazorpay();
