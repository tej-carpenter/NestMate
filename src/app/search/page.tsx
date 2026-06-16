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