import { Card } from "@/components/ui/card";
import { RouteAccessGate } from "@/components/auth/route-access-gate";

export default function GuestChatPage() {
  return (
    <RouteAccessGate
      variant="authenticated"
      title="Sign in to contact a host"
      description="Anonymous visitors can browse only. To message or call a host, sign in to continue."
      actionLabel="Go to login"
      actionHref="/auth/login"
    >
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center sm:p-12 border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm dark:shadow-white/5 rounded-[24px]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5 mb-6">
            <svg className="h-8 w-8 text-[color:var(--brand)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)]">Realtime chat</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--foreground)] sm:text-4xl">Booking-linked conversations</h1>
          <p className="mt-4 max-w-lg text-lg text-[color:var(--muted)]">Supabase Realtime can power unread counts, typing indicators, and chat thread persistence here.</p>
        </Card>
      </main>
    </RouteAccessGate>
  );
}