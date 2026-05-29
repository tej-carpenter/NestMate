import { createHmac } from "node:crypto";

export interface RazorpayOrderInput {
  amount: number;
  currency?: "INR";
  receipt: string;
  notes?: Record<string, string>;
}

export function buildRazorpayOrderPayload(input: RazorpayOrderInput) {
  return {
    amount: Math.round(input.amount * 100),
    currency: input.currency ?? "INR",
    receipt: input.receipt,
    notes: input.notes ?? {},
  };
}

export function verifyRazorpayWebhookSignature(payload: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  return expected === signature;
}