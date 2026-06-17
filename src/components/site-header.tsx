"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AccountActions } from "@/components/nav/account-actions";

const navItems = [
  { href: "/search", label: "Find a stay" },
  { href: "/host/dashboard", label: "Host your property" },
  { href: "/about", label: "About us" },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--surface)]/80 backdrop-blur-2xl">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-4 py-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[color:var(--foreground)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[color:var(--brand-strong)] text-[15px] font-extrabold text-white shadow-sm dark:text-black">
            N
          </span>
          <span className="hidden sm:inline">Nestmate</span>
        </Link>

        <nav className="hidden items-center gap-6 overflow-x-auto text-nowrap pb-1 sm:col-span-1 sm:flex sm:justify-center sm:pb-0 md:gap-8">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-[15px] font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 justify-self-end">
          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[color:var(--border)] bg-transparent text-[color:var(--foreground)] transition-colors hover:bg-black/5 sm:hidden dark:hover:bg-white/5"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <AccountActions />
        </div>
      </div>

      <div className={`border-t border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 sm:hidden ${mobileMenuOpen ? "block" : "hidden"}`}>
        <div className="grid max-h-[60dvh] gap-2 overflow-y-auto pb-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-12 items-center justify-between rounded-[var(--radius-md)] bg-black/5 px-4 py-3 text-[15px] font-medium text-[color:var(--foreground)] active:bg-black/10 dark:bg-white/5 dark:active:bg-white/10"
            >
              {item.label}
              <span className="text-[color:var(--muted)] opacity-50">→</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}