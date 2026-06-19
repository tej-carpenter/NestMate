"use client";

import * as React from "react";
import Link from "next/link";
import { UserRound, BadgeCheck, Phone, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { getAccountLabel, getPostLoginRoute, loadSupabaseSessionProfile, readLocalSession, signOutSession, subscribeToSupabaseAuth } from "@/lib/session";
import { isAuthenticatedSession } from "@/lib/auth/permissions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ProfilePanel() {
  const [mounted, setMounted] = React.useState(false);
  const [session, setSession] = React.useState(() => null as ReturnType<typeof readLocalSession>);
  const [userStats, setUserStats] = React.useState({
    loginCount: 1,
    totalBookings: 0,
    paymentRecords: 0,
  });

  React.useEffect(() => {
    const refreshSession = () => setSession(readLocalSession());

    let active = true;
    const handle = window.setTimeout(() => {
      refreshSession();
      void loadSupabaseSessionProfile().then((sess) => {
        if (!active) return;
        setSession(sess);
        if (sess?.phone || sess?.email) {
          const supabase = createSupabaseBrowserClient();
          Promise.all([
            sess.email ? supabase.from("users").select("id").eq("email", sess.email).maybeSingle() : Promise.resolve({ data: null }),
            sess.phone ? (supabase.from("bookings") as any).select("id", { count: "exact" }).eq("user_phone", sess.phone) : Promise.resolve({ count: 0 }),
            sess.phone ? (supabase.from("transactions") as any).select("id", { count: "exact" }).eq("user_phone", sess.phone) : Promise.resolve({ count: 0 })
          ]).then(([{ data: user }, { count: bCount }, { count: pCount }]) => {
            if (active) {
              setUserStats({
                loginCount: 1, // mocked for now
                totalBookings: bCount || 0,
                paymentRecords: pCount || 0,
              });
              setMounted(true);
            }
          });
        } else {
          setMounted(true);
        }
      }).catch((e) => {
        refreshSession();
        setMounted(true);
      });
    }, 0);

    const unsubscribe = subscribeToSupabaseAuth(setSession);
    window.addEventListener("storage", refreshSession);
    window.addEventListener("nestmate-auth-change", refreshSession);

    return () => {
      active = false;
      window.clearTimeout(handle);
      unsubscribe();
      window.removeEventListener("storage", refreshSession);
      window.removeEventListener("nestmate-auth-change", refreshSession);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.22fr_0.78fr] lg:items-start">
        <Card className="p-6 sm:p-8 lg:self-start">
          <div className="space-y-3">
            <p className="h-3 w-28 rounded-full bg-slate-200/80 dark:bg-slate-800/70" />
            <div className="h-10 w-72 max-w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/70" />
            <p className="h-4 w-full max-w-xl rounded-full bg-slate-200/70 dark:bg-slate-800/60" />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="min-h-32 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
                <div className="h-4 w-24 rounded-full bg-slate-200/80 dark:bg-slate-800/70" />
                <div className="mt-4 h-6 w-24 rounded-full bg-slate-200/70 dark:bg-slate-800/60" />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6 sm:p-8 lg:sticky lg:top-24 lg:self-start">
          <div className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-slate-800/70" />
          <div className="mt-4 h-8 w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/70" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-11 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!isAuthenticatedSession(session)) {
    return (
      <Card className="mx-auto w-full max-w-2xl p-6 sm:p-8">
        <Badge className="bg-teal-50 text-teal-950 dark:bg-teal-500/15 dark:text-teal-100">Profile</Badge>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-slate-950 dark:text-slate-50">Sign in to view your profile</h1>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">The profile area is reserved for authenticated accounts. Anonymous visitors can browse listings without signing in.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button asChild>
            <Link href="/auth/login">Go to login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search">Browse listings</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">Guest Dashboard</h1>
        <p className="mt-2 text-[15px] text-[color:var(--muted)]">Manage your stays, profile, and payments.</p>
        
        {/* Simple Tab Navigation */}
        <div className="mt-6 flex items-center gap-6 border-b border-[color:var(--border)]">
          <Link href="/profile" className="border-b-2 border-[color:var(--foreground)] pb-3 text-[15px] font-semibold text-[color:var(--foreground)]">
            Profile
          </Link>
          <Link href="/guest/bookings" className="pb-3 text-[15px] font-medium text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors">
            My Bookings
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.22fr_0.78fr] lg:items-start">
        <Card className="overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm sm:p-8 lg:self-start">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-[14px] font-medium text-[color:var(--muted)]">Profile Details</p>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--foreground)]">{session.name || "Nestmate User"}</h1>
            </div>
            <Chip className="inline-flex items-center gap-2 px-4 py-2 font-medium">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              {getAccountLabel(session.role)}
            </Chip>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm">
              <div className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                <UserRound className="h-4 w-4" />
                Name
              </div>
              <p className="mt-3 text-[16px] font-semibold text-[color:var(--foreground)] truncate">{session.name || "Not set"}</p>
            </div>
            <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm">
              <div className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                <Phone className="h-4 w-4" />
                Phone
              </div>
              <p className="mt-3 text-[16px] font-semibold text-[color:var(--foreground)] truncate">{session.phone || "Not added"}</p>
            </div>
            <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                <BadgeCheck className="h-4 w-4" />
                Email
              </div>
              <p className="mt-3 text-[16px] font-semibold text-[color:var(--foreground)] break-all">{session.email ?? "Not added"}</p>
            </div>
            <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
                <CalendarDays className="h-4 w-4" />
                Signed in
              </div>
              <p className="mt-3 text-[16px] font-semibold text-[color:var(--foreground)] truncate">
                {formatDateTime(session.signedInAt)}
              </p>
            </div>
          </div>
        </Card>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Card className="flex flex-col gap-6 overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-[14px] font-medium text-[color:var(--muted)]">Account Actions</p>
            </div>

            <div className="flex flex-col gap-3 border-y border-[color:var(--border)] py-6">
              <Button asChild className="h-12 w-full justify-start text-[15px]">
                <Link href="/guest/bookings">View Bookings</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 w-full justify-start text-[15px]">
                <Link href="/search">Browse Listings</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 w-full justify-start text-[15px]">
                <Link href="/profile/archived-listings">Archived Listings</Link>
              </Button>
            </div>

            <Button
              variant="outline"
              className="h-12 w-full text-[15px] font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
              onClick={async () => {
                await signOutSession();
                setSession(null);
              }}
            >
              Sign out
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
