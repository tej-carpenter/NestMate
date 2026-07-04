"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPostLoginRoute, upsertSupabaseUserProfile } from "@/lib/session";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(120, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Confirm your password."),
  phone: z.string().trim().optional(),
  agreedToPolicies: z.boolean().refine((val) => val === true, {
    message: "You must agree to the policies to continue.",
  }),
}).refine((value) => value.password === value.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [agreedToPolicies, setAgreedToPolicies] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = signupSchema.safeParse({ name, email, password, confirmPassword, phone, agreedToPolicies });

    if (!parsed.success) {
      setStatus(parsed.error.issues[0]?.message ?? "Check your signup details.");
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: {
            name: parsed.data.name,
            phone: parsed.data.phone || null,
            role: "user",
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data.user?.id || !data.user.email) {
        throw new Error("Supabase did not return a user.");
      }

      const session = await upsertSupabaseUserProfile({
        userId: data.user.id,
        email: data.user.email,
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        role: "user",
      });

      await supabase.from("user_policy_acceptances").insert({
        user_id: data.user.id,
        policy_type: "signup_policies",
        policy_version: "June 2026",
        user_agent: window.navigator.userAgent,
      });

      if (session) {
        setStatus("Account created! Signing you in...");
        router.push("/profile?onboarding=true");
        return;
      }

      setStatus("Account created. Check your email to confirm your account before logging in.");
      } catch (error) {
        setStatus(
          error instanceof Error
            ? error.message
            : JSON.stringify(error)
        );
      } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-xl overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-8 shadow-xl shadow-black/5 dark:shadow-white/5">
      <div className="space-y-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Signup</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[color:var(--foreground)]">Create your account</h1>
      </div>

      <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
        <label className="space-y-2 flex flex-col">
          <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Full name</span>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" autoComplete="name" className="h-12 rounded-xl text-[15px]" />
        </label>

        <label className="space-y-2 flex flex-col">
          <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Email</span>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" autoComplete="email" className="h-12 rounded-xl text-[15px]" />
        </label>

        <label className="space-y-2 flex flex-col">
          <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Phone number <span className="text-[color:var(--muted)] font-normal">(optional)</span></span>
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" inputMode="tel" autoComplete="tel" className="h-12 rounded-xl text-[15px]" />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 flex flex-col">
            <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Password</span>
            <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" type="password" autoComplete="new-password" className="h-12 rounded-xl text-[15px]" />
          </label>

          <label className="space-y-2 flex flex-col">
            <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Confirm password</span>
            <Input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat password" type="password" autoComplete="new-password" className="h-12 rounded-xl text-[15px]" />
          </label>
        </div>

        <label className="flex items-start gap-3 mt-2">
          <input 
            type="checkbox" 
            className="mt-1 h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--brand)] focus:ring-[color:var(--brand)]" 
            checked={agreedToPolicies}
            onChange={(e) => setAgreedToPolicies(e.target.checked)}
          />
          <span className="text-[13px] leading-relaxed text-[color:var(--muted)]">
            I have read and agree to the{" "}
            <Link href="/terms" className="text-[color:var(--foreground)] hover:underline">Terms of Use</Link>,{" "}
            <Link href="/privacy" className="text-[color:var(--foreground)] hover:underline">Privacy Policy</Link>,{" "}
            <Link href="/refund" className="text-[color:var(--foreground)] hover:underline">Refund & Cancellation Policy</Link>,{" "}
            <Link href="/community" className="text-[color:var(--foreground)] hover:underline">Community Standards</Link>, and{" "}
            <Link href="/safety" className="text-[color:var(--foreground)] hover:underline">Accommodation Safety Disclaimer</Link>.
          </span>
        </label>

        <Button type="submit" className="mt-2 h-12 justify-center rounded-xl text-[15px]" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      {status ? <p className="mt-5 rounded-xl border border-[color:var(--border)] bg-black/5 px-4 py-3 text-[14px] font-medium text-[color:var(--foreground)] dark:bg-white/5">{status}</p> : null}

      <p className="mt-6 text-center text-[14px] font-medium text-[color:var(--muted)]">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-bold text-[color:var(--foreground)] hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
