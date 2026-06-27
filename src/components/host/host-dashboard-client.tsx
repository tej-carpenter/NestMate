"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Inbox, CalendarDays, Wallet, ArrowRight, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { formatRupee } from "@/lib/format";

type DashboardData = {
  activeBookings: number;
  listingViews: number;
  unreadMessages: number;
  nextPayout: number;
  listingSummary: { total: number; active: number; full: number };
  activityGraph: any[];
  recentBookings: any[];
  hostListings: any[];
};

import { updateListingAvailability } from "@/actions/host";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

export function HostDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/host")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-32 animate-pulse rounded-[20px] bg-black/5 dark:bg-white/5 shadow-none border-0" />
          ))}
        </div>
        <Card className="h-96 animate-pulse rounded-[24px] bg-black/5 dark:bg-white/5 shadow-none border-0" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm dark:shadow-white/5">
          <div className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
            <CalendarDays className="h-4 w-4" /> Active Bookings
          </div>
          <p className="mt-3 text-[32px] font-bold text-[color:var(--foreground)]">{data.activeBookings}</p>
        </Card>
        <Card className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm dark:shadow-white/5">
          <div className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
            <BarChart3 className="h-4 w-4" /> Listing Views
          </div>
          <p className="mt-3 text-[32px] font-bold text-[color:var(--foreground)]">{data.listingViews}</p>
        </Card>
        <Card className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm dark:shadow-white/5">
          <div className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
            <Inbox className="h-4 w-4" /> Unread Messages
          </div>
          <p className="mt-3 text-[32px] font-bold text-[color:var(--foreground)]">{data.unreadMessages}</p>
        </Card>
        <Card className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm dark:shadow-white/5">
          <div className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-wider text-[color:var(--muted)]">
            <Wallet className="h-4 w-4" /> Next Payout
          </div>
          <p className="mt-3 text-[32px] font-bold text-[color:var(--foreground)]">{formatRupee(data.nextPayout)}</p>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        {/* Activity Graph */}
        <Card className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm dark:shadow-white/5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-bold text-[color:var(--foreground)]">Recent Activity</h2>
              <p className="text-[14px] text-[color:var(--muted)]">Last 30 days</p>
            </div>
            <TrendingUp className="h-5 w-5 text-[color:var(--brand)]" />
          </div>
          <div className="h-[300px] w-full">
            {data.activityGraph.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.activityGraph} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="var(--border)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--border)" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "var(--surface-strong)", borderRadius: "12px", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    itemStyle={{ fontWeight: 500 }}
                  />
                  <Area type="monotone" dataKey="Views" stroke="var(--brand)" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Bookings" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="Messages" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <BarChart3 className="mb-3 h-8 w-8 text-[color:var(--muted)] opacity-50" />
                <p className="text-[15px] font-medium text-[color:var(--foreground)]">No activity yet.</p>
                <p className="text-[14px] text-[color:var(--muted)]">Your analytics will appear here once guests interact with your listings.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Manage Listings Panel */}
        <Card className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-sm dark:shadow-white/5 flex flex-col">
          <h2 className="text-[18px] font-bold text-[color:var(--foreground)]">Manage Listings</h2>
          <p className="mt-1 text-[14px] text-[color:var(--muted)]">Overview of your inventory</p>
          
          <div className="mt-6 flex-1 space-y-4">
            <div className="flex items-center justify-between rounded-[16px] bg-[color:var(--surface-strong)] p-4">
              <span className="text-[15px] font-medium text-[color:var(--foreground)]">Total Listings</span>
              <span className="text-[16px] font-bold">{data.listingSummary.total}</span>
            </div>
            <div className="flex items-center justify-between rounded-[16px] bg-[color:var(--surface-strong)] p-4">
              <span className="text-[15px] font-medium text-[color:var(--foreground)]">Active Listings</span>
              <span className="text-[16px] font-bold text-emerald-600 dark:text-emerald-400">{data.listingSummary.active}</span>
            </div>
            <div className="flex items-center justify-between rounded-[16px] bg-[color:var(--surface-strong)] p-4">
              <span className="text-[15px] font-medium text-[color:var(--foreground)]">Fully Occupied</span>
              <span className="text-[16px] font-bold text-rose-600 dark:text-rose-400">{data.listingSummary.full}</span>
            </div>
          </div>

          <div className="mt-8 grid gap-3">
            <Button asChild className="h-11 rounded-xl justify-between px-5">
              <Link href="/profile">
                View Listings <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-11 rounded-xl">
              <Link href="/host/listings/new">Add New Listing</Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* Host Listings Availability Management */}
      <div className="mt-12">
        <h2 className="text-[20px] font-bold text-[color:var(--foreground)] mb-6">Manage Listings Availability</h2>
        <Card className="overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/5 dark:bg-white/5 text-[color:var(--muted)]">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[12px]">Listing Name</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[12px]">Total Units</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[12px]">Available Units</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[12px]">Status</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[12px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {data.hostListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-[color:var(--foreground)]">{listing.title}</td>
                    <td className="px-6 py-4 text-[color:var(--foreground)]">{listing.total_units || "-"}</td>
                    <td className="px-6 py-4 font-bold text-[color:var(--foreground)]">{listing.available_units}</td>
                    <td className="px-6 py-4">
                      {listing.status === "full" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                          <XCircle className="h-3.5 w-3.5" /> Full
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await updateListingAvailability(listing.id, Math.max(0, (listing.available_units || 0) - 1));
                            toast.success("Spots decreased");
                            // Simple optimistic UI update
                            setData(prev => prev ? {
                              ...prev,
                              hostListings: prev.hostListings.map(l => l.id === listing.id ? { ...l, available_units: Math.max(0, (l.available_units || 0) - 1), status: Math.max(0, (l.available_units || 0) - 1) === 0 ? "full" : l.status } : l)
                            } : prev);
                          } catch (e: any) {
                            toast.error(e.message);
                          }
                        }}
                      >
                        -1 Spot
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const newUnits = (listing.available_units || 0) + 1;
                            await updateListingAvailability(listing.id, newUnits);
                            toast.success("Spots increased");
                            setData(prev => prev ? {
                              ...prev,
                              hostListings: prev.hostListings.map(l => l.id === listing.id ? { ...l, available_units: newUnits, status: newUnits > 0 && l.status === "full" ? "active" : l.status } : l)
                            } : prev);
                          } catch (e: any) {
                            toast.error(e.message);
                          }
                        }}
                      >
                        +1 Spot
                      </Button>
                    </td>
                  </tr>
                ))}
                {data.hostListings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[color:var(--muted)]">You have no listings yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Recent Bookings Table */}
      <div className="mt-12">
        <h2 className="text-[20px] font-bold text-[color:var(--foreground)] mb-6">Recent Bookings</h2>
        <Card className="overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/5 dark:bg-white/5 text-[color:var(--muted)]">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[12px]">Guest</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[12px]">Listing</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[12px]">Dates</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[12px]">Amount</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[12px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {data.recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[color:var(--foreground)]">{booking.users?.full_name || "Guest"}</p>
                      <p className="text-xs text-[color:var(--muted)]">{booking.users?.phone || booking.users?.email || ""}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-[color:var(--foreground)]">{booking.listings?.title}</td>
                    <td className="px-6 py-4 text-[color:var(--muted)]">
                      {new Date(booking.move_in_date).toLocaleDateString()} - {new Date(booking.move_out_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-[color:var(--foreground)]">{formatRupee(booking.rent_amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${booking.booking_status === 'confirmed' || booking.booking_status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-black/5 text-[color:var(--foreground)] dark:bg-white/10'}`}>
                        {booking.booking_status}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[color:var(--muted)]">No recent bookings.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
