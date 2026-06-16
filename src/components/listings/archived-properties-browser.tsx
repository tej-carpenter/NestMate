"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Archive, CalendarDays, Filter, Search, ShieldAlert, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { type ArchivedPropertyReason } from "@/lib/database/schema";

export const archivedPropertyReasons: Record<ArchivedPropertyReason, string> = {
  owner_removed: "Owner removed",
  admin_removed: "Admin removed",
  policy_violation: "Policy violation",
  duplicate_listing: "Duplicate listing",
  expired: "Expired",
  other: "Other",
};

export type ArchivedPropertyRecord = any;
export type PersistedUser = any;
import { formatDateTime, formatRupee } from "@/lib/format";

function reasonLabel(reason: ArchivedPropertyReason) {
  if (reason === "owner_removed") return "Owner removed";
  if (reason === "admin_removed") return "Admin removed";
  if (reason === "policy_violation") return "Policy violation";
  if (reason === "duplicate_listing") return "Duplicate listing";
  if (reason === "expired") return "Expired";
  return "Other";
}

function statusLabel(record: ArchivedPropertyRecord) {
  if (record.restored_at) return "Restored";
  return "Archived";
}

export function ArchivedPropertiesBrowser({
  title,
  description,
  records,
  users,
  emptyMessage,
  showRestore = false,
  onRestore,
}: {
  title: string;
  description: string;
  records: ArchivedPropertyRecord[];
  users: PersistedUser[];
  emptyMessage: string;
  showRestore?: boolean;
  onRestore?: (record: ArchivedPropertyRecord) => void;
}) {
  const [query, setQuery] = useState("");
  const [reasonFilter, setReasonFilter] = useState<ArchivedPropertyReason | "all">("all");
  const [restoredFilter, setRestoredFilter] = useState<"all" | "archived" | "restored">("all");

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      const owner = users.find((user) => user.id === record.owner_id || user.phone === record.owner_phone);
      const matchesQuery =
        !normalizedQuery ||
        record.title.toLowerCase().includes(normalizedQuery) ||
        record.location.toLowerCase().includes(normalizedQuery) ||
        record.owner_name.toLowerCase().includes(normalizedQuery) ||
        record.owner_phone.toLowerCase().includes(normalizedQuery) ||
        owner?.name?.toLowerCase().includes(normalizedQuery) ||
        owner?.phone?.toLowerCase().includes(normalizedQuery);
      const matchesReason = reasonFilter === "all" || record.archived_reason === reasonFilter;
      const matchesRestored =
        restoredFilter === "all" ||
        (restoredFilter === "archived" && !record.restored_at) ||
        (restoredFilter === "restored" && Boolean(record.restored_at));

      return matchesQuery && matchesReason && matchesRestored;
    });
  }, [query, reasonFilter, records, restoredFilter, users]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm shadow-slate-900/5 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Archive history</p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl text-slate-950 dark:text-slate-50">{title}</h1>
            <p className="text-base leading-7 text-slate-600 dark:text-slate-300">{description}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Archive className="h-4 w-4 text-teal-700 dark:text-teal-300" />
            {filteredRecords.length} record{filteredRecords.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_0.7fr_0.7fr]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, location, or owner" className="pl-11" />
          </label>
          <label className="relative block">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={reasonFilter}
              onChange={(event) => setReasonFilter(event.target.value as ArchivedPropertyReason | "all")}
              className="h-11 w-full rounded-[1rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] pl-11 pr-4 text-sm text-slate-700 outline-none"
            >
              <option value="all">All reasons</option>
              {(Object.keys(archivedPropertyReasons) as ArchivedPropertyReason[]).map((reason) => (
                <option key={reason} value={reason}>
                  {reasonLabel(reason)}
                </option>
              ))}
            </select>
          </label>
          <label className="relative block">
            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={restoredFilter}
              onChange={(event) => setRestoredFilter(event.target.value as "all" | "archived" | "restored")}
              className="h-11 w-full rounded-[1rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] pl-11 pr-4 text-sm text-slate-700 outline-none"
            >
              <option value="all">All records</option>
              <option value="archived">Archived only</option>
              <option value="restored">Restored only</option>
            </select>
          </label>
        </div>
      </Card>

      {filteredRecords.length === 0 ? (
        <Card className="p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-teal-700 dark:text-teal-300" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800 dark:text-teal-300">No archived listings</p>
              <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">{emptyMessage}</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRecords.map((record) => {
            const owner = users.find((user) => user.id === record.owner_id || user.phone === record.owner_phone);

            return (
              <Card key={record.id} className="overflow-hidden border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm shadow-slate-900/5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip className="!rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                        {statusLabel(record)}
                      </Chip>
                      <Chip className="!rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                        {reasonLabel(record.archived_reason)}
                      </Chip>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">{record.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{record.location}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Pricing</p>
                        <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-slate-50">
                          {formatRupee(record.pricing.amount)} / {record.pricing.price_type}
                        </p>
                      </div>
                      <div className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Property type</p>
                        <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-slate-50">{record.property_type.toUpperCase()}</p>
                      </div>
                      <div className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Archived date</p>
                        <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-slate-50">{formatDateTime(record.archived_at)}</p>
                      </div>
                      <div className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Owner</p>
                        <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-slate-50">{owner?.name ?? record.owner_name}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{owner?.phone ?? record.owner_phone}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2">
                        <UserRound className="h-4 w-4 text-teal-700 dark:text-teal-300" />
                        Archived by {record.archived_by}
                      </span>
                      {record.restored_at ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2">
                          <CalendarDays className="h-4 w-4 text-teal-700 dark:text-teal-300" />
                          Restored on {formatDateTime(record.restored_at)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:w-56">
                    {showRestore ? (
                      <Button type="button" onClick={() => onRestore?.(record)} disabled={Boolean(record.restored_at)}>
                        {record.restored_at ? "Restored" : "Restore archived listing"}
                      </Button>
                    ) : null}
                    <Button asChild variant="outline">
                      <Link href={`/listings/${record.snapshot.slug}`}>View snapshot</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
