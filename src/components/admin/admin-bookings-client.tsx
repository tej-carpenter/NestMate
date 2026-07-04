"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatRupee } from "@/lib/format";

export function AdminBookingsClient() {
  const [mounted, setMounted] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      const supabase = createSupabaseBrowserClient();
      
      const { data: dbBookings, error: bookingsError } = await (supabase.from("bookings").select("*") as any).order("created_at", { ascending: false });
        
      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
      }

      let enrichedBookings = dbBookings || [];

      if (enrichedBookings.length > 0) {
        const guestIds = Array.from(new Set(enrichedBookings.map((b: any) => b.guest_id).filter(Boolean)));
        const listingIds = Array.from(new Set(enrichedBookings.map((b: any) => b.listing_id).filter(Boolean)));
        
        const [usersRes, listingsRes] = await Promise.all([
          (supabase.from("users").select("id, full_name, phone, email") as any).in("id", guestIds),
          (supabase.from("listings").select("id, title, host_id") as any).in("id", listingIds)
        ]);

        const usersMap = new Map(usersRes.data?.map((u: any) => [u.id, u]) || []);
        const listingsMap = new Map(listingsRes.data?.map((l: any) => [l.id, l]) || []);

        enrichedBookings = enrichedBookings.map((b: any) => ({
          ...b,
          users: usersMap.get(b.guest_id),
          listings: listingsMap.get(b.listing_id)
        }));
      }
        
      if (active) {
        setBookings(enrichedBookings);
        setMounted(true);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  if (!mounted) {
    return (
      <Card className="h-64 animate-pulse p-6" />
    );
  }

  return (
    <Card className="overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 dark:bg-white/5 text-[color:var(--muted)]">
            <tr>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[12px]">Booking ID</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[12px]">Guest</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[12px]">Listing</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[12px]">Host ID</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[12px]">Amount</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[12px]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--border)]">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 text-xs font-mono text-[color:var(--muted)]">
                  {booking.id.split("-")[0]}...
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-[color:var(--foreground)]">{booking.users?.full_name || "Guest"}</p>
                  <p className="text-xs text-[color:var(--muted)]">{booking.users?.phone || booking.users?.email || ""}</p>
                </td>
                <td className="px-6 py-4 font-medium text-[color:var(--foreground)]">{booking.listings?.title}</td>
                <td className="px-6 py-4 text-xs font-mono text-[color:var(--muted)]">
                  {booking.listings?.host_id?.split("-")[0]}...
                </td>
                <td className="px-6 py-4 font-medium text-[color:var(--foreground)]">{formatRupee(booking.rent_amount)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${booking.booking_status === 'confirmed' || booking.booking_status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-black/5 text-[color:var(--foreground)] dark:bg-white/10'}`}>
                    {booking.booking_status}
                  </span>
                  {booking.booking_status === 'confirmed' && (
                    <div className="mt-2">
                      <a href={`/payment/${booking.id}/receipt`} className="text-xs text-[color:var(--brand)] hover:underline font-medium">View Receipt</a>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[color:var(--muted)]">No bookings found in system.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
