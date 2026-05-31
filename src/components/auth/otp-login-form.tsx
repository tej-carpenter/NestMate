"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ArrowRight, Mail, ShieldCheck, UserRound } from "lucide-react";
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
    value: "user" as const,
    title: "User",
    description: "Book stays, create listings, and manage your profile.",
  },
  {
    value: "admin" as const,
    title: "Admin",
    description: "Moderate listings, review platform activity, and access admin tools.",
  },
] as const;

export function OtpLoginForm() {
  const router = useRouter();
  const loginSectionRef = useRef<HTMLDivElement | null>(null);
  const [phone, setPhone] = useState("+91");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<(typeof loginRoles)[number]["value"]>("user");
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

  function selectRole(value: (typeof loginRoles)[number]["value"]) {
    setRole(value);
    window.requestAnimationFrame(() => {
      loginSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function persistSession() {
    const identifier = loginMethod === "email" ? emailSchema.parse(email) : phoneSchema.parse(phone);
    const normalizedName = name.trim() || "Nestmate user";

    const currentUser = upsertUserOnLogin({
      phone: identifier,
      name: normalizedName,
      role,
    });

    if (!currentUser) {
      throw new Error("Unable to create session");
    }

    writeLocalSession({
      userId: currentUser.id,
      phone: identifier,
      name: normalizedName,
      role,
      signedInAt: Date.now(),
    });
  }

  async function handleRequestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const identifierResult = loginMethod === "email" ? emailSchema.safeParse(email) : phoneSchema.safeParse(phone);

    if (!identifierResult.success) {
      setStatus(identifierResult.error.issues[0]?.message ?? "Please enter a valid contact detail.");
      return;
    }

    const identifier = identifierResult.data;
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
    const identifierResult = loginMethod === "email" ? emailSchema.safeParse(email) : phoneSchema.safeParse(phone);
    const otpResult = otpSchema.safeParse(otp);

    if (!identifierResult.success) {
      setStatus(identifierResult.error.issues[0]?.message ?? "Please enter a valid contact detail.");
      return;
    }

    if (!otpResult.success) {
      setStatus(otpResult.error.issues[0]?.message ?? "Please enter a valid verification code.");
      return;
    }

    const identifier = identifierResult.data;
    const parsedOtp = otpResult.data;
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
    <div className="glass-panel mx-auto w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-8 lg:p-10">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">OTP login</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl leading-[0.96] text-slate-950 dark:text-slate-50 sm:text-4xl">Sign in to continue</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Anonymous browsing stays available without login. Choose the account type you want to verify.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
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

      <div ref={loginSectionRef} className="pt-6" />

      <form className="space-y-4" onSubmit={step === "request" ? handleRequestOtp : handleVerifyOtp}>
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

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2">
          <UserRound className="h-4 w-4 text-teal-700 dark:text-teal-300" />
          User accounts can book and list
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2">
          <ShieldCheck className="h-4 w-4 text-teal-700 dark:text-teal-300" />
          Admins can moderate platform activity
        </span>
      </div>
    </div>
  );
}
