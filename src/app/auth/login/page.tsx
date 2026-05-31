import { OtpLoginForm } from "@/components/auth/otp-login-form";
import { PageShell } from "@/components/layout/page-shell";

export default function LoginPage() {
  return (
    <PageShell className="justify-center gap-8">
      <section className="rounded-[2.5rem] border border-[color:var(--border)] bg-[color:var(--surface)]/90 p-6 shadow-[0_20px_60px_-36px_rgba(15,23,42,0.22)] backdrop-blur sm:p-8 lg:p-10">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Sign in</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[0.96] text-slate-950 dark:text-slate-50 sm:text-5xl">
            Choose your account type and continue with OTP.
          </h1>
          <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
            Anonymous visitors can browse freely. Sign in only when you need booking, listing, profile, or admin access.
          </p>
        </div>
      </section>

      <OtpLoginForm />
    </PageShell>
  );
}