import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CalendarDays, MessageSquareText, PhoneCall, TimerReset } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { HostContactChannel, PublicHostProfile } from "@/lib/local-data";
import { canContactOwner } from "@/lib/auth/permissions";
import { loadSupabaseSessionProfile, readLocalSession } from "@/lib/session";
import { useEffect, useState } from "react";

function formatJoinedDate(value: number) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

function responseWindowLabel(windowValue: PublicHostProfile["responsePreference"]["responseWindow"]) {
  if (windowValue === "within_1_hour") return "Usually within 1 hour";
  if (windowValue === "within_4_hours") return "Usually within 4 hours";
  return "Usually within 24 hours";
}

function channelLabel(channel: HostContactChannel) {
  if (channel === "in_app_chat") return "In-app chat";
  if (channel === "visit_request") return "Request visit";
  return "Request call";
}

function channelHref(channel: HostContactChannel, hostId: string, listingSlug?: string) {
  if (channel === "visit_request") {
    return listingSlug ? `/book/${listingSlug}` : "/search";
  }

  if (channel === "call_request") {
    return `/guest/chat?host=${hostId}&intent=call`;
  }

  return `/guest/chat?host=${hostId}`;
}

export function HostProfileCard({
  host,
  currentListingSlug,
  compact = false,
  showPortfolio = true,
}: {
  host: PublicHostProfile;
  currentListingSlug?: string;
  compact?: boolean;
  showPortfolio?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<ReturnType<typeof readLocalSession>>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSession(readLocalSession());
      void loadSupabaseSessionProfile().then(setSession).catch(() => setSession(readLocalSession()));
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  const canContact = canContactOwner(session);

  return (
    <Card className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]">
          <Image src={host.profilePhoto} alt={host.displayName} fill unoptimized sizes="56px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-slate-950 dark:text-slate-50">{host.displayName}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge className="gap-1.5 bg-[color:var(--surface)] text-slate-700 dark:text-slate-200">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              {host.verified ? "Verified host" : "Verification in progress"}
            </Badge>
            <Badge className="gap-1.5 bg-[color:var(--surface)] text-slate-700 dark:text-slate-200">
              <CalendarDays className="h-3.5 w-3.5 text-teal-700 dark:text-teal-300" />
              Joined {formatJoinedDate(host.joinedAt)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[1.25rem] bg-[color:var(--surface)] p-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
        <p className="font-semibold text-slate-950 dark:text-slate-50">Response preferences</p>
        <p className="mt-1 inline-flex items-center gap-2">
          <TimerReset className="h-4 w-4 text-teal-700 dark:text-teal-300" />
          {responseWindowLabel(host.responsePreference.responseWindow)}
        </p>
        <p className="mt-1">Preferred channel: {channelLabel(host.responsePreference.preferredChannel)}</p>
        <p className="mt-1">{host.responsePreference.availabilityNote}</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {!mounted ? (
          <div className="h-11 rounded-[1rem] bg-[color:var(--surface)] sm:col-span-3" />
        ) : canContact ? (
          host.contactOptions.map((channel) => (
            <Button key={channel} asChild variant="outline" className="h-11 justify-center text-sm">
              <Link href={channelHref(channel, host.id, currentListingSlug)}>
                {channel === "in_app_chat" ? <MessageSquareText className="h-4 w-4" /> : null}
                {channel === "call_request" ? <PhoneCall className="h-4 w-4" /> : null}
                {channelLabel(channel)}
              </Link>
            </Button>
          ))
        ) : (
          <Button asChild variant="outline" className="h-11 justify-center text-sm sm:col-span-3">
            <Link href="/auth/login">
              <MessageSquareText className="h-4 w-4" />
              Sign in to contact owner
            </Link>
          </Button>
        )}
      </div>

      {showPortfolio ? (
        <div className="mt-4 rounded-[1.25rem] bg-[color:var(--surface)] p-4">
          <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">Property portfolio</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Active listings</p>
          <div className="mt-3 grid gap-2">
            {host.activeListings.length > 0 ? (
              host.activeListings.slice(0, compact ? 2 : 4).map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.slug}`}
                  className="flex items-center justify-between gap-3 rounded-[1rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-sm text-slate-700 transition hover:border-teal-500/40 hover:text-slate-950 dark:text-slate-200 dark:hover:text-slate-50"
                >
                  <span className="truncate">{listing.title}</span>
                  <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{listing.city}</span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">No approved listings yet.</p>
            )}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
