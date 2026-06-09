import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CalendarDays, ChevronDown, ExternalLink, Home, MapPin, ShieldCheck, Sparkles, Star, Users2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatRupee } from "@/lib/format";
import { resolveGoogleMapsUrl } from "@/lib/google-maps";
import ReviewSection from "@/components/listings/review-section";
import { HostProfileCard } from "@/components/host/host-profile-card";
import { formatPricePeriod } from "@/lib/pricing";
import { canManageListing, type ListingActor, type ListingInventoryItem, type PublicHostProfile } from "@/lib/local-data";
import { getListingStatusLabel, isPublicListingStatus } from "@/lib/listings/status";

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

function formatAvailability(listing: { status: ListingInventoryItem["status"]; moderationState: ListingInventoryItem["moderationState"]; availableUnits: number; totalUnits: number }) {
  if (!isPublicListingStatus(listing.status, listing.moderationState)) {
    return "Unavailable";
  }

  if (listing.totalUnits <= 0 || listing.availableUnits <= 0) {
    return "Availability not listed yet";
  }

  return `${listing.availableUnits} of ${listing.totalUnits} units available`;
}

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
  const heroImages = [listing, ...inventory.filter((item) => item.slug !== listing.slug)].slice(0, 4);
  const landmarks = cityLandmarks[listing.city] ?? cityLandmarks.Indore;
  const availabilityLabel = formatAvailability(listing);
  const hasResidentFeedback = (listing.reviewCount ?? 0) > 0;
  const relatedImage = heroImages[1] ?? listing;
  const canEditListing = canManageListing(listing, currentUser);
  const isBookable = isPublicListingStatus(listing.status, listing.moderationState);
  const googleMapsUrl = resolveGoogleMapsUrl(
    { title: listing.title, locality: listing.locality, city: listing.city },
    listing.googleMapsUrl,
  );
  const locationAddress = listing.address && listing.address.trim().length > 0 ? listing.address : `${listing.locality}, ${listing.city}`;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.22fr)_22rem] xl:grid-cols-[minmax(0,1.28fr)_24rem] lg:items-start">
        <section className="space-y-6">
          <Card className="overflow-hidden border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-sm shadow-slate-900/5 sm:p-5 lg:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="gap-1.5 border-teal-900/10 bg-teal-50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-teal-950 dark:border-teal-400/20 dark:bg-teal-500/15 dark:text-teal-100">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified stay
              </Badge>
              <Badge className="gap-1.5 bg-[color:var(--surface-strong)] text-slate-700 dark:text-slate-200">
                <Star className="h-3.5 w-3.5 text-amber-500" /> {hasResidentFeedback ? `${listing.nestscore.toFixed(1)} NestScore` : "Awaiting resident feedback"}
              </Badge>
              <Badge className="gap-1.5 bg-[color:var(--surface-strong)] text-slate-700 dark:text-slate-200">
                <Users2 className="h-3.5 w-3.5 text-teal-700 dark:text-teal-300" /> {hasResidentFeedback ? `${listing.reviewCount} reviews` : "No reviews yet"}
              </Badge>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1.12fr_0.88fr] xl:items-end">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-800 dark:text-teal-300">Property details</p>
                  <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl leading-tight text-slate-950 dark:text-slate-50 sm:text-5xl xl:text-6xl">{listing.title}</h1>
                  <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
                    {listing.locality}, {listing.city} · {listing.spaceType.toUpperCase()} · {listing.genderPreference === "any" ? "Any gender" : `${listing.genderPreference} only`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-[color:var(--surface-strong)] text-slate-700 dark:text-slate-200">Locality trust</Badge>
                  <Badge className="bg-[color:var(--surface-strong)] text-slate-700 dark:text-slate-200">Safety visible</Badge>
                  <Badge className="bg-[color:var(--surface-strong)] text-slate-700 dark:text-slate-200">Fast booking</Badge>
                  <Badge className="bg-[color:var(--surface-strong)] text-slate-700 dark:text-slate-200">NestPay ready</Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Starting from", value: formatRupee(listing.price), detail: formatPricePeriod(listing.priceType) },
                    { label: "Availability", value: availabilityLabel, detail: listing.totalUnits > 0 ? "Live inventory from stored records" : "Host has not published inventory yet" },
                    { label: "Booking state", value: isBookable ? "Open for requests" : "Unavailable", detail: "Booking handoff is visible in the sidebar" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 sm:p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.label}</p>
                      <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-50 sm:text-2xl">{item.value}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.99))] p-5 shadow-sm shadow-slate-900/5 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.86))]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Overview</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">A quick summary of the stay, without the clutter of separate mini-cards.</p>
                  </div>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-900 dark:bg-teal-500/15 dark:text-teal-100">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[1.25rem] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{listing.description}</div>
                  <div className="rounded-[1.25rem] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                    {hasResidentFeedback ? `Resident feedback is live at ${listing.nestscore.toFixed(1)} / 5.` : "This stay is newly listed and waiting for resident feedback."}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <section className="grid gap-4 sm:grid-cols-[1.4fr_0.6fr]">
            <GalleryTile image={listing.thumbnail} title={listing.title} caption="Main visual" featured />
            <div className="grid gap-4 sm:grid-rows-2">
              <GalleryTile image={relatedImage.thumbnail} title={relatedImage.title} caption="Neighborhood feel" />
              <GalleryTile image={heroImages[2]?.thumbnail ?? listing.thumbnail} title={listing.city} caption="Property context" />
            </div>
          </section>

          <Card id="reviews" className="overflow-hidden border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm shadow-slate-900/5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-800 dark:text-teal-300">Booking preview</p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-slate-950 dark:text-slate-50">What you need to know before you book</h2>
              </div>
              <Badge className="bg-[color:var(--surface-strong)] text-slate-700 dark:text-slate-200">Progressive disclosure</Badge>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Pricing</p>
                <div className="mt-3 flex items-end gap-3">
                  <p className="text-4xl font-semibold text-slate-950 dark:text-slate-50">{formatRupee(listing.price)}</p>
                  <p className="pb-1 text-sm text-slate-600 dark:text-slate-300">{formatPricePeriod(listing.priceType)}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Pricing comes from the stored listing record. If the host has not added inventory yet, availability stays honest rather than implied.</p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Availability", value: availabilityLabel },
                    { label: "Listed status", value: getListingStatusLabel(listing.status, listing.moderationState) },
                    { label: "Trust state", value: hasResidentFeedback ? `Feedback live` : "Awaiting resident feedback" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.25rem] bg-[color:var(--surface)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-slate-50">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {hostProfile ? <HostProfileCard host={hostProfile} currentListingSlug={listing.slug} showPortfolio={false} /> : (
                <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5 sm:p-6">
                  <p className="text-sm text-slate-600 dark:text-slate-300">Host profile is being prepared for this listing.</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="overflow-hidden border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm shadow-slate-900/5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-800 dark:text-teal-300">Amenities</p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-slate-950 dark:text-slate-50">What the property includes</h2>
              </div>
              <Badge className="bg-[color:var(--surface-strong)] text-slate-700 dark:text-slate-200">Expandable details</Badge>
            </div>

            <details className="mt-5 rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5" open>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">
                Amenities and inclusions
                <ChevronDown className="h-4 w-4 text-slate-500 transition-transform open:rotate-180" />
              </summary>
              <div className="mt-4 flex flex-wrap gap-2">
                {listing.amenities.length > 0 ? listing.amenities.slice(0, 10).map((amenity) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <Chip key={amenity} className="inline-flex items-center gap-3">
                      <Icon className="mt-0.5 h-4 w-4 text-teal-700 dark:text-teal-300" />
                      {amenity}
                    </Chip>
                  );
                }) : (
                  <div className="rounded-[1.25rem] bg-[color:var(--surface)] px-4 py-3 text-sm text-slate-600 dark:text-slate-300">Amenities will appear once the host publishes them.</div>
                )}
              </div>
            </details>
          </Card>

          <Card className="overflow-hidden border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm shadow-slate-900/5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-800 dark:text-teal-300">Locality</p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-slate-950 dark:text-slate-50">Where the property sits in the city</h2>
              </div>
              <Badge className="bg-[color:var(--surface-strong)] text-slate-700 dark:text-slate-200">Context first</Badge>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="space-y-4 rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5 sm:p-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Location information</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{locationAddress}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "City", value: listing.city },
                    { label: "Locality", value: listing.locality },
                    { label: "Address", value: locationAddress },
                    { label: "Property type", value: listing.spaceType.toUpperCase() },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.25rem] bg-[color:var(--surface)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-slate-50">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-[1.75rem] border border-[color:var(--border)] bg-[linear-gradient(180deg,rgba(15,118,110,0.10),rgba(248,250,252,0.99))] p-5 sm:p-6 dark:bg-[linear-gradient(180deg,rgba(15,118,110,0.18),rgba(15,23,42,0.92))]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Open in Google Maps</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Use Google Maps to navigate to {listing.title}.
                    </p>
                  </div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-900 dark:bg-teal-500/15 dark:text-teal-100">
                    <MapPin className="h-4 w-4" />
                  </div>
                </div>
                <div className="rounded-[1.25rem] bg-[color:var(--surface)] p-4 text-sm text-slate-700 dark:text-slate-200">
                  {locationAddress}
                </div>
                <Button
                  asChild
                  className="w-full justify-center shadow-sm shadow-teal-900/10"
                >
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin className="h-4 w-4" />
                    Open in Google Maps
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
              {landmarks.map((landmark) => (
                <div key={landmark.name} className="rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{landmark.name}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{landmark.note}</p>
                    </div>
                    <Chip tone="accent" className="!rounded-full px-3 py-1 text-xs font-semibold">{landmark.distance}</Chip>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm shadow-slate-900/5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-800 dark:text-teal-300">Rules</p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-slate-950 dark:text-slate-50">Property rules and review visibility</h2>
              </div>
              <Badge className="bg-[color:var(--surface-strong)] text-slate-700 dark:text-slate-200">Progressive disclosure</Badge>
            </div>

            <details className="mt-5 rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5" open>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">
                Property rules
                <ChevronDown className="h-4 w-4 text-slate-500 transition-transform open:rotate-180" />
              </summary>
              <div className="mt-4 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
                {houseRules.map((rule) => (
                  <div key={rule} className="rounded-[1.35rem] bg-[color:var(--surface)] p-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{rule}</div>
                ))}
              </div>
            </details>

            <details className="mt-4 rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">
                Reviews and resident feedback
                <ChevronDown className="h-4 w-4 text-slate-500 transition-transform open:rotate-180" />
              </summary>
              <div className="mt-4 space-y-4">
                <div className="rounded-[1.35rem] bg-[color:var(--surface)] p-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {hasResidentFeedback
                    ? `${listing.reviewCount} reviews are available and the NestScore is computed from those records only.`
                    : "No reviews yet. The listing stays in an honest new state until residents leave feedback."}
                </div>
                <ReviewSection listingId={listing.id} listingSlug={listing.slug} />
              </div>
            </details>
          </Card>
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="overflow-hidden border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.26)] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-800 dark:text-teal-300">Booking sidebar</p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-slate-950 dark:text-slate-50">Book with clarity</h2>
              </div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-900 dark:bg-teal-500/15 dark:text-teal-100">
                <CalendarDays className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-[color:var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,252,0.96))] p-5 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.88))]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Pricing</p>
              <p className="mt-3 text-4xl font-semibold text-slate-950 dark:text-slate-50">{formatRupee(listing.price)}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">{formatPricePeriod(listing.priceType)}</p>
              <div className="mt-4 flex items-center justify-between rounded-[1.25rem] bg-teal-50 px-4 py-3 text-sm text-teal-950 dark:bg-teal-500/15 dark:text-teal-50">
                <span className="font-medium">Availability</span>
                <span className="break-words text-right font-semibold">{availabilityLabel}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {[
                { label: "Availability", value: availabilityLabel },
                { label: "Feedback", value: hasResidentFeedback ? `${listing.reviewCount} reviews` : "No reviews yet" },
                { label: "Verification", value: listing.verified ? "Verified stay" : "Verification in progress" },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-slate-50">{item.value}</p>
                </div>
              ))}
            </div>

            {hostProfile ? <HostProfileCard host={hostProfile} currentListingSlug={listing.slug} compact /> : null}

            {canEditListing ? (
              <div className="mt-4 rounded-[1.35rem] border border-amber-200/70 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-900/80 dark:text-amber-100/80">Listing management</p>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">This property belongs to your account, so you can edit it or remove it from the marketplace.</p>
                <div className="mt-4 grid gap-3">
                  <Button asChild variant="outline" className="w-full justify-center">
                    <Link href={`/host/listings/new?edit=${listing.slug}`}>Edit listing</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-center text-red-700 hover:bg-red-50 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-500/10"
                    onClick={() => onDeleteListing?.(listing.id)}
                  >
                    Archive listing
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="mt-4 grid gap-3">
              <Button asChild className="w-full justify-center" disabled={!isBookable}>
                <Link href={`/book/${listing.slug}`}>{isBookable ? "Continue to booking" : "Currently unavailable"}</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-center">
                <Link href="#reviews">Read resident feedback</Link>
              </Button>
            </div>

            <details className="mt-4 rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-slate-950 dark:text-slate-50">Availability details</summary>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <p>{listing.totalUnits > 0 ? `We currently store ${listing.availableUnits} of ${listing.totalUnits} units.` : "The host has not listed inventory details yet."}</p>
                <p>{isBookable ? "Booking is only enabled when the listing is open." : "This listing is not currently available for booking."}</p>
              </div>
            </details>
          </Card>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-[5.25rem] z-40 border-t border-[color:var(--border)] bg-[color:var(--surface)]/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-1">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Starting from</p>
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">{formatRupee(listing.price)} {formatPricePeriod(listing.priceType)}</p>
          </div>
          <Button asChild className="h-12 flex-1 justify-center" disabled={!isBookable}>
            <Link href={`/book/${listing.slug}`}>{isBookable ? "Book now" : "Unavailable"}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}