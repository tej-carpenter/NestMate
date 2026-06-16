"use client";

import { useEffect, useState } from "react";
import { RouteAccessGate } from "@/components/auth/route-access-gate";
import { ArchivedPropertiesBrowser } from "@/components/listings/archived-properties-browser";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { readLocalSession } from "@/lib/session";

export default function ArchivedListingsPage() {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<ReturnType<typeof readLocalSession>>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      const nextSession = readLocalSession();
      if (active) setSession(nextSession);
      
      const supabase = createSupabaseBrowserClient();
      const [{ data: dbArchived }, { data: dbUsers }] = await Promise.all([
        supabase.from("listings").select("*").eq("status", "archived").eq("host_phone", nextSession?.phone || ""),
        supabase.from("users").select("*"),
      ]);
      
      if (active) {
        setUsers(dbUsers as any || []);
        setRecords(dbArchived as any || []);
        setMounted(true);
      }
    }
    void load();

    return () => { active = false; };
  }, []);

  return (
    <RouteAccessGate
      variant="authenticated"
      title="Sign in to view archived listings"
      description="Only signed-in users can see their own archived property history."
      actionLabel="Go to login"
      actionHref="/auth/login"
    >
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {!mounted ? (
          <div className="h-72 animate-pulse rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)]" />
        ) : (
          <ArchivedPropertiesBrowser
            title="My Archived Listings"
            description="Review the properties you removed from the marketplace. Other users cannot see this history."
            records={records}
            users={users}
            emptyMessage="You do not have any archived listings yet. If you remove a property, it will appear here."
          />
        )}
      </main>
    </RouteAccessGate>
  );
}
