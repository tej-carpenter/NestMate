import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60dvh] w-full max-w-3xl flex-col items-start justify-center gap-4 px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">Not found</p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-slate-950">This page is not available.</h1>
      <p className="max-w-2xl text-base leading-7 text-slate-600">Use the main navigation to continue browsing verified accommodation pages, trust explanation content, and host flows.</p>
      <Button asChild>
        <Link href="/">Return home</Link>
      </Button>
    </main>
  );
}