"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { BadgeCheck, CreditCard, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupee } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function PaymentPage({ params }: { params: Promise<{ bookingId: string }> | { bookingId: string } }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const resolvedParams = use(params as Promise<{ bookingId: string }>);

  useEffect(() => {
    let active = true;

    async function loadBooking() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("bookings")
        .select(`
          *,
          listings!inner(title)
        `)
        .eq("id", resolvedParams.bookingId)
        .maybeSingle();

      if (active) {
        if (data) {
          setBooking(data);
        }
        setMounted(true);
      }
    }

    void loadBooking();

    return () => {
      active = false;
    };
  }, [resolvedParams.bookingId]);

  if (!mounted) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-10 sm:pb-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <Card className="h-[38rem] animate-pulse border-[color:var(--border)] bg-[color:var(--surface)]" />
          <Card className="h-[32rem] animate-pulse border-[color:var(--border)] bg-[color:var(--surface)]" />
        </div>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="mx-auto flex min-h-[50vh] w-full max-w-7xl flex-col items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[color:var(--foreground)]">Booking Not Found</h2>
          <p className="mt-2 text-[color:var(--muted)]">This booking does not exist or you don't have access.</p>
        </div>
      </main>
    );
  }

  const isConfirmed = booking.booking_status === "confirmed" && booking.payment_status === "completed";

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // 1. Create Razorpay Order
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "", 
        amount: data.order.amount,
        currency: "INR",
        name: "NestMate",
        description: `Payment for ${booking.listings?.title}`,
        order_id: data.order.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking.id,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Verification failed");
            }

            toast.success("Payment successful! Booking confirmed.");
            // Reload to show confirmed state
            window.location.reload();
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed.");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: "NestMate Guest",
          email: "guest@nestmate.com",
          contact: "9999999999",
        },
        theme: {
          color: "#0f172a",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment Failed: ${response.error.description}`);
        setIsProcessing(false);
      });

      rzp.open();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
      setIsProcessing(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-10 sm:pb-10 lg:px-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-4xl">Complete your payment</h1>
        <p className="mt-2 text-base text-[color:var(--muted)]">Securely pay via Razorpay to confirm your stay at {booking.listings?.title}.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        {/* Left Column - Payment Flow */}
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
            <div className="border-b border-[color:var(--border)] bg-slate-50/50 px-5 py-4 dark:bg-slate-900/50 sm:px-8">
              <h2 className="font-semibold text-[color:var(--foreground)]">Payment Details</h2>
            </div>
            
            <div className="p-5 sm:p-8">
              {isConfirmed ? (
                <div className="mt-2 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-6 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-50">
                  <div className="flex flex-col items-center justify-center text-center">
                    <BadgeCheck className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="mt-4 text-xl font-semibold">Payment Completed</h3>
                    <p className="mt-2 text-emerald-800 dark:text-emerald-200">Your transaction was successful. The booking is now confirmed.</p>
                    <Button 
                      className="mt-6 w-full sm:w-auto"
                      onClick={() => router.push("/guest/bookings")}
                    >
                      View My Bookings
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">Razorpay Checkout</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Pay securely with Cards, UPI, or Netbanking</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 text-lg" 
                    onClick={handlePayment} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : `Pay ${formatRupee(booking.rent_amount)} Now`}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-[color:var(--muted)]">
                    <ShieldCheck className="h-4 w-4" />
                    Payments are 100% secure and encrypted
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Booking Summary */}
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
            <div className="border-b border-[color:var(--border)] bg-slate-50/50 px-5 py-4 dark:bg-slate-900/50 sm:px-6">
              <h2 className="font-semibold text-[color:var(--foreground)]">Stay Summary</h2>
            </div>
            <div className="p-5 sm:p-6">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[color:var(--foreground)]">{booking.listings?.title}</h3>
              
              <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-900/50">
                <div className="flex justify-between text-[color:var(--muted)]">
                  <span>Check-in</span>
                  <span className="font-medium text-[color:var(--foreground)]">{new Date(booking.move_in_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-[color:var(--muted)]">
                  <span>Check-out</span>
                  <span className="font-medium text-[color:var(--foreground)]">{new Date(booking.move_out_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-6 border-t border-[color:var(--border)] pt-6">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[color:var(--foreground)]">Total</span>
                  <span className="text-2xl font-bold text-[color:var(--foreground)]">{formatRupee(booking.rent_amount)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
