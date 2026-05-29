import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  mode: z.enum(["request", "verify"]),
  phone: z.string().min(8).optional(),
  email: z.string().email().optional(),
  token: z.string().min(4).optional(),
}).refine((value) => Boolean(value.phone || value.email), { message: "Provide a phone number or email address" });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json({ error: "Supabase auth is not configured" }, { status: 503 });
  }

  const supabase = await createSupabaseServerClient();
  const identifier = parsed.data.phone ?? parsed.data.email;

  if (parsed.data.mode === "request") {
    const { error } = await supabase.auth.signInWithOtp(parsed.data.email ? { email: parsed.data.email } : { phone: parsed.data.phone ?? "" });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ sent: true });
  }

  const { error } = await supabase.auth.verifyOtp(
    parsed.data.email
      ? { email: parsed.data.email, token: parsed.data.token ?? "", type: "email" }
      : { phone: parsed.data.phone ?? "", token: parsed.data.token ?? "", type: "sms" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ verified: true });
}