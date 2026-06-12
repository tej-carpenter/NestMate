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
import { upsertUserOnLogin } from "@/lib/local-data";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(120, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Confirm your password."),
  phone: z.string().trim().optional(),
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
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = signupSchema.safeParse({ name, email, password, confirmPassword, phone });

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
        console.error("SIGNUP ERROR", error);
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

      upsertUserOnLogin({
        id: data.user.id,
        email: data.user.email,
        name: parsed.data.name,
        phone: parsed.data.phone || "",
        role: "user",
      });

      if (session) {
        setStatus("Account created. Redirecting...");
        router.push(getPostLoginRoute(session.role));
        return;
      }

      setStatus("Account created. Check your email to confirm your account before logging in.");
      } catch (error) {
        console.error("FULL ERROR", error);

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
    <Card className="mx-auto w-full max-w-xl p-5 sm:p-7 lg:p-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Signup</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight text-slate-950 dark:text-slate-50">Create your Nestmate account</h1>
      </div>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Full name</span>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" autoComplete="name" />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" autoComplete="email" />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone number <span className="text-slate-400">(optional)</span></span>
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" inputMode="tel" autoComplete="tel" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</span>
            <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" type="password" autoComplete="new-password" />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm password</span>
            <Input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat password" type="password" autoComplete="new-password" />
          </label>
        </div>

        <Button type="submit" className="h-12 justify-center" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      {status ? <p className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)]">{status}</p> : null}

      <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-teal-800 hover:text-teal-950 dark:text-teal-300 dark:hover:text-teal-100">
          Log in
        </Link>
      </p>
    </Card>
  );
}
