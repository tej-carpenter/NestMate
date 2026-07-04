"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Home, Search, MapPinned, PlusCircle, UserRound, ShieldCheck, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/cn";
import { getAccountLabel, getPostLoginRoute, loadSupabaseSessionProfile, readLocalSession, subscribeToSupabaseAuth } from "@/lib/session";
import { isAdminRole } from "@/lib/auth/roles";

const baseItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/host/dashboard", label: "Host", icon: LayoutDashboard },
  { href: "/host/listings/new", label: "List", icon: PlusCircle },
] as const;

export function BottomNav() {
  const [session, setSession] = useState<ReturnType<typeof readLocalSession>>(null);

  useEffect(() => {
    const refreshSession = () => setSession(readLocalSession());

    refreshSession();
    void loadSupabaseSessionProfile().then(setSession).catch(refreshSession);
    const unsubscribe = subscribeToSupabaseAuth(setSession);
    window.addEventListener("storage", refreshSession);
    window.addEventListener("nestmate-auth-change", refreshSession);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", refreshSession);
      window.removeEventListener("nestmate-auth-change", refreshSession);
    };
  }, []);

  const items = useMemo(() => {
    if (!session) {
      return [...baseItems, { href: "/auth/login", label: "Login", icon: UserRound }] as const;
    }

    return [
      ...baseItems,
      {
        href: getPostLoginRoute(session.role),
        label: getAccountLabel(session.role),
        icon: isAdminRole(session.role) ? ShieldCheck : UserRound,
      },
    ] as const;
  }, [session]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[color:var(--border)] bg-[color:var(--surface)]/96 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-5 gap-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 rounded-[1.25rem] border border-transparent px-1.5 py-2 text-[10px] font-semibold tracking-[0.06em] text-slate-500 transition active:scale-[0.98]",
                "hover:border-[color:var(--border)] hover:bg-[color:var(--surface-strong)] hover:text-slate-950 dark:hover:text-slate-50",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
