"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, ChevronDown, CreditCard, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupee } from "@/lib/format";
import { getBookingById, getPaymentById, setPaymentStatus } from "@/lib/local-data";

export default function PaymentPage({ params }: { params: Promise<{ paymentId: string }> | { paymentId: string } }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [payment, setPayment] = useState<ReturnType<typeof getPaymentById>>(null);
  const [booking, setBooking] = useState<ReturnType<typeof getBookingById>>(null);
  const [method, setMethod] = useState<"upi" | "card" | "wallet">("upi");
  const [paymentStatus, setPaymentStatusState] = useState<"pending" | "paid" | "refund_requested" | "refunded">("pending");
  const [status, setStatus] = useState<string | null>(null);

  const resolvedParams = use(params as Promise<{ paymentId: string }>);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const nextPayment = getPaymentById(resolvedParams.paymentId);
      setPayment(nextPayment);
      setBooking(nextPayment ? getBookingById(nextPayment.bookingId) : null);
      setMethod(nextPayment?.method ?? "upi");
      setPaymentStatusState(nextPayment?.status ?? "pending");
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(handle);
  }, [resolvedParams.paymentId]);

  const cashback = Math.max(0, Math.round((payment?.amount ?? 0) * 0.03));
  const walletCredit = Math.max(0, Math.round((payment?.amount ?? 0) * 0.05));

  if (!mounted) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-10 sm:pb-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <Card className="h-[38rem] animate-pulse border-white/70 bg-white/90 dark:border-white/10 dark:bg-slate-950/45" />
          <Card className="h-[32rem] animate-pulse border-[color:var(--border)] bg-[color:var(--surface)]" />
        </div>
      </main>
    );
  }

  if (!payment || !booking) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="p-6">
          <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">Payment not found</h1>
          <p className="mt-3 text-sm text-[color:var(--muted)]">This payment session does not exist.</p>
          <div className="mt-5">
            <Button onClick={() => router.push("/profile")}>Go to profile</Button>
          </div>
        </Card>
      </main>
    );
  }

  const currentPayment = payment;
  const currentBooking = booking;

  function markPaid() {
    setPaymentStatus(currentPayment.id, "paid", method);
    setPaymentStatusState("paid");
    setStatus("Payment completed. Booking is now confirmed.");
  }

  function requestRefund() {
    setPaymentStatus(currentPayment.id, "refund_requested", currentPayment.method);
    setPaymentStatusState("refund_requested");
    setStatus("Refund requested. Admin can review this request from the dashboard.");
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-10 sm:pb-10 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <Card className="overflow-hidden border-white/70 bg-white/90 p-0 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.3)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
          <div className="border-b border-[color:var(--border)] bg-[linear-gradient(135deg,rgba(15,118,110,0.16),rgba(255,255,255,0.96),rgba(20,184,166,0.10))] p-6 sm:p-8 dark:bg-[linear-gradient(135deg,rgba(15,118,110,0.22),rgba(15,23,42,0.92),rgba(20,184,166,0.12))]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900 dark:bg-teal-500/15 dark:text-teal-100">
                <CreditCard className="h-3.5 w-3.5" />
                NestPay checkout
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-100">
                <Wallet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Wallet support
              </span>
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-[color:var(--foreground)] sm:text-5xl">Complete payment</h1>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)] sm:text-base">
              {currentBooking.listingTitle} · {currentBooking.checkInDate} to {currentBooking.checkOutDate}
            </p>
            <details className="mt-5 rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-950 dark:text-slate-50">
                Payment context
                <ChevronDown className="h-4 w-4 text-slate-500 transition-transform open:rotate-180" />
              </summary>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Wallet ready", value: formatRupee(walletCredit) },
                  { label: "Cashback", value: formatRupee(cashback) },
                  { label: "Current state", value: paymentStatus.replace("_", " ") },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-slate-50">{item.value}</p>
                  </div>
                ))}
              </div>
            </details>
          </div>

          <div className="p-5 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-3">
              {(["upi", "card", "wallet"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMethod(option)}
                  className={`rounded-[1.35rem] border px-4 py-4 text-left text-sm font-semibold capitalize transition ${method === option ? "border-teal-600 bg-teal-50 text-teal-900 dark:border-teal-300 dark:bg-teal-500/15 dark:text-teal-100" : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)]"}`}
                >
                  <span className="block text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Method</span>
                  <span className="mt-2 block">{option}</span>
                </button>
              ))}
            </div>

            {paymentStatus === "paid" ? (
              <div className="mt-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-50">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em]">
                  <BadgeCheck className="h-4 w-4" />
                  Payment confirmed
                </div>
                <p className="mt-2 text-sm leading-6">Your booking is confirmed and the wallet credit is ready for future recovery, refund, or reward flows.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={() => router.push("/profile")}>Open profile <ArrowRight className="h-4 w-4" /></Button>
                  <Button variant="outline" onClick={() => router.push("/profile")}>Open profile</Button>
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button onClick={markPaid} className="w-full sm:w-auto">
                Pay now
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={requestRefund} className="w-full sm:w-auto">
                Request refund
              </Button>
            </div>

            {status ? <p className="mt-4 rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)]" aria-live="polite">{status}</p> : null}
          </div>
        </Card>

        <Card className="p-6 sm:p-8 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.6rem] border border-[color:var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,252,0.96))] p-5 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.88))]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Payment summary</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">{formatRupee(currentPayment.amount)}</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Refundable payment ledger with wallet and cashback routing.</p>
          </div>

          <details className="mt-4 rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950 dark:text-slate-50">More payment details</summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                { label: "Amount", value: formatRupee(currentPayment.amount) },
                { label: "Status", value: paymentStatus.replace("_", " ") },
                { label: "Method", value: method.toUpperCase() },
                { label: "Cashback", value: formatRupee(cashback) },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="mt-1 text-base font-semibold text-slate-950 dark:text-slate-50">{item.value}</p>
                </div>
              ))}
              <div className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 text-sm text-[color:var(--muted)]">
                <p className="font-semibold text-[color:var(--foreground)]">Wallet effect</p>
                <p className="mt-1 leading-6">This payment can power future refunds, loyalty credits, and booking recovery without changing the booking record itself.</p>
              </div>
            </div>
          </details>

          <div className="mt-4">
            <Button variant="ghost" onClick={() => router.push("/profile")} className="w-full">
              Open profile
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
