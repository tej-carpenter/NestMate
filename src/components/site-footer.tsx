import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface)] pb-24 md:pb-0">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 text-sm text-slate-600 dark:text-slate-300 sm:px-6 lg:grid-cols-[1.35fr_0.825fr_0.825fr] lg:px-8">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-950 dark:text-slate-50">Nestmate</p>
          <p className="mt-3 max-w-lg leading-7">
            Accommodation infrastructure for India: trust, bookings, payments, messaging, and admin tooling built on Next.js and Supabase.
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-950 dark:text-slate-50">Explore</p>
          <div className="grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(140px,1fr))] lg:grid-cols-1">
            <Link className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 transition hover:border-teal-500/40 hover:text-teal-900 dark:hover:text-teal-100" href="/search">Search</Link>
            <Link className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 transition hover:border-teal-500/40 hover:text-teal-900 dark:hover:text-teal-100" href="/about">About Us</Link>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-950 dark:text-slate-50">Social</p>
          <div className="grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(140px,1fr))] lg:grid-cols-1">
            <a className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 transition hover:border-teal-500/40 hover:text-teal-900 dark:hover:text-teal-100" href="https://www.instagram.com/nestmateofficial/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 transition hover:border-teal-500/40 hover:text-teal-900 dark:hover:text-teal-100" href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 transition hover:border-teal-500/40 hover:text-teal-900 dark:hover:text-teal-100" href="#" target="_blank" rel="noopener noreferrer">X / Twitter</a>
            <a className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 transition hover:border-teal-500/40 hover:text-teal-900 dark:hover:text-teal-100" href="#" target="_blank" rel="noopener noreferrer">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
}