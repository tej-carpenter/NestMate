import { Card } from "@/components/ui/card";
import { RouteAccessGate } from "@/components/auth/route-access-gate";

export default function GuestChatPage() {
  return (
    <RouteAccessGate
      variant="authenticated"
      title="Sign in to contact an owner"
      description="Guest mode allows browsing only. To message or call a host, sign in to continue."
      actionLabel="Go to login"
      actionHref="/auth/login"
    >
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">Realtime chat</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-slate-950">Booking-linked conversations with hosts</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">Supabase Realtime can power unread counts, typing indicators, and chat thread persistence here.</p>
        </Card>
      </main>
    </RouteAccessGate>
  );
}