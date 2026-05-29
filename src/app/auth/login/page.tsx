import { OtpLoginForm } from "@/components/auth/otp-login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <section className="relative overflow-hidden rounded-[2.75rem] border border-[color:var(--border)] bg-[linear-gradient(160deg,rgba(15,118,110,0.16)_0%,rgba(255,255,255,0.96)_38%,rgba(20,184,166,0.10)_100%)] p-6 shadow-[0_26px_70px_-40px_rgba(15,23,42,0.32)] dark:bg-[linear-gradient(160deg,rgba(15,118,110,0.24)_0%,rgba(15,23,42,0.96)_42%,rgba(20,184,166,0.12)_100%)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-teal-400/15 blur-3xl" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
        </div>
        <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Welcome back</p>
            <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-[0.96] text-slate-950 dark:text-slate-50 sm:text-5xl lg:text-6xl">Choose your role, sign in, and jump into the right Nestmate experience.</h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">The login flow is built like a premium onboarding step: role-aware, mobile-first, and designed to route guests, residents, and admins into the right surface after OTP verification.</p>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: "Guest", detail: "Browse, save, and book" },
                { title: "User", detail: "Profile, history, wallet" },
                { title: "Admin", detail: "Moderation and insights" },
              ].map((item) => (
                <div key={item.title} className="rounded-[1.4rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.title}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-slate-50">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--surface)]/90 p-5 backdrop-blur sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">What happens next</p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">We route you to the right dashboard after verification.</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">That means fewer dead ends and less cognitive load on mobile.</p>
            </div>
            <div className="rounded-[1.35rem] border border-[color:var(--border)] bg-[linear-gradient(180deg,rgba(15,118,110,0.08),rgba(255,255,255,0.96))] p-4 dark:bg-[linear-gradient(180deg,rgba(15,118,110,0.18),rgba(15,23,42,0.92))]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Personalized access</p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">Guest feed, profile workspace, or admin tools.</p>
            </div>
          </div>
        </div>
      </section>

      <OtpLoginForm />
    </main>
  );
}