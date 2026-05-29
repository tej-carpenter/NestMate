"use client";

import * as React from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { clearLocalSession, readLocalSession } from "@/lib/session";

export function AccountActions() {
  const [session, setSession] = React.useState<ReturnType<typeof readLocalSession>>(null);

  React.useEffect(() => {
    const refreshSession = () => setSession(readLocalSession());

    const frame = window.requestAnimationFrame(refreshSession);
    window.addEventListener("storage", refreshSession);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("storage", refreshSession);
    };
  }, []);

  const profileHref = session?.role === "admin" || session?.role === "user" ? "/profile" : "/guest/dashboard";

  return (
    <div suppressHydrationWarning className="flex flex-wrap items-center justify-end gap-2">
      <ThemeToggle />

      {session ? (
        <>
          {session.role === "guest" ? (
            <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
              <Link href={profileHref}>Guest dashboard</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm" className="rounded-full px-3">
              <Link href={profileHref} className="inline-flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm shadow-teal-900/20">
                  <UserRound className="h-4 w-4" />
                </span>
                <span className="hidden sm:inline">Profile</span>
              </Link>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => {
              clearLocalSession();
              setSession(null);
            }}
          >
            Sign out
          </Button>
        </>
      ) : (
        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
          <Link href="/auth/login">Login</Link>
        </Button>
      )}

      <Button asChild size="sm" className="px-3 sm:px-4">
        <Link href="/host/listings/new">
          <span className="sm:hidden">List</span>
          <span className="hidden sm:inline">List a property</span>
        </Link>
      </Button>
    </div>
  );
}