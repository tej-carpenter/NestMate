"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const requestOtpSchema = z.object({
  phone: z.string().min(8).optional(),
  email: z.string().email().optional(),
}).refine((value) => Boolean(value.phone || value.email), { message: "Provide a phone number or email address" });

const verifyOtpSchema = z.object({
  phone: z.string().min(8).optional(),
  email: z.string().email().optional(),
  token: z.string().min(4),
}).refine((value) => Boolean(value.phone || value.email), { message: "Provide a phone number or email address" });

export async function requestOtpAction(input: unknown) {
  const parsed = requestOtpSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp(parsed.email ? { email: parsed.email } : { phone: parsed.phone ?? "" });

  if (error) {
    throw new Error(error.message);
  }

  return { sent: true } as const;
}

export async function verifyOtpAction(input: unknown) {
  const parsed = verifyOtpSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp(
    parsed.email
      ? { email: parsed.email, token: parsed.token, type: "email" }
      : { phone: parsed.phone ?? "", token: parsed.token, type: "sms" },
  );

  if (error) {
    throw new Error(error.message);
  }

  return { verified: true } as const;
}