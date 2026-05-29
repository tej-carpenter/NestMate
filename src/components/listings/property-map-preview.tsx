"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Navigation2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { geocodeListing } from "@/lib/nominatim";
import type { ListingInventoryItem } from "@/lib/local-data";

const LeafletMap = dynamic(() => import("@/components/map/leaflet-map"), {
  ssr: false,
  loading: () => <div className="flex h-[clamp(16rem,34dvh,22rem)] items-center justify-center rounded-[2rem] bg-[color:var(--surface-strong)] text-sm text-[color:var(--muted)] sm:h-[clamp(18rem,30dvh,24rem)] lg:h-[24rem]">Loading map preview...</div>,
});

export function PropertyMapPreview({ listing }: { listing: ListingInventoryItem }) {
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState("Map preview powered by OpenStreetMap and Nominatim.");

  const query = useMemo(() => `${listing.title}, ${listing.locality}, ${listing.city}, India`, [listing.city, listing.locality, listing.title]);

  useEffect(() => {
    let active = true;

    async function loadLocation() {
      if (typeof listing.latitude === "number" && typeof listing.longitude === "number") {
        setPoint({ lat: listing.latitude, lng: listing.longitude });
        setStatus("Using stored coordinates for this listing.");
        return;
      }

      setStatus("Resolving the property location...");
      const result = await geocodeListing({ title: listing.title, locality: listing.locality, city: listing.city });

      if (!active) {
        return;
      }

      if (result) {
        setPoint({ lat: result.lat, lng: result.lng });
        setStatus(`Showing ${result.label}.`);
        return;
      }

      setStatus("Unable to load the map preview right now.");
    }

    void loadLocation();

    return () => {
      active = false;
    };
  }, [listing.city, listing.latitude, listing.locality, listing.longitude, listing.title]);

  return (
    <Card className="overflow-hidden border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-sm shadow-slate-900/5">
      <div className="flex items-start justify-between gap-3 border-b border-[color:var(--border)] px-1 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Map preview</p>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{query}</p>
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-900 dark:bg-teal-500/15 dark:text-teal-100">
          <Navigation2 className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-2">
        {point ? (
          <LeafletMap
            points={[
              {
                id: listing.id,
                title: listing.title,
                locality: listing.locality,
                city: listing.city,
                price: listing.price,
                href: `/listings/${listing.slug}`,
                kind: listing.kind,
                latitude: point.lat,
                longitude: point.lng,
              },
            ]}
            searchPoint={null}
          />
        ) : (
          <div className="flex h-[320px] flex-col items-center justify-center rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(15,118,110,0.10),rgba(248,250,252,0.95))] px-6 text-center dark:bg-[linear-gradient(180deg,rgba(15,118,110,0.18),rgba(15,23,42,0.92))] sm:h-[380px] lg:h-[460px]">
            <MapPin className="h-6 w-6 text-teal-700 dark:text-teal-300" />
            <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-slate-50">Preparing map preview</p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">{status}</p>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">{status}</p>
    </Card>
  );
}