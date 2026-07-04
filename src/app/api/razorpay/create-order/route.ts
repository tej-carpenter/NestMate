import { NextResponse } from "next/server";
import { paymentService } from "@/lib/payments/payment-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // Fetch booking details
    const { data: booking, error: bookingError } = await (supabase.from("bookings") as any)
      .select("*, listings!inner(title)")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.booking_status !== "pending") {
      return NextResponse.json({ error: "Booking is not pending" }, { status: 400 });
    }

    const amountInPaise = Math.round(booking.rent_amount * 100);

    const order = await paymentService.createOrder({
      amount: amountInPaise,
      currency: "INR",
      receiptId: `${booking.id}`,
      bookingId: booking.id,
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Payment Create Order Error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
