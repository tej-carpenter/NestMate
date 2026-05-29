"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { deleteListingById, getBookings, getListingInventory, getPayments, getTrafficEvents, getUsers, updateListingById } from "@/lib/local-data";

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [listings, setListings] = useState<ReturnType<typeof getListingInventory>>([]);
  const [users, setUsers] = useState<ReturnType<typeof getUsers>>([]);
  const [bookings, setBookings] = useState<ReturnType<typeof getBookings>>([]);
  const [payments, setPayments] = useState<ReturnType<typeof getPayments>>([]);
  const [traffic, setTraffic] = useState<ReturnType<typeof getTrafficEvents>>([]);
  const [refreshToken, setRefreshToken] = useState(0);

  void refreshToken;

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setListings(getListingInventory());
      setUsers(getUsers());
      setBookings(getBookings());
      setPayments(getPayments());
      setTraffic(getTrafficEvents());
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(handle);
  }, [refreshToken]);

  if (!mounted) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Card className="h-40 animate-pulse p-6" />
          <div className="grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="h-32 animate-pulse p-5" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
            <Card className="h-44 animate-pulse p-6" />
            <Card className="h-44 animate-pulse p-6" />
          </div>
        </div>
      </main>
    );
  }

  const activeListings = listings.filter((listing) => listing.status === "published" && !listing.blacklisted);
  const blacklistedListings = listings.filter((listing) => listing.blacklisted);
  const bookedListingIds = new Set(bookings.filter((booking) => booking.status === "confirmed").map((booking) => booking.listingId));
  const totalVisitors = new Set(traffic.map((event) => event.visitorId)).size;
  const routeCounts = traffic.reduce<Record<string, number>>((acc, event) => {
    acc[event.route] = (acc[event.route] ?? 0) + 1;
    return acc;
  }, {});
  const listingTypeCounts = listings.reduce<Record<string, number>>((acc, listing) => {
    acc[listing.kind] = (acc[listing.kind] ?? 0) + 1;
    return acc;
  }, {});

  const topRoutes = Object.entries(routeCounts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);

  function refresh() {
    setRefreshToken((value) => value + 1);
  }

  function toggleBlacklist(listingId: string, current: boolean) {
    updateListingById(listingId, { blacklisted: !current, status: !current ? "suspended" : "published" });
    refresh();
  }

  function removeListing(listingId: string) {
    deleteListingById(listingId);
    refresh();
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Admin dashboard</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-slate-950 dark:text-slate-50">Monitoring, moderation, and inventory health</h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">Track users, traffic, bookings, payment states, and listing status across hotels, PGs, hostels, rooms, and bedspaces.</p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
          {[
            ["Total users", String(users.length)],
            ["Unique visitors", String(totalVisitors)],
            ["Total bookings", String(bookings.length)],
            ["Total payments", String(payments.length)],
            ["Total listings", String(listings.length)],
            ["Booked listings", String(bookedListingIds.size)],
            ["Active listings", String(activeListings.length)],
            ["Blacklisted", String(blacklistedListings.length)],
          ].map(([label, value]) => (
            <Card key={label} className="min-h-32 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-50">{value}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <Card className="p-6 lg:self-start">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Traffic overview</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
              {topRoutes.length > 0 ? topRoutes.map(([route, count]) => <li key={route} className="flex items-center justify-between"><span>{route}</span><strong>{count}</strong></li>) : <li>No traffic events recorded yet.</li>}
            </ul>
          </Card>

          <Card className="p-6 lg:self-start">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Listing types</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
              {Object.entries(listingTypeCounts).map(([type, count]) => (
                <li key={type} className="flex items-center justify-between">
                  <span className="uppercase">{type}</span>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
          {listings.map((property) => (
            <Card key={property.id} className="min-h-72 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{property.city}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{property.title}</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{property.locality}</p>
                </div>
                <Chip className="!rounded-full px-3 py-1 text-xs font-semibold">{property.blacklisted ? "blacklisted" : property.status}</Chip>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{property.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <Chip key={amenity} className="!rounded-full px-3 py-1 text-xs font-medium">{amenity}</Chip>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Units: {property.availableUnits}/{property.totalUnits} available</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="outline" className="sm:flex-1">
                  <Link href={`/host/listings/new?edit=${property.slug}`}>Edit</Link>
                </Button>
                <Button variant="outline" className="sm:flex-1" onClick={() => toggleBlacklist(property.id, property.blacklisted)}>
                  {property.blacklisted ? "Unblacklist" : "Blacklist"}
                </Button>
                <Button variant="ghost" className="sm:flex-1" onClick={() => removeListing(property.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}