"use client";

import dynamic from "next/dynamic";
import { type FormEvent, useEffect, useState } from "react";
import { Search, Navigation, Layers3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPublicListingInventory, type ListingInventoryItem } from "@/lib/local-data";
import { ListingCard } from "@/components/listings/listing-card";
import { geocodeListing, geocodeQuery } from "@/lib/nominatim";

const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[clamp(20rem,50dvh,30rem)] items-center justify-center rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] text-sm text-[color:var(--muted)] sm:h-[clamp(22rem,46dvh,34rem)] lg:h-[32rem]">
      Loading Leaflet map...
    </div>
  ),
});

type MapPoint = {
  id: string;
  title: string;
  locality: string;
  city: string;
  price: number;
  href: string;
  kind: ListingInventoryItem["kind"];
  latitude: number;
  longitude: number;
};

type SearchPoint = {
  label: string;
  latitude: number;
  longitude: number;
};

export function MapShell() {
  const [listings, setListings] = useState<ListingInventoryItem[]>([]);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPoint, setSearchPoint] = useState<SearchPoint | null>(null);
  const [status, setStatus] = useState("Map tiles are powered by OpenStreetMap and geocoding uses Nominatim.");

  useEffect(() => {
    let isActive = true;

    async function loadPoints() {
      const geocoded: Array<MapPoint | null> = await Promise.all(
        listings.map(async (listing) => {
          if (typeof listing.latitude === "number" && typeof listing.longitude === "number") {
            return {
              id: listing.id,
              title: listing.title,
              locality: listing.locality,
              city: listing.city,
              price: listing.price,
              href: `/listings/${listing.slug}`,
              kind: listing.kind,
              latitude: listing.latitude,
              longitude: listing.longitude,
            } satisfies MapPoint;
          }

          const result = await geocodeListing(listing);

          if (!result) {
            return null;
          }

          return {
            id: listing.id,
            title: listing.title,
            locality: listing.locality,
            city: listing.city,
            price: listing.price,
            href: `/listings/${listing.slug}`,
            kind: listing.kind,
            latitude: result.lat,
            longitude: result.lng,
          } satisfies MapPoint;
        }),
      );

      if (!isActive) {
        return;
      }

      const nextPoints = geocoded.flatMap((point) => (point ? [point] : []));
      setMapPoints(nextPoints);

      if (nextPoints.length === 0) {
        setStatus("Unable to geocode listings right now. Try again after a refresh.");
      }
    }

    void loadPoints();

    return () => {
      isActive = false;
    };
  }, [listings]);

  // Hydrate from client storage after mount to avoid SSR/client markup mismatch.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setListings(getPublicListingInventory());
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setSearchPoint(null);
      setStatus("Enter a city, locality, or landmark to geocode it.");
      return;
    }

    setStatus(`Geocoding ${trimmedQuery} with Nominatim...`);

    const geocoded = await geocodeQuery(trimmedQuery);

    if (!geocoded) {
      setSearchPoint(null);
      setStatus("No location match was found.");
      return;
    }

    setSearchPoint({
      label: geocoded.label,
      latitude: geocoded.lat,
      longitude: geocoded.lng,
    });
    setStatus(`Showing ${geocoded.label}.`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.18fr_0.92fr] lg:items-start">
      <Card className="order-2 p-5 sm:p-8 lg:order-1 lg:self-start">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800 dark:text-teal-300">Map discovery</p>
            <h1 className="mt-2 text-balance font-[family-name:var(--font-display)] text-3xl text-slate-950 dark:text-slate-50 sm:text-4xl">Search</h1>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
              Listings are geocoded through Nominatim and plotted on OpenStreetMap tiles using React Leaflet.
            </p>
          </div>
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-3 text-slate-600 dark:text-slate-300">
            <Layers3 className="h-5 w-5 text-teal-700 dark:text-teal-300" />
          </div>
        </div>

        <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search a city, locality, or landmark"
              className="pl-11"
            />
          </div>
          <Button type="submit" className="sm:w-auto">
            <Navigation className="mr-2 h-4 w-4" />
            Geocode
          </Button>
        </form>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{status}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
          {listings.length > 0 ? (
            listings.slice(0, 4).map((property) => <ListingCard key={property.id} listing={property} compact />)
          ) : (
            <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5 text-sm leading-6 text-slate-600 dark:text-slate-300 md:col-span-2">
              No listings are on the map yet. Publish a property to see it here.
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
          {[
            ["Leaflet", "Interactive map rendering"],
            ["OpenStreetMap", "Base map tiles"],
            ["Nominatim", "Geocoding service"],
          ].map(([label, description]) => (
            <div key={label} className="min-h-32 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
              <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="order-1 overflow-hidden p-2 sm:p-4 lg:order-2 lg:sticky lg:top-24 lg:self-start lg:min-h-0">
        <div className="overflow-hidden rounded-[2rem] bg-[color:var(--surface-strong)] p-2 shadow-lg shadow-slate-900/5">
          <LeafletMap points={mapPoints} searchPoint={searchPoint} />
        </div>
        {searchPoint ? (
          <div className="mt-4 rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 text-sm text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-slate-950 dark:text-slate-50">Focused location</p>
            <p className="mt-2 leading-6">{searchPoint.label}</p>
          </div>
        ) : null}
      </Card>
    </div>
  );
}