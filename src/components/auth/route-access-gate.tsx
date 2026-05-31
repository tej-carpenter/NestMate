"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { canCreateListing, canModerateListings, isAuthenticatedSession, type AccessSession } from "@/lib/auth/permissions";
import { readLocalSession } from "@/lib/session";

type AccessVariant = "authenticated" | "creator" | "moderator";

type RouteAccessGateProps = {
  variant: AccessVariant;
  children: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  redirectTo?: string | ((session: AccessSession) => string);
};

function isAllowed(variant: AccessVariant, session: AccessSession) {
  if (variant === "authenticated") {
    return isAuthenticatedSession(session);
  }

  if (variant === "creator") {
    return canCreateListing(session);
  }

  return canModerateListings(session);
}

export function RouteAccessGate({ variant, children, title, description, actionLabel, actionHref, redirectTo }: RouteAccessGateProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<AccessSession>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSession(readLocalSession());
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  const allowed = useMemo(() => isAllowed(variant, session), [session, variant]);

  useEffect(() => {
    if (!mounted || allowed || !redirectTo) {
      return;
    }

    const target = typeof redirectTo === "function" ? redirectTo(session) : redirectTo;
    router.replace(target);
  }, [allowed, mounted, redirectTo, router, session]);

  if (!mounted) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="h-56 animate-pulse border-[color:var(--border)] bg-[color:var(--surface)]" />
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Access required</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-slate-950 dark:text-slate-50">{title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{description}</p>
          <div className="mt-6">
            <Button asChild>
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return <>{children}</>;
}