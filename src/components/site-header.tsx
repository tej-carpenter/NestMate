"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AccountActions } from "@/components/nav/account-actions";

const navItems = [
  { href: "/search", label: "Search" },
  { href: "/city/Indore", label: "City pages" },
  { href: "/about", label: "About us" },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--surface)]/95 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 text-sm font-bold text-white shadow-lg shadow-teal-700/25">
            N
          </span>
          <span className="hidden sm:inline">Nestmate</span>
        </Link>

        <nav className="hidden items-center gap-4 overflow-x-auto text-nowrap pb-1 sm:col-span-1 sm:flex sm:justify-center sm:pb-0 md:gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-50">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-sm sm:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <AccountActions />
        </div>
      </div>

      <div className={`border-t border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 sm:hidden ${mobileMenuOpen ? "block" : "hidden"}`}>
        <div className="grid max-h-[60dvh] gap-2 overflow-y-auto pb-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-11 items-center justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              {item.label}
              <span className="text-slate-400">→</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}