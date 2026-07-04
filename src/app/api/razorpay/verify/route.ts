import { NextResponse } from "next/server";
import { paymentService } from "@/lib/payments/payment-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await req.json();

    const verification = await paymentService.verifyPayment({
      providerOrderId: razorpay_order_id,
      providerPaymentId: razorpay_payment_id,
      signature: razorpay_signature,
      bookingId,
    });

    if (!verification.success) {
      return NextResponse.json({ error: verification.message }, { status: 400 });
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
        provider_transaction_id: verification.transactionId,
        description: `Payment for booking ${booking.id}`,
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Transaction Error:", transactionError);
      return NextResponse.json({ error: "Failed to create transaction record" }, { status: 500 });
    }

    // 3. Update Booking Status and Decrement Listing Availability via RPC
    const { error: rpcError } = await (supabase as any).rpc("confirm_booking_payment_transaction", {
      p_booking_id: booking.id,
    });

    if (rpcError) {
      console.error("Booking Confirmation Error:", rpcError);
      return NextResponse.json({ error: "Failed to confirm booking and update availability" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment Verify Error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
