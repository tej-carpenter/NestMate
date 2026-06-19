import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CalendarDays, ChevronDown, ExternalLink, Home, MapPin, ShieldCheck, Sparkles, Star, Users2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AvailabilityBadge } from "@/components/listings/availability-badge";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatRupee } from "@/lib/format";
import { resolveGoogleMapsUrl } from "@/lib/google-maps";
import ReviewSection from "@/components/listings/review-section";
import { HostProfileCard } from "@/components/host/host-profile-card";
import { formatPricePeriod } from "@/lib/pricing";
import { canEditListing } from "@/lib/auth/permissions";
import type { ListingActor, ListingInventoryItem, PublicHostProfile } from "@/types/models";
import { getListingStatusLabel, isPublicListingStatus } from "@/lib/listings/status";
import ViewTracker from "@/components/listings/view-tracker";

const cityLandmarks: Record<string, { name: string; distance: string; note: string }[]> = {
  Indore: [
    { name: "ORR tech corridor", distance: "12 min drive", note: "Ideal for daily office commutes" },
    { name: "Bellandur Lake", distance: "8 min walk", note: "Open space and evening walks" },
    { name: "EcoSpace / RMZ", distance: "15 min drive", note: "Popular employment hubs" },
  ],
  Delhi: [
    { name: "Rajiv Chowk Metro", distance: "6 min walk", note: "Fast access across the city" },
    { name: "Connaught Place market", distance: "4 min walk", note: "Food, cafes, and errands" },
    { name: "Barakhamba corridor", distance: "10 min drive", note: "Corporate offices nearby" },
  ],
  Pune: [
    { name: "Hinjewadi Phase 1", distance: "12 min drive", note: "Tech park commute" },
    { name: "Metro access point", distance: "9 min drive", note: "Reliable local connectivity" },
    { name: "Balewadi High Street", distance: "18 min drive", note: "Food and leisure nearby" },
  ],
  Chennai: [
    { name: "Anna Nagar metro", distance: "7 min drive", note: "Easy city connectivity" },
    { name: "Padi industrial belt", distance: "14 min drive", note: "Work commute convenience" },
    { name: "Shopping avenues", distance: "5 min walk", note: "Daily essentials nearby" },
  ],
};

const houseRules = [
  "Visitor access only with host approval.",
  "Quiet hours after 10:30 PM.",
  "Pets are not allowed in shared spaces.",
  "Valid ID required at move-in.",
];

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



function getAmenityIcon(amenity: string) {
  const normalized = amenity.toLowerCase();
  if (normalized.includes("wifi")) return Sparkles;
  if (normalized.includes("food") || normalized.includes("kitchen") || normalized.includes("meal")) return Home;
  if (normalized.includes("parking")) return MapPin;
  return ShieldCheck;
}

function GalleryTile({
  image,
  title,
  caption,
  featured = false,
}: {
  image: string;
  title: string;
  caption: string;
  featured?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] ${featured ? "min-h-[26rem] sm:min-h-[34rem]" : "min-h-[12rem] sm:min-h-[16rem]"}`}>
      <Image src={image} alt={title} fill unoptimized sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">{caption}</p>
        <p className="mt-1 text-base font-semibold text-white sm:text-lg">{title}</p>
      </div>
    </div>
  );
}

export default function ListingPageTemplate({
  listing,
  inventory,
  hostProfile,
  currentUser,
  onDeleteListing,
}: {
  listing: ListingInventoryItem;
  inventory: ListingInventoryItem[];
  hostProfile: PublicHostProfile | null;
  currentUser: ListingActor | null;
  onDeleteListing?: (listingId: string) => void;
}) {
  const hasImages = listing.images && listing.images.length > 0;
  const heroImageSrc = hasImages ? listing.images[0] : listing.thumbnail;
  const landmarks = cityLandmarks[listing.city] ?? cityLandmarks.Indore;
  const hasResidentFeedback = (listing.reviewCount ?? 0) > 0;
  const canManage = canEditListing(currentUser, listing);
  const isBookable = isPublicListingStatus(listing.status, listing.moderationState);
  const googleMapsUrl = resolveGoogleMapsUrl(
    { title: listing.title, locality: listing.locality, city: listing.city },
    listing.googleMapsUrl,
  );
  const locationAddress = listing.address && listing.address.trim().length > 0 ? listing.address : `${listing.locality}, ${listing.city}`;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <ViewTracker slug={listing.slug} />
      {/* Edge-to-edge Hero Image */}
      <div className="relative mb-6 h-[40vh] min-h-[300px] w-full overflow-hidden rounded-[24px] sm:h-[50vh] lg:h-[60vh]">
        <Image src={heroImageSrc} alt={listing.title} fill unoptimized sizes="100vw" className="object-cover" />
      </div>

      {/* Image Gallery */}
      {hasImages && listing.images.length > 1 && (
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {listing.images.slice(1).map((imgUrl, idx) => (
            <div key={idx} className="relative aspect-video overflow-hidden rounded-xl bg-[color:var(--surface-strong)]">
              <Image src={imgUrl} alt={`${listing.title} - view ${idx + 2}`} fill unoptimized className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_400px] lg:items-start">
        <section className="space-y-12">
          {/* Header Info */}
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[color:var(--foreground)] sm:text-5xl">{listing.title}</h1>
            <p className="mt-2 text-lg text-[color:var(--muted)]">
              {listing.locality}, {listing.city} · {propertyTypeLabels[listing.kind]} · {genderLabels[listing.genderPreference ?? "any"]}
            </p>
            
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {listing.verified && (
                <Badge className="bg-emerald-50 text-emerald-700 shadow-none border-0 dark:bg-emerald-500/10 dark:text-emerald-400 py-1.5 px-3">
                  <ShieldCheck className="mr-1.5 h-4 w-4" /> Verified stay
                </Badge>
              )}
              {hasResidentFeedback && (
                <Badge className="bg-[color:var(--foreground)] text-[color:var(--background)] shadow-none border-0 py-1.5 px-3">
                  <Star className="mr-1.5 h-4 w-4 fill-current" /> {listing.nestscore.toFixed(1)} NestScore
                </Badge>
              )}
            </div>
          </div>

          <hr className="border-[color:var(--border)]" />

          {/* Overview */}
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--foreground)]">Overview</h2>
            <p className="mt-4 text-base leading-relaxed text-[color:var(--muted)]">
              {listing.description}
            </p>
          </div>

          <hr className="border-[color:var(--border)]" />

          {/* Amenities */}
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--foreground)]">Amenities</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {listing.amenities.length > 0 ? listing.amenities.map((amenity, index) => {
                const Icon = getAmenityIcon(amenity);
                return (
                  <div key={`${amenity}-${index}`} className="flex items-center gap-3 text-[15px] text-[color:var(--foreground)]">
                    <Icon className="h-5 w-5 text-[color:var(--muted)]" />
                    {amenity}
                  </div>
                );
              }) : (
                <div className="col-span-full text-[15px] text-[color:var(--muted)]">Amenities will appear once the host publishes them.</div>
              )}
            </div>
          </section>

          <hr className="border-[color:var(--border)]" />

          {/* Locality */}
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--foreground)]">Location</h2>
            <p className="mt-2 text-[15px] text-[color:var(--muted)]">{locationAddress}</p>
            
            <div className="mt-6 grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
              {landmarks.map((landmark, i) => (
                <div key={`${landmark.name}-${i}`} className="flex flex-col gap-1 rounded-xl bg-black/5 p-4 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[14px] font-semibold text-[color:var(--foreground)]">{landmark.name}</p>
                    <span className="shrink-0 text-[12px] font-medium text-[color:var(--muted)]">{landmark.distance}</span>
                  </div>
                  <p className="text-[13px] text-[color:var(--muted)]">{landmark.note}</p>
                </div>
              ))}
            </div>

            <Button asChild variant="outline" className="mt-6">
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <MapPin className="mr-2 h-4 w-4" /> Open in Google Maps
              </a>
            </Button>
          </section>

          <hr className="border-[color:var(--border)]" />

          {/* Rules & Reviews */}
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--foreground)]">Things to know</h2>
            
            <div className="mt-6 grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="text-[16px] font-semibold text-[color:var(--foreground)]">House rules</h3>
                <ul className="mt-4 space-y-3">
                  {houseRules.map((rule, i) => (
                    <li key={`${rule}-${i}`} className="text-[15px] text-[color:var(--muted)]">{rule}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-[16px] font-semibold text-[color:var(--foreground)]">Safety & Property</h3>
                <ul className="mt-4 space-y-3 text-[15px] text-[color:var(--muted)]">
                  <li>Security deposit required</li>
                  <li>CCTV installed in common areas</li>
                  <li>No unregistered guests allowed overnight</li>
                </ul>
              </div>
            </div>
          </section>

          <hr className="border-[color:var(--border)]" />
          
          <section id="reviews">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--foreground)]">Resident feedback</h2>
              {hasResidentFeedback && (
                <div className="flex items-center gap-1.5 text-[16px] font-bold text-[color:var(--foreground)]">
                  <Star className="h-5 w-5 fill-current text-[color:var(--foreground)]" /> {listing.nestscore.toFixed(1)} <span className="text-[color:var(--muted)] font-normal">({listing.reviewCount} reviews)</span>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              {hasResidentFeedback ? (
                <ReviewSection listingId={listing.id} listingSlug={listing.slug} />
              ) : (
                <div className="rounded-xl bg-black/5 p-6 text-center dark:bg-white/5">
                  <p className="text-[15px] font-medium text-[color:var(--foreground)]">No reviews yet</p>
                  <p className="mt-1 text-[14px] text-[color:var(--muted)]">This stay is in an honest new state until residents leave feedback.</p>
                </div>
              )}
            </div>
          </section>
        </section>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Card className="flex flex-col gap-6 overflow-hidden rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-xl shadow-black/5 dark:shadow-white/5">
            <div>
              <p className="text-[24px] font-bold text-[color:var(--foreground)]">{formatRupee(listing.price)} <span className="text-[15px] font-normal text-[color:var(--muted)]">{formatPricePeriod(listing.priceType)}</span></p>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-xl bg-black/5 p-4 dark:bg-white/5">
                <p className="text-[14px] font-medium text-[color:var(--muted)]">Availability</p>
                <div className="text-[14px] text-right">
                  <AvailabilityBadge availableUnits={listing.availableUnits} />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-black/5 p-4 dark:bg-white/5">
                <p className="text-[14px] font-medium text-[color:var(--muted)]">Feedback</p>
                <p className="text-[14px] font-medium text-[color:var(--foreground)]">{hasResidentFeedback ? `${listing.reviewCount} reviews` : "No reviews yet"}</p>
              </div>
            </div>

            {hostProfile ? <HostProfileCard host={hostProfile} currentListingSlug={listing.slug} compact /> : null}

            {canManage ? (
              <div className="rounded-xl border border-amber-200/70 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                <p className="text-[13px] font-semibold text-amber-900/80 dark:text-amber-100/80">Listing management</p>
                <div className="mt-4 grid gap-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/host/listings/new?edit=${listing.slug}`}>Edit listing</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-red-700 hover:bg-red-50 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-500/10"
                    onClick={() => onDeleteListing?.(listing.id)}
                  >
                    Archive listing
                  </Button>
                </div>
              </div>
            ) : null}

            <Button asChild className="w-full h-12 text-[15px]" disabled={!isBookable}>
              <Link href={`/book/${listing.slug}`}>{isBookable ? "Book now" : "Unavailable"}</Link>
            </Button>
          </Card>
        </aside>
      </div>

      {/* Mobile Booking Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--border)] bg-[color:var(--surface)]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium text-[color:var(--muted)]">Price</p>
            <p className="text-[16px] font-bold text-[color:var(--foreground)]">{formatRupee(listing.price)} <span className="text-[13px] font-normal">{formatPricePeriod(listing.priceType)}</span></p>
          </div>
          <Button asChild className="h-12 px-8 text-[15px]" disabled={!isBookable}>
            <Link href={`/book/${listing.slug}`}>{isBookable ? "Book now" : "Unavailable"}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}