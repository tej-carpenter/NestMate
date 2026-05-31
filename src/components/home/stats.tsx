"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getBookings, getPublicListingInventory } from "@/lib/local-data";

export default function Stats() {
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [cityCount, setCityCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const listings = getPublicListingInventory();
      setVerifiedCount(listings.filter((l) => l.verified).length);
      setCityCount(new Set(listings.map((l) => l.city)).size);
      const bookings = getBookings();
      setBookingCount(bookings.length);
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  const stats = [
    {
      label: "Verified stays",
      value: verifiedCount > 0 ? verifiedCount.toString() : "Verification in progress",
      detail: verifiedCount > 0 ? "Listings verified from actual records." : "No verified stays yet.",
    },
    {
      label: "Cities covered",
      value: cityCount > 0 ? cityCount.toString() : "Recently added",
      detail: cityCount > 0 ? "Cities with live listings in inventory." : "No city coverage yet.",
    },
    {
      label: "Successful bookings",
      value: bookingCount > 0 ? bookingCount.toString() : "Awaiting first booking",
      detail: bookingCount > 0 ? "Bookings created by real user actions." : "No completed booking records yet.",
    },
  ];

  return (
    <div className="grid gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-white/60 bg-white/80 p-4 shadow-sm shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-slate-950/40">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{stat.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{stat.value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{stat.detail}</p>
        </Card>
      ))}
    </div>
  );
}
