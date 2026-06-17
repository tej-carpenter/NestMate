import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60dvh] w-full max-w-2xl flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5">
        <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--foreground)]">404</span>
      </div>
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-[color:var(--foreground)] sm:text-5xl">Page not found</h1>
        <p className="mt-4 text-lg text-[color:var(--muted)]">The page you're looking for doesn't exist or has been moved.</p>
      </div>
      <Button asChild className="mt-2 h-12 px-8 text-[15px]">
        <Link href="/">Return to home</Link>
      </Button>
    </main>
  );
}