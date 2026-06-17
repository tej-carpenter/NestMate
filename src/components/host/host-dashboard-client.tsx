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
};

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
    </div>
  );
}
