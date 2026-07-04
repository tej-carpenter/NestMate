"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { BadgeCheck, CreditCard, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { formatRupee } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function PaymentPage({ params }: { params: Promise<{ bookingId: string }> | { bookingId: string } }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const resolvedParams = use(params as Promise<{ bookingId: string }>);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadBooking() {
      try {
        const supabase = createSupabaseBrowserClient();
        const [
          { data: bookingData, error: bookingError },
          { data: settingsData }
        ] = await Promise.all([
          supabase
            .from("bookings")
            .select(`
              *,
              listings!inner(title)
            `)
            .eq("id", resolvedParams.bookingId)
            .maybeSingle(),
          (supabase.from("platform_settings").select("*") as any).limit(1).maybeSingle()
        ]);

        if (bookingError) {
          console.error("Booking fetch error:", bookingError);
          if (active) setErrorMsg(bookingError.message);
        }

        if (active) {
          if (bookingData) {
            setBooking(bookingData);
          }
          if (settingsData) {
            setSettings(settingsData);
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

  useEffect(() => {
    if (booking && booking.booking_status === "confirmed" && booking.payment_status === "completed") {
      router.replace(`/payment/${booking.id}/receipt`);
    }
  }, [booking, router]);

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
            // Redirect to receipt directly
            router.replace(`/payment/${booking.id}/receipt`);
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
        <p className="mt-3 text-lg text-[color:var(--muted)]">Securely pay to confirm your stay at {booking.listings?.title}.</p>
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
                    onClick={() => router.push(`/payment/${booking.id}/receipt`)}
                  >
                    View Receipt
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="rounded-2xl border-2 border-[color:var(--brand)]/20 bg-[color:var(--brand)]/5 p-6 dark:border-[color:var(--brand)]/30 dark:bg-[color:var(--brand)]/10">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand)]/10 text-[color:var(--brand)] dark:bg-[color:var(--brand)]/20">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-[color:var(--foreground)]">Primary Payment Method</p>
                          <Chip className="!rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[color:var(--brand)] text-white border-0">Recommended</Chip>
                        </div>
                        <p className="mt-1 text-[14px] text-[color:var(--muted)]">Pay securely with Cards, UPI, or Netbanking via Razorpay.</p>
                        
                        <div className="mt-6">
                          <Button 
                            className="w-full h-14 text-[16px] font-semibold" 
                            onClick={handlePayment} 
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Processing..." : `Pay ${formatRupee(booking.rent_amount)} Now`}
                          </Button>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-center gap-2 text-[13px] font-medium text-[color:var(--muted)]">
                          <ShieldCheck className="h-4 w-4" />
                          Payments are 100% secure and encrypted
                        </div>
                      </div>
                    </div>
                  </div>

                  {settings?.razorpay_enabled && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="w-full border-t border-[color:var(--border)]"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-[color:var(--surface)] px-3 text-xs font-medium uppercase tracking-wider text-[color:var(--muted)]">Alternate Option</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 rounded-2xl bg-black/5 p-6 dark:bg-white/5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color:var(--foreground)] text-[color:var(--background)]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[color:var(--foreground)]">Direct UPI Transfer</p>
                          <p className="text-[14px] text-[color:var(--muted)]">Send payment directly to our universal UPI ID.</p>
                          
                          <div className="mt-4 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
                            <div className="flex items-center justify-between px-4 py-3">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">UPI ID</p>
                                <p className="mt-0.5 font-mono text-[16px] font-medium text-[color:var(--foreground)] select-all">9285457532-2@ybl</p>
                              </div>
                              <Button variant="outline" size="sm" className="h-8 gap-2" onClick={() => { navigator.clipboard.writeText('9285457532-2@ybl'); toast.success('UPI ID copied to clipboard'); }}>
                                Copy
                              </Button>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm font-medium text-[color:var(--foreground)]">Amount: <span className="font-bold">{formatRupee(booking.rent_amount)}</span></p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
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
