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
            supabase.from("users").select("id").eq("email", sess.email || "").maybeSingle(),
            (supabase.from("bookings") as any).select("id", { count: "exact" }).eq("user_phone", sess.phone || ""),
            (supabase.from("transactions") as any).select("id", { count: "exact" }).eq("user_phone", sess.phone || "")
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
    <div className="grid gap-6 lg:grid-cols-[1.22fr_0.78fr] lg:items-start">
      <Card className="p-6 sm:p-8 lg:self-start">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Badge className="bg-teal-50 text-teal-950 dark:bg-teal-500/15 dark:text-teal-100">Profile home</Badge>
            <h1 className="font-[family-name:var(--font-display)] text-4xl text-slate-950 dark:text-slate-50">{session.name || "Nestmate user"}</h1>
            <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">Account details, role access, and quick navigation live here for authenticated accounts.</p>
          </div>
          <Chip className="inline-flex items-center gap-2 px-4 py-2">
            <BadgeCheck className="h-4 w-4 text-emerald-600" />
            {getAccountLabel(session.role)} account
          </Chip>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
          <div className="min-h-32 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <UserRound className="h-4 w-4 text-teal-700 dark:text-teal-300" />
              Name
            </div>
            <p className="mt-3 text-lg font-semibold text-slate-950 dark:text-slate-50">{session.name || "Not set"}</p>
          </div>
          <div className="min-h-32 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Phone className="h-4 w-4 text-teal-700 dark:text-teal-300" />
              Phone
            </div>
            <p className="mt-3 text-lg font-semibold text-slate-950 dark:text-slate-50">{session.phone || "Not added"}</p>
          </div>
          <div className="min-h-32 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <BadgeCheck className="h-4 w-4 text-teal-700 dark:text-teal-300" />
              Email
            </div>
            <p className="mt-3 text-lg font-semibold text-slate-950 dark:text-slate-50">{session.email ?? "Not added"}</p>
          </div>
          <div className="min-h-32 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <BadgeCheck className="h-4 w-4 text-teal-700 dark:text-teal-300" />
              Role
            </div>
            <p className="mt-3 text-lg font-semibold text-slate-950 dark:text-slate-50">{getAccountLabel(session.role)}</p>
          </div>
          <div className="min-h-32 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <CalendarDays className="h-4 w-4 text-teal-700 dark:text-teal-300" />
              Signed in
            </div>
            <p className="mt-3 text-lg font-semibold text-slate-950 dark:text-slate-50">
              {formatDateTime(session.signedInAt)}
            </p>
          </div>
          <div className="min-h-32 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <BadgeCheck className="h-4 w-4 text-teal-700 dark:text-teal-300" />
              Login count
            </div>
            <p className="mt-3 text-lg font-semibold text-slate-950 dark:text-slate-50">{userStats.loginCount}</p>
          </div>
          <div className="min-h-32 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <BadgeCheck className="h-4 w-4 text-teal-700 dark:text-teal-300" />
              Total bookings
            </div>
            <p className="mt-3 text-lg font-semibold text-slate-950 dark:text-slate-50">{userStats.totalBookings}</p>
          </div>
          <div className="min-h-32 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <BadgeCheck className="h-4 w-4 text-teal-700 dark:text-teal-300" />
              Payment records
            </div>
            <p className="mt-3 text-lg font-semibold text-slate-950 dark:text-slate-50">{userStats.paymentRecords}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 sm:p-8 lg:sticky lg:top-24 lg:self-start">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Quick access</p>
        <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>Jump straight into the place this role should land after login.</p>
          <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-slate-700 dark:text-slate-200">
            {getPostLoginRoute(session.role)}
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <Button asChild>
            <Link href={getPostLoginRoute(session.role)}>Open dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/guest/bookings">Booking history</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/guest/wallet">Payment history</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/profile/archived-listings">My Archived Listings</Link>
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await signOutSession();
              setSession(null);
            }}
          >
            Sign out
          </Button>
        </div>
        <div className="mt-8 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent logins</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>{formatDateTime(session.signedInAt)}</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
