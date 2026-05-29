"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ArrowRight, BadgeCheck, Home, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { upsertUserOnLogin } from "@/lib/local-data";
import { getPostLoginRoute, readLocalSession, writeLocalSession } from "@/lib/session";

const phoneSchema = z.string().min(8).max(16);
const emailSchema = z.string().email();
const otpSchema = z.string().min(4).max(8);
const loginRoles = [
  {
    value: "guest" as const,
    title: "Guest",
    description: "Browse verified homes, save places, and continue to guest bookings.",
  },
  {
    value: "user" as const,
    title: "User",
    description: "Access your profile, booking history, and personal preferences.",
  },
  {
    value: "admin" as const,
    title: "Admin",
    description: "Manage moderation, edit listings, and review platform activity.",
  },
] as const;

export function OtpLoginForm() {
  const router = useRouter();
  const loginSectionRef = useRef<HTMLDivElement | null>(null);
  const [phone, setPhone] = useState("+91");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<(typeof loginRoles)[number]["value"]>("guest");
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initialSession = readLocalSession();

    if (!initialSession) {
      return;
    }

    const handle = window.setTimeout(() => {
      setPhone(initialSession.phone);
      setName(initialSession.name);
      setRole(initialSession.role);
      setStep("verify");
      setStatus(`Loaded your ${initialSession.role} session. You can continue or sign out first.`);
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  const nextRoute = getPostLoginRoute(role);

  function selectRole(value: (typeof loginRoles)[number]["value"]) {
    setRole(value);
    window.requestAnimationFrame(() => {
      loginSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function persistSession() {
    const identifier = loginMethod === "email" ? emailSchema.parse(email) : phoneSchema.parse(phone);
    const normalizedName = name.trim() || "Nestmate user";

    upsertUserOnLogin({
      phone: identifier,
      name: normalizedName,
      role,
    });

    writeLocalSession({
      phone: identifier,
      name: normalizedName,
      role,
      signedInAt: Date.now(),
    });
  }

  async function handleRequestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const identifier = loginMethod === "email" ? emailSchema.parse(email) : phoneSchema.parse(phone);
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginMethod === "email" ? { mode: "request", email: identifier } : { mode: "request", phone: identifier }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorBody?.error ?? "OTP request failed");
      }

      setStep("verify");
      setStatus(`OTP sent for ${role}. Enter the ${loginMethod === "email" ? "email" : "SMS"} code to continue.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to request OTP");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const identifier = loginMethod === "email" ? emailSchema.parse(email) : phoneSchema.parse(phone);
    const parsedOtp = otpSchema.parse(otp);
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginMethod === "email" ? { mode: "verify", email: identifier, token: parsedOtp } : { mode: "verify", phone: identifier, token: parsedOtp }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorBody?.error ?? "OTP verification failed");
      }

      persistSession();
      setStatus("Signed in. Redirecting to your dashboard...");
      router.push(getPostLoginRoute(role));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to verify OTP");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="glass-panel mx-auto w-full max-w-5xl rounded-[2.5rem] p-6 sm:p-8 lg:p-10">
      <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">OTP login</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl leading-[0.96] text-slate-950 dark:text-slate-50 sm:text-4xl">Choose how you want to continue</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Pick the account type first so Nestmate can send you to the right place after login: guest dashboard, profile, or admin tools.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Home, label: "Guest feed" },
              { icon: UserRound, label: "Profile workspace" },
              { icon: ShieldCheck, label: "Admin tools" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                  <Icon className="h-5 w-5 text-teal-700 dark:text-teal-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-slate-50">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--surface)]/90 p-5 backdrop-blur">
          <div className="flex items-start justify-between gap-3 rounded-[1.35rem] border border-[color:var(--border)] bg-[linear-gradient(180deg,rgba(15,118,110,0.08),rgba(255,255,255,0.96))] p-4 dark:bg-[linear-gradient(180deg,rgba(15,118,110,0.18),rgba(15,23,42,0.92))]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Next destination</p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">{nextRoute}</p>
            </div>
            <BadgeCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Once verified, we route you directly to the correct surface. That keeps the flow fast and predictable on mobile.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {loginRoles.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => selectRole(item.value)}
            className={cn(
              "rounded-[1.5rem] border p-4 text-left transition",
              role === item.value
                ? "border-teal-600 bg-teal-50 shadow-sm shadow-teal-950/5 dark:border-teal-300 dark:bg-teal-500/15"
                : "border-[color:var(--border)] bg-[color:var(--surface-strong)] hover:bg-black/5 dark:hover:bg-white/10",
            )}
          >
            <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
          </button>
        ))}
      </div>

      <div ref={loginSectionRef} />

      <form className="mt-8 space-y-4" onSubmit={step === "request" ? handleRequestOtp : handleVerifyOtp}>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={loginMethod === "phone" ? "secondary" : "outline"} onClick={() => setLoginMethod("phone")}>
            Phone OTP
          </Button>
          <Button type="button" variant={loginMethod === "email" ? "secondary" : "outline"} onClick={() => setLoginMethod("email")}>
            <Mail className="h-4 w-4" />
            Email OTP
          </Button>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Display name</span>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
        </label>
        {loginMethod === "email" ? (
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email address</span>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" inputMode="email" autoComplete="email" />
          </label>
        ) : (
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone number</span>
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" inputMode="tel" autoComplete="tel" />
          </label>
        )}

        {step === "verify" ? (
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Verification code</span>
            <Input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="123456" inputMode="numeric" />
          </label>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          {step === "verify" ? (
            <Button type="button" variant="outline" className="sm:flex-1" onClick={() => setStep("request")}>
              Back
            </Button>
          ) : null}
          <Button type="submit" className="sm:flex-1" disabled={isSubmitting}>
            {isSubmitting ? (step === "request" ? "Sending OTP..." : "Verifying...") : step === "request" ? `Send ${loginMethod === "email" ? "email" : "OTP"}` : "Verify and continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {status ? <p className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)]">{status}</p> : null}
    </div>
  );
}