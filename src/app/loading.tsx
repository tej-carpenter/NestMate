export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60dvh] w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full gap-4 sm:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm shadow-slate-900/5 sm:p-8">
          <div className="h-3 w-32 animate-pulse rounded-full bg-teal-100 dark:bg-teal-500/20" />
          <div className="mt-5 h-12 w-5/6 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-700/70" />
          <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/70" />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="h-24 animate-pulse rounded-[1.5rem] bg-slate-200/80 dark:bg-slate-700/70" />
            <div className="h-24 animate-pulse rounded-[1.5rem] bg-slate-200/80 dark:bg-slate-700/70" />
            <div className="h-24 animate-pulse rounded-[1.5rem] bg-slate-200/80 dark:bg-slate-700/70" />
          </div>
        </div>
        <div className="grid gap-4">
          <div className="h-[18rem] animate-pulse rounded-[2rem] bg-slate-200/80 dark:bg-slate-700/70" />
          <div className="h-40 animate-pulse rounded-[2rem] bg-slate-200/80 dark:bg-slate-700/70" />
        </div>
      </div>
    </div>
  );
}