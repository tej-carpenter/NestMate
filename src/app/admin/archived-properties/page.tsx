"use client";

import { useEffect, useState } from "react";
import { RouteAccessGate } from "@/components/auth/route-access-gate";
import { ArchivedPropertiesBrowser } from "@/components/listings/archived-properties-browser";
import { getArchivedProperties, getUsers, restoreListingById } from "@/lib/local-data";

export default function AdminArchivedPropertiesPage() {
  const [mounted, setMounted] = useState(false);
  const [records, setRecords] = useState<ReturnType<typeof getArchivedProperties>>([]);
  const [users, setUsers] = useState<ReturnType<typeof getUsers>>([]);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setRecords(getArchivedProperties());
      setUsers(getUsers());
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(handle);
  }, [refreshToken]);

  if (!mounted) {
    return (
      <RouteAccessGate
        variant="moderator"
        title="Admin access required"
        description="Archived property history is available only to admins."
        actionLabel="Go to login"
        actionHref="/auth/login"
      >
        <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-72 animate-pulse rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)]" />
        </main>
      </RouteAccessGate>
    );
  }

  return (
    <RouteAccessGate
      variant="moderator"
      title="Admin access required"
      description="Archived property history is available only to admins."
      actionLabel="Go to login"
      actionHref="/auth/login"
    >
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ArchivedPropertiesBrowser
          title="Archived Properties"
          description="Inspect every removed property, search historical records, filter by reason, and restore a listing when moderation allows it."
          records={records}
          users={users}
          emptyMessage="No archived properties are stored yet. Removed listings will appear here with their history intact."
          showRestore
          onRestore={(record) => {
            restoreListingById(record.original_property_id);
            setRefreshToken((value) => value + 1);
          }}
        />
      </main>
    </RouteAccessGate>
  );
}
