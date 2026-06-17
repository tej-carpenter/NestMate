export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60dvh] w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full gap-4 sm:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm shadow-black/5 dark:shadow-white/5 sm:p-8">
          <div className="h-3 w-32 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
          <div className="mt-5 h-12 w-5/6 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
          <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-black/5 dark:bg-white/5" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded-full bg-black/5 dark:bg-white/5" />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="h-24 animate-pulse rounded-[16px] bg-black/5 dark:bg-white/5" />
            <div className="h-24 animate-pulse rounded-[16px] bg-black/5 dark:bg-white/5" />
            <div className="h-24 animate-pulse rounded-[16px] bg-black/5 dark:bg-white/5" />
          </div>
        </div>
        <div className="grid gap-4">
          <div className="h-[18rem] animate-pulse rounded-[24px] bg-black/5 dark:bg-white/5" />
          <div className="h-40 animate-pulse rounded-[24px] bg-black/5 dark:bg-white/5" />
        </div>
      </div>
    </div>
  );
}