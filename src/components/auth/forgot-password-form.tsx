"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const resetSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = resetSchema.safeParse({ email });

    if (!parsed.success) {
      setStatus(parsed.error.issues[0]?.message ?? "Enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const redirectTo = typeof window === "undefined" ? undefined : `${window.location.origin}/auth/login`;
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo });

      if (error) {
        throw new Error(error.message);
      }

      setStatus("Password reset email sent. Check your inbox for the secure reset link.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send password reset email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md p-5 sm:p-7 lg:p-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Password reset</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl leading-tight text-slate-950 dark:text-slate-50">Reset your password</h1>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" autoComplete="email" />
        </label>

        <Button type="submit" className="h-12 w-full justify-center" disabled={isSubmitting}>
          <Mail className="h-4 w-4" />
          {isSubmitting ? "Sending..." : "Send reset email"}
        </Button>
      </form>

      {status ? <p className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)]">{status}</p> : null}

      <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
        <Link href="/auth/login" className="font-semibold text-teal-800 hover:text-teal-950 dark:text-teal-300 dark:hover:text-teal-100">
          Back to login
        </Link>
      </p>
    </Card>
  );
}
