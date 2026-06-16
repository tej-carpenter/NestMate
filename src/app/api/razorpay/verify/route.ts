import { NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json({ error: "Razorpay secret not configured" }, { status: 500 });
    }

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // 1. Fetch booking to get the user ID and amount
    const { data: booking, error: bookingError } = await (supabase.from("bookings") as any)
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 2. Insert Transaction Record
    const { data: transaction, error: transactionError } = await (supabase.from("transactions") as any)
      .insert({
        user_id: booking.guest_id,
        booking_id: booking.id,
        amount: booking.rent_amount,
        transaction_type: "payment",
        payment_method: "upi", // Razorpay handles method internally, we just record upi/card. Hardcoding upi for now as requested by user's removal of card. Or just omit if not required. But payment_method is required.
        payment_status: "completed",
        razorpay_transaction_id: razorpay_payment_id,
        description: `Payment for booking ${booking.id}`,
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Transaction Error:", transactionError);
      return NextResponse.json({ error: "Failed to create transaction record" }, { status: 500 });
    }

    // 3. Update Booking Status
    const { error: updateError } = await (supabase.from("bookings") as any)
      .update({
        booking_status: "confirmed",
        payment_status: "completed",
      })
      .eq("id", booking.id);

    if (updateError) {
      console.error("Booking Update Error:", updateError);
      return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json({ error: "Failed to verify Razorpay payment" }, { status: 500 });
  }
}
