"use client";

import Link from "next/link";
import { AccountActions } from "@/components/nav/account-actions";

const navItems = [
  { href: "/search", label: "Find a stay" },
  { href: "/host/dashboard", label: "Host your property" },
  { href: "/about", label: "About us" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--surface)]/80 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:gap-6 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[color:var(--foreground)] shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[color:var(--brand-strong)] text-[15px] font-extrabold text-white shadow-sm dark:text-black">
            N
          </span>
          <span className="hidden sm:inline">Nestmate</span>
        </Link>

        <nav className="flex flex-1 items-center gap-4 overflow-x-auto text-nowrap pb-1 sm:justify-center sm:gap-8 sm:pb-0 scrollbar-none">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-[14px] sm:text-[15px] font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)] shrink-0">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 justify-self-end">
          <AccountActions />
        </div>
      </div>
    </header>
  );
}