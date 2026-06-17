"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ArrowRight, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getPostLoginRoute, loadSupabaseSessionProfile, upsertSupabaseUserProfile } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export function EmailLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });

    if (!parsed.success) {
      setStatus(parsed.error.issues[0]?.message ?? "Enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user?.id || !data.user.email) {
        throw new Error("Supabase did not return a signed-in user.");
      }

      let session = await loadSupabaseSessionProfile();

      if (!session) {
        session = await upsertSupabaseUserProfile({
          userId: data.user.id,
          email: data.user.email,
          name: typeof data.user.user_metadata?.name === "string" ? data.user.user_metadata.name : data.user.email,
          phone: typeof data.user.user_metadata?.phone === "string" ? data.user.user_metadata.phone : "",
          role: "user",
        });
      }

      if (!session) {
        throw new Error("Unable to load your profile.");
      }

      setStatus("Signed in. Redirecting...");
      router.push(getPostLoginRoute(session.role));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-8 shadow-xl shadow-black/5 dark:shadow-white/5">
      <div className="space-y-3">
        <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">Login</p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[color:var(--foreground)]">Welcome back</h1>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="space-y-2 flex flex-col">
          <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Email</span>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" autoComplete="email" className="h-12 rounded-xl text-[15px]" />
        </label>

        <label className="space-y-2 flex flex-col">
          <span className="text-[14px] font-semibold text-[color:var(--foreground)]">Password</span>
          <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" type="password" autoComplete="current-password" className="h-12 rounded-xl text-[15px]" />
        </label>

        <div className="flex items-center justify-between gap-3 text-[14px]">
          <Link href="/auth/forgot-password" className="inline-flex items-center gap-2 font-semibold text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors">
            <Mail className="h-4 w-4" />
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="mt-2 h-12 w-full justify-center rounded-xl text-[15px]" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      {status ? <p className="mt-5 rounded-xl border border-[color:var(--border)] bg-black/5 px-4 py-3 text-[14px] font-medium text-[color:var(--foreground)] dark:bg-white/5">{status}</p> : null}

      <p className="mt-6 text-center text-[14px] font-medium text-[color:var(--muted)]">
        New to Nestmate?{" "}
        <Link href="/auth/signup" className="font-bold text-[color:var(--foreground)] hover:underline">
          Create an account
        </Link>
      </p>
    </Card>
  );
}
