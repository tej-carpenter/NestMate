"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import React from "react";
import { ArrowRight, BadgeCheck, Heart, MapPin, ShieldCheck, Sparkles, Star, SquareParking, UtensilsCrossed, Users, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/cn";
import { formatRupee } from "@/lib/format";
import { buildListingThumbnail } from "@/lib/listing-thumbnail";
import { formatPricePeriod } from "@/lib/pricing";
import type { ListingInventoryItem } from "@/lib/local-data";

type ListingCardProps = {
  listing: ListingInventoryItem;
  compact?: boolean;
  className?: string;
};

type AmenityMeta = {
  icon: typeof Wifi;
  label: string;
};

const genderLabels: Record<ListingInventoryItem["genderPreference"], string> = {
  male: "Male only",
  female: "Female only",
  any: "Any gender",
};

const propertyTypeLabels: Record<ListingInventoryItem["kind"], string> = {
  hotel: "Hotel",
  pg: "PG",
  hostel: "Hostel",
  room: "Room",
  bed: "Bedspace",
  apartment: "Apartment",
  lodge: "Lodge",
};

function getAmenityMeta(amenity: string): AmenityMeta {
  const normalized = amenity.toLowerCase();

  if (normalized.includes("wifi")) {
    return { icon: Wifi, label: "Wi-Fi" };
  }

  if (normalized.includes("food") || normalized.includes("mess") || normalized.includes("kitchen") || normalized.includes("meal")) {
    return { icon: UtensilsCrossed, label: amenity };
  }

  if (normalized.includes("parking") || normalized.includes("garage") || normalized.includes("bike")) {
    return { icon: SquareParking, label: amenity };
  }

  if (normalized.includes("security") || normalized.includes("cctv") || normalized.includes("guard") || normalized.includes("gate")) {
    return { icon: ShieldCheck, label: amenity };
  }

  if (normalized.includes("house") || normalized.includes("clean") || normalized.includes("laundry") || normalized.includes("backup")) {
    return { icon: Sparkles, label: amenity };
  }

  return { icon: Users, label: amenity };
}

function formatAvailability(listing: ListingInventoryItem) {
  if (listing.blacklisted) {
    return { label: "Unavailable", tone: "danger" as const, width: 0 };
  }

  if (listing.totalUnits <= 0 || listing.availableUnits <= 0) {
    return { label: "Availability not listed yet", tone: "muted" as const, width: 0 };
  }

  const occupied = Math.max(0, listing.totalUnits - listing.availableUnits);
  const width = listing.totalUnits > 0 ? Math.round((occupied / listing.totalUnits) * 100) : 0;

  if (listing.availableUnits <= 0) {
    return { label: "Fully occupied", tone: "danger" as const, width: 100 };
  }

  return {
    label: `${listing.availableUnits} of ${listing.totalUnits} available`,
    tone: listing.availableUnits <= Math.max(1, Math.ceil(listing.totalUnits * 0.25)) ? ("warn" as const) : ("success" as const),
    width,
  };
}

function ListingCard({ listing, compact = false, className }: ListingCardProps) {
  const [saved, setSaved] = useState(false);
  const thumbnail = listing.thumbnail ?? buildListingThumbnail(listing);
  const availability = useMemo(() => formatAvailability(listing), [listing]);
  const amenityCount = compact ? 3 : 4;
  const description = compact ? listing.description.slice(0, 96) : listing.description;
  const reviewCount = typeof listing.reviewCount === "number" ? listing.reviewCount : 0;
  const genderPreference = listing.genderPreference ?? "any";
  const hasResidentFeedback = reviewCount > 0;

  return (
    <Card className={cn("group overflow-hidden border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(15,23,42,0.28)] dark:hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.42)]", className)}>
      <article className={cn("grid h-full", compact ? "grid-rows-[220px_auto]" : "grid-rows-[260px_auto]")}>
        <div className="relative overflow-hidden">
          <Image
            src={thumbnail}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/15 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge className="inline-flex items-center gap-2 bg-white/92 dark:bg-slate-950/80">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              {listing.verified ? "Verified stay" : "Needs verification"}
            </Badge>
            <Badge className="inline-flex items-center gap-2 bg-[color:var(--brand)] text-white">
              <Star className="h-3.5 w-3.5 fill-current" />
              {hasResidentFeedback ? `${listing.nestscore.toFixed(1)} NestScore` : "Awaiting resident feedback"}
            </Badge>
          </div>

          <button
            type="button"
            aria-label={saved ? "Remove from favorites" : "Save to favorites"}
            aria-pressed={saved}
            onClick={() => setSaved((current) => !current)}
            className={cn(
              "absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] backdrop-blur transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--ring)]",
              saved && "bg-rose-500/95 text-white",
            )}
          >
            <Heart className={cn("h-4.5 w-4.5 transition-transform duration-200", saved && "fill-current")} />
          </button>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="max-w-[75%]">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">{listing.city}</p>
              <h3 className="mt-1 line-clamp-2 break-words text-2xl font-semibold leading-tight text-white drop-shadow-sm sm:text-[1.7rem]">{listing.title}</h3>
            </div>
            <div className="hidden shrink-0 rounded-[var(--radius-md)] border border-white/20 bg-white/12 px-3 py-2 text-right text-white shadow-sm backdrop-blur sm:block">
              <p className="text-lg font-semibold">{formatRupee(listing.price)}</p>
              <p className="text-xs text-white/75">{formatPricePeriod(listing.priceType)}</p>
            </div>
          </div>
        </div>

        <div className={cn("flex h-full flex-col gap-4 p-5 sm:p-6", compact && "p-4", !compact && "sm:gap-5")}>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Badge className="inline-flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-teal-700 dark:text-teal-300" />
              {listing.locality}
            </Badge>
            <Badge>{propertyTypeLabels[listing.kind]}</Badge>
            <Badge className="inline-flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-teal-700 dark:text-teal-300" />
              {genderLabels[genderPreference]}
            </Badge>
            <Badge className="inline-flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              {hasResidentFeedback ? `${reviewCount} reviews` : "No reviews yet"}
            </Badge>
          </div>

          <p className={cn("text-sm leading-6 text-slate-600 dark:text-slate-300", compact && "line-clamp-2")}>{description}</p>

          <div className="space-y-2 rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
            <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="font-semibold text-slate-950 dark:text-slate-50">Availability</span>
              <span className={cn(
                "break-words",
                "font-medium",
                availability.tone === "danger" && "text-rose-600 dark:text-rose-400",
                availability.tone === "warn" && "text-amber-600 dark:text-amber-300",
                availability.tone === "success" && "text-emerald-600 dark:text-emerald-300",
                availability.tone === "muted" && "text-slate-500 dark:text-slate-400",
              )}>
                {availability.label}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/80">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  availability.tone === "danger" && "bg-rose-500",
                  availability.tone === "warn" && "bg-amber-500",
                  availability.tone === "success" && "bg-teal-600",
                  availability.tone === "muted" && "bg-slate-400/50",
                )}
                style={{ width: `${availability.width}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {listing.amenities.slice(0, amenityCount).map((amenity) => {
              const meta = getAmenityMeta(amenity);
              const Icon = meta.icon;

              return (
                <Chip key={amenity} className="inline-flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-teal-700 dark:text-teal-300" />
                  {meta.label}
                </Chip>
              );
            })}
            {listing.amenities.length > amenityCount ? (
              <Chip className="inline-flex items-center">+{listing.amenities.length - amenityCount} more</Chip>
            ) : null}
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-1 sm:flex-row">
            <Button asChild className="w-full flex-1 justify-center shadow-sm shadow-teal-900/10">
              <Link href={`/book/${listing.slug}`}>
                Book now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full flex-1 justify-center">
              <Link href={`/listings/${listing.slug}`}>View details</Link>
            </Button>
          </div>
        </div>
      </article>
    </Card>
  );
}

// Memoize to avoid unnecessary re-renders when parent lists change
export const MemoizedListingCard = React.memo(ListingCard) as typeof ListingCard;

export { MemoizedListingCard as ListingCard };