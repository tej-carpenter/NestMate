"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, ChevronDown, Coins, CreditCard, RefreshCw, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupee } from "@/lib/format";
import { getPayments } from "@/lib/local-data";
import { readLocalSession } from "@/lib/session";

export default function WalletPage() {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<ReturnType<typeof readLocalSession>>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSession(readLocalSession());
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  if (!mounted) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-20 sm:px-6 sm:py-10 lg:px-8">
        <div className="space-y-6">
          <Card className="h-56 animate-pulse border-white/70 bg-white/90 dark:border-white/10 dark:bg-slate-950/45" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="h-28 animate-pulse border-[color:var(--border)] bg-[color:var(--surface)]" />
            ))}
          </div>
          <Card className="h-48 animate-pulse border-[color:var(--border)] bg-[color:var(--surface)]" />
        </div>
      </main>
    );
  }
  if (!session || (session.role !== "user" && session.role !== "admin")) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-20 sm:px-6 sm:py-10 lg:px-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Sign in to view wallet activity</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Anonymous visitors can browse, but wallet history only appears after login.</p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  const payments = session ? getPayments(session.phone) : [];
  const cashbackEarned = payments.reduce((total, payment) => total + (payment.status === "paid" ? Math.max(0, Math.round(payment.amount * 0.03)) : 0), 0);
  const refundable = payments.reduce((total, payment) => total + (payment.status === "refund_requested" ? payment.amount : 0), 0);
  const walletBalance = cashbackEarned + Math.round(refundable * 0.05);

  const ledger = payments.map((payment) => ({
    id: payment.id,
    title: `Booking ${payment.bookingId.slice(0, 6)}`,
    amount: payment.amount,
    status: payment.status,
    method: payment.method,
    tone:
      payment.status === "paid"
        ? "text-emerald-700 dark:text-emerald-300"
        : payment.status === "refund_requested"
          ? "text-amber-700 dark:text-amber-300"
          : payment.status === "refunded"
            ? "text-rose-700 dark:text-rose-300"
            : "text-slate-600 dark:text-slate-300",
  }));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-20 sm:px-6 sm:py-10 lg:px-8">
      <div className="space-y-6">
        <Card className="overflow-hidden border-white/70 bg-white/90 p-0 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.3)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
          <div className="bg-[linear-gradient(135deg,rgba(15,118,110,0.16),rgba(255,255,255,0.96),rgba(20,184,166,0.10))] p-6 sm:p-8 dark:bg-[linear-gradient(135deg,rgba(15,118,110,0.22),rgba(15,23,42,0.92),rgba(20,184,166,0.12))]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900 dark:bg-teal-500/15 dark:text-teal-100">
                <Wallet className="h-3.5 w-3.5" />
                NestPay wallet
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-100">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Ledger ready
              </span>
            </div>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-slate-950 dark:text-slate-50 sm:text-5xl">Balance, cashback, refunds, and transaction history</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">Wallet data is persisted per signed-in account and mirrors the payment trail so the product feels auditable and trustworthy.</p>
          </div>
        </Card>

        {session ? (
          <Card className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Wallet at a glance</p>
                <p className="mt-2 text-4xl font-semibold text-slate-950 dark:text-slate-50">{formatRupee(walletBalance)}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Balance combines cashback and pending recovery credit.</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-900 dark:bg-teal-500/15 dark:text-teal-100">
                <Wallet className="h-5 w-5" />
              </div>
            </div>

            <details className="mt-5 rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-950 dark:text-slate-50">
                Wallet breakdown
                <ChevronDown className="h-4 w-4 text-slate-500 transition-transform open:rotate-180" />
              </summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Cashback earned", value: formatRupee(cashbackEarned), icon: BadgeCheck },
                  { label: "Refund credit", value: formatRupee(refundable), icon: RefreshCw },
                  { label: "Transactions", value: payments.length.toString(), icon: CreditCard },
                  { label: "Ready to spend", value: formatRupee(walletBalance), icon: Coins },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.label}</p>
                          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{item.value}</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-900 dark:bg-teal-500/15 dark:text-teal-100">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          </Card>
        ) : null}

        {payments.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-slate-600 dark:text-slate-300">No payment records yet. Book a stay to start earning cashback and wallet history.</p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/search">Start booking to generate payment history <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </Card>
        ) : (
          <details className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 sm:p-6">
            <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Transaction history</summary>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {ledger.map((payment) => (
              <Card key={payment.id} className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Transaction {payment.id.slice(0, 10)}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">{formatRupee(payment.amount)}</p>
                    <p className={`mt-2 text-sm font-medium ${payment.tone}`}>Method: {payment.method.toUpperCase()} · {payment.status.replace("_", " ")}</p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900 dark:bg-teal-500/15 dark:text-teal-100">
                    {payment.status}
                  </span>
                </div>
                <div className="mt-4 rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 text-sm text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-slate-950 dark:text-slate-50">Wallet effect</p>
                  <p className="mt-1 leading-6">This ledger line can power refunds, loyalty credits, and payment recovery once a backend wallet service is connected.</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/payment/${payment.id}`}>Open payment page</Link>
                  </Button>
                </div>
              </Card>
            ))}
            </div>
          </details>
        )}
      </div>
    </main>
  );
}