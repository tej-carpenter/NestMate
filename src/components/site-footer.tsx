import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-black/5 pb-24 dark:bg-white/5 md:pb-0">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-[color:var(--foreground)]">
              <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[color:var(--brand-strong)] text-xs font-extrabold text-white shadow-sm dark:text-black">
                N
              </span>
              <span>Nestmate</span>
            </div>
            <p className="mt-4 max-w-sm text-[15px] leading-7 text-[color:var(--muted)]">
              Premium accommodation infrastructure for India. Verified stays, seamless bookings, and a trust-first experience.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--foreground)]">Explore</h3>
            <ul className="mt-6 space-y-4">
              <li>
                <Link className="text-[15px] font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]" href="/search">Find a stay</Link>
              </li>
              <li>
                <Link className="text-[15px] font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]" href="/host/dashboard">Host your property</Link>
              </li>
              <li>
                <Link className="text-[15px] font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]" href="/about">About Us</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--foreground)]">Connect</h3>
            <ul className="mt-6 space-y-4">
              <li>
                <a className="text-[15px] font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]" href="https://www.instagram.com/nestmateofficial/" target="_blank" rel="noopener noreferrer">Instagram</a>
              </li>
              <li>
                <a className="text-[15px] font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]" href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </li>
              <li>
                <a className="text-[15px] font-medium text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]" href="#" target="_blank" rel="noopener noreferrer">Twitter / X</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[color:var(--border)] pt-8 text-[13px] text-[color:var(--muted)] sm:flex-row">
          <p>© {new Date().getFullYear()} Nestmate Inc. All rights reserved.</p>
          <div className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-[color:var(--foreground)]">Privacy</Link>
            <Link href="/terms" className="hover:text-[color:var(--foreground)]">Terms</Link>
            <Link href="/refund" className="hover:text-[color:var(--foreground)]">Refund Policy</Link>
            <Link href="/host-terms" className="hover:text-[color:var(--foreground)]">Host Terms</Link>
            <Link href="/community" className="hover:text-[color:var(--foreground)]">Community</Link>
            <Link href="/safety" className="hover:text-[color:var(--foreground)]">Safety</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}