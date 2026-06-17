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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadBooking() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            *,
            listings!inner(title)
          `)
          .eq("id", resolvedParams.bookingId)
          .maybeSingle();

        if (error) {
          console.error("Booking fetch error:", error);
          if (active) setErrorMsg(error.message);
        }

        if (active) {
          if (data) {
            setBooking(data);
          }
          setMounted(true);
        }
      } catch (err: any) {
        if (active) {
          setErrorMsg(err.message || String(err));
          setMounted(true);
        }
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
          {errorMsg ? (
            <p className="mt-4 text-sm text-red-500 font-mono bg-red-500/10 p-2 rounded">{errorMsg}</p>
          ) : (
            <p className="mt-4 text-sm text-[color:var(--muted)] font-mono">ID: {resolvedParams.bookingId}</p>
          )}
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
      
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-5xl">Complete your payment</h1>
        <p className="mt-3 text-lg text-[color:var(--muted)]">Securely pay via Razorpay to confirm your stay at {booking.listings?.title}.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        {/* Left Column - Payment Flow */}
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-lg shadow-black/5 dark:shadow-white/5">
            <div className="border-b border-[color:var(--border)] p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[color:var(--foreground)]">Payment Details</h2>
            </div>
            
            <div className="p-6 sm:p-8">
              {isConfirmed ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                    <BadgeCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-emerald-950 dark:text-emerald-50">Payment Completed</h3>
                  <p className="mt-2 text-[15px] text-emerald-800 dark:text-emerald-200">Your transaction was successful. The booking is now confirmed.</p>
                  <Button 
                    className="mt-8 h-12 px-8 text-[15px] w-full sm:w-auto"
                    onClick={() => router.push("/guest/bookings")}
                  >
                    View My Bookings
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 rounded-2xl bg-black/5 p-6 dark:bg-white/5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--foreground)] text-[color:var(--background)]">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-[color:var(--foreground)]">Razorpay Checkout</p>
                      <p className="text-[14px] text-[color:var(--muted)]">Pay securely with Cards, UPI, or Netbanking</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 text-[16px] font-semibold" 
                    onClick={handlePayment} 
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : `Pay ${formatRupee(booking.rent_amount)} Now`}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-[13px] font-medium text-[color:var(--muted)]">
                    <ShieldCheck className="h-4 w-4" />
                    Payments are 100% secure and encrypted
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Booking Summary */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Card className="flex flex-col gap-6 overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-xl shadow-black/5 dark:shadow-white/5">
            <div>
              <p className="text-[14px] font-medium text-[color:var(--muted)]">Stay Summary</p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--foreground)] leading-tight">{booking.listings?.title}</h3>
            </div>
            
            <div className="grid gap-3 border-y border-[color:var(--border)] py-6">
              <div className="flex justify-between">
                <span className="text-[14px] font-medium text-[color:var(--muted)]">Check-in</span>
                <span className="text-[14px] font-medium text-[color:var(--foreground)]">{new Date(booking.move_in_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] font-medium text-[color:var(--muted)]">Check-out</span>
                <span className="text-[14px] font-medium text-[color:var(--foreground)]">{new Date(booking.move_out_date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[16px] font-semibold text-[color:var(--foreground)]">Total</span>
              <span className="text-[24px] font-bold text-[color:var(--foreground)]">{formatRupee(booking.rent_amount)}</span>
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}
