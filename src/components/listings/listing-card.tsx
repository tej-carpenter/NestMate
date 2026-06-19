"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import React from "react";
import { ArrowRight, BadgeCheck, ExternalLink, Heart, MapPin, ShieldCheck, Sparkles, Star, SquareParking, UtensilsCrossed, Users, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvailabilityBadge } from "@/components/listings/availability-badge";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/cn";
import { formatRupee } from "@/lib/format";
import { buildListingThumbnail } from "@/lib/listing-thumbnail";
import { formatPricePeriod } from "@/lib/pricing";
import { resolveGoogleMapsUrl } from "@/lib/google-maps";
import type { ListingInventoryItem } from "@/types/models";
import { canSaveListing } from "@/lib/auth/permissions";
import { loadSupabaseSessionProfile, readLocalSession } from "@/lib/session";
import { isPublicListingStatus } from "@/lib/listings/status";

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


function ListingCard({ listing, compact = false, className }: ListingCardProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [session, setSession] = useState<ReturnType<typeof readLocalSession>>(null);
  const thumbnail = listing.thumbnail ?? buildListingThumbnail(listing);
  const amenityCount = compact ? 2 : 3;
  const reviewCount = typeof listing.reviewCount === "number" ? listing.reviewCount : 0;
  const genderPreference = listing.genderPreference ?? "any";
  const hasResidentFeedback = reviewCount > 0;
  const canSave = canSaveListing(session);

  useEffect(() => {
    const refreshSession = () => setSession(readLocalSession());

    refreshSession();
    void loadSupabaseSessionProfile().then(setSession).catch(refreshSession);
    window.addEventListener("storage", refreshSession);
    window.addEventListener("nestmate-auth-change", refreshSession);

    return () => {
      window.removeEventListener("storage", refreshSession);
      window.removeEventListener("nestmate-auth-change", refreshSession);
    };
  }, []);

  return (
    <Card className={cn("group flex flex-col overflow-hidden border-0 bg-[color:var(--surface)] shadow-sm shadow-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.04)]", className)}>
      <Link href={`/listings/${listing.slug}`} className="block relative aspect-[4/3] overflow-hidden">
        <Image
          src={thumbnail}
          alt={listing.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />
        
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {listing.verified && (
            <Badge className="bg-white/95 text-emerald-700 shadow-sm border-0 dark:bg-black/80 dark:text-emerald-400">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Verified
            </Badge>
          )}
          {hasResidentFeedback && (
            <Badge className="bg-[color:var(--brand)] text-white shadow-sm border-0 dark:text-black">
              <Star className="mr-1 h-3.5 w-3.5 fill-current" /> {listing.nestscore.toFixed(1)}
            </Badge>
          )}
        </div>

        <button
          type="button"
          aria-label={canSave ? (saved ? "Remove from favorites" : "Save to favorites") : "Sign in to save listings"}
          onClick={(e) => {
            e.preventDefault();
            if (!canSave) {
              router.push("/auth/login");
              return;
            }
            setSaved((current) => !current);
          }}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition-transform hover:scale-110 dark:bg-black/80 dark:text-slate-300"
        >
          <Heart className={cn("h-4 w-4", saved && "fill-rose-500 text-rose-500")} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-[18px] font-bold leading-tight text-[color:var(--foreground)] line-clamp-1 group-hover:underline">
              <Link href={`/listings/${listing.slug}`}>{listing.title}</Link>
            </h3>
            <p className="mt-1 text-[14px] text-[color:var(--muted)] line-clamp-1">{listing.locality}, {listing.city}</p>
          </div>
          <div className="text-right">
            <p className="font-[family-name:var(--font-display)] text-[18px] font-bold text-[color:var(--foreground)]">{formatRupee(listing.price)}</p>
            <p className="text-[12px] text-[color:var(--muted)]">{formatPricePeriod(listing.priceType)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className="border border-[color:var(--border)] bg-transparent text-[color:var(--muted)] shadow-none">
            {propertyTypeLabels[listing.kind]}
          </Badge>
          <Badge className="border border-[color:var(--border)] bg-transparent text-[color:var(--muted)] shadow-none">
            {genderLabels[genderPreference]}
          </Badge>
          {listing.amenities.slice(0, amenityCount).map((amenity, index) => {
            const meta = getAmenityMeta(amenity);
            return (
              <Badge key={`${amenity}-${index}`} className="border border-[color:var(--border)] bg-transparent text-[color:var(--muted)] shadow-none flex items-center gap-1">
                <meta.icon className="h-3 w-3" /> {meta.label}
              </Badge>
            );
          })}
        </div>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between gap-2 border-t border-[color:var(--border)] pt-4">
            <div className="flex items-center gap-2 text-[13px]">
              <AvailabilityBadge availableUnits={listing.availableUnits} />
            </div>
            
            {listing.availableUnits <= 0 || listing.status === "full" ? (
              <Button disabled size="sm" className="h-9 px-4 text-[13px]">
                Not Available
              </Button>
            ) : (
              <Button asChild size="sm" className="h-9 px-4 text-[13px]">
                <Link href={`/book/${listing.slug}`}>Book</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Memoize to avoid unnecessary re-renders when parent lists change
export const MemoizedListingCard = React.memo(ListingCard) as typeof ListingCard;

export { MemoizedListingCard as ListingCard };
