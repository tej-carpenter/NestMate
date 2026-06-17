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
    <Card className="mx-auto w-full max-w-md overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-8 shadow-xl shadow-black/5 dark:shadow-white/5">
      <div className="space-y-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Password reset</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[color:var(--foreground)]">Reset your password</h1>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="space-y-2 flex flex-col">
          <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Email</span>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" autoComplete="email" className="h-12 rounded-xl text-[15px]" />
        </label>

        <Button type="submit" className="mt-2 h-12 w-full justify-center rounded-xl text-[15px]" disabled={isSubmitting}>
          <Mail className="mr-2 h-4 w-4" />
          {isSubmitting ? "Sending..." : "Send reset email"}
        </Button>
      </form>

      {status ? <p className="mt-5 rounded-xl border border-[color:var(--border)] bg-black/5 px-4 py-3 text-[14px] font-medium text-[color:var(--foreground)] dark:bg-white/5">{status}</p> : null}

      <p className="mt-6 text-center text-[14px] font-medium text-[color:var(--muted)]">
        <Link href="/auth/login" className="font-bold text-[color:var(--foreground)] hover:underline">
          Back to login
        </Link>
      </p>
    </Card>
  );
}
