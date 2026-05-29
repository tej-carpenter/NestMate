import { Suspense } from "react";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchResultsShell } from "@/components/search/search-results-shell";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const resolvedSearchParams = await searchParams;
  const summary = resolvedSearchParams.city ? `Results for ${resolvedSearchParams.city}` : "Browse verified accommodation across India";

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-32 pt-8 sm:px-6 sm:pb-24 sm:pt-10 lg:px-8 lg:pt-12">
      <section className="overflow-hidden rounded-[2.5rem] border border-[color:var(--border)] bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(255,255,255,0.94),rgba(20,184,166,0.08))] shadow-[0_26px_70px_-40px_rgba(15,23,42,0.32)] dark:bg-[linear-gradient(135deg,rgba(15,118,110,0.20),rgba(15,23,42,0.92),rgba(20,184,166,0.10))]">
        <div className="grid gap-4 p-5 sm:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:p-10">
          <div className="space-y-4">
            <Badge className="bg-white/90 text-teal-950 dark:bg-teal-500/15 dark:text-teal-100">Personalized discovery</Badge>
            <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-4xl text-slate-950 dark:text-slate-50 sm:text-5xl">Find a verified stay without sorting through noise.</h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">Start with the city or area you care about. Everything else unfolds only when you ask for it.</p>
            <div className="flex flex-wrap gap-2">
              {["Verified first", "Near metro", "Under 12k", "Female-friendly"].map((label) => (
                <Chip key={label} className="shadow-sm">{label}</Chip>
              ))}
            </div>
          </div>

          <details className="rounded-[1.75rem] border border-[color:var(--border)] bg-white/75 p-5 shadow-sm shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-slate-950/40 sm:p-6">
            <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">What this page keeps visible</summary>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <p>Trust signals, price, and locality stay visible while advanced filters remain collapsed.</p>
              <p>Mobile actions stay simple: refine, compare, and book.</p>
            </div>
          </details>
        </div>
      </section>
      <Suspense
        fallback={
          <section className="glass-panel rounded-[2rem] border border-[color:var(--border)] p-4 shadow-sm shadow-slate-900/5 sm:p-6">
            <div className="space-y-4">
              <div className="h-6 w-32 rounded-full bg-slate-200/80 dark:bg-slate-800/70" />
              <div className="h-8 w-3/5 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                <div className="h-11 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60 sm:col-span-2" />
                <div className="h-11 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
                <div className="h-11 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
              </div>
            </div>
          </section>
        }
      >
        <SearchFilters />
      </Suspense>
      <SearchResultsShell querySummary={summary} />
    </main>
  );
}