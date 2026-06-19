"use client";

import { useEffect, useState } from "react";
import { RouteAccessGate } from "@/components/auth/route-access-gate";
import { ArchivedPropertiesBrowser } from "@/components/listings/archived-properties-browser";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminArchivedPropertiesPage() {
  const [mounted, setMounted] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const [{ data: dbArchived }, { data: dbUsers }] = await Promise.all([
        supabase.from("listings").select("*").eq("status", "archived"),
        supabase.from("users").select("*"),
      ]);
      if (active) {
        setRecords(dbArchived as any || []);
        setUsers(dbUsers as any || []);
        setMounted(true);
      }
    }
    void load();
    return () => { active = false; };
  }, [refreshToken]);

  function refreshData() {
    setRefreshToken(r => r + 1);
  }

  async function handleRestore(id: string) {
    const supabase = createSupabaseBrowserClient();
    await (supabase.from("listings") as any).update({ status: "approved" }).eq("id", id);
    refreshData();
  }

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
            void handleRestore(record.original_property_id);
          }}
        />
      </main>
    </RouteAccessGate>
  );
}
