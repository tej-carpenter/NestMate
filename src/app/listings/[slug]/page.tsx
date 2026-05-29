import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarDays, ChevronDown, Home, MapPin, ShieldCheck, Sparkles, Star, Users2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatRupee } from "@/lib/format";
import { PropertyMapPreview } from "@/components/listings/property-map-preview";
import { getListingBySlug, getListingInventory } from "@/lib/local-data";
import { formatPricePeriod } from "@/lib/pricing";
import ReviewSection from "@/components/listings/review-section";

type LandmarkItem = { name: string; distance: string; note: string };

const cityLandmarks: Record<string, LandmarkItem[]> = {
  Bengaluru: [
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

function scoreRows(score: number) {
  return [
    ["Safety", Math.min(5, score + 0.2)],
    ["Cleanliness", Math.min(5, score + 0.1)],
    ["Connectivity", Math.min(5, score + 0.15)],
    ["Value", Math.min(5, score - 0.05)],
    ["Food", Math.min(5, score - 0.1)],
  ] as const;
}

function getAmenityIcon(amenity: string) {
  const normalized = amenity.toLowerCase();
  if (normalized.includes("wifi")) return Sparkles;
  if (normalized.includes("food") || normalized.includes("kitchen") || normalized.includes("meal")) return Home;
  if (normalized.includes("parking")) return MapPin;
  return ShieldCheck;
}

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const listing = getListingBySlug(resolvedParams.slug);

  if (!listing) {
    notFound();
  }

  const inventory = getListingInventory();
  const heroImages = [listing, ...inventory.filter((item) => item.slug !== listing.slug)].slice(0, 3);
  const landmarks = cityLandmarks[listing.city] ?? cityLandmarks.Bengaluru;
  const availabilityLabel = listing.blacklisted ? "Unavailable" : listing.availableUnits <= 0 ? "Fully occupied" : `${listing.availableUnits} of ${listing.totalUnits} units available`;
  const hasResidentFeedback = listing.reviewCount > 0;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="space-y-6">
          <Card className="overflow-hidden border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm shadow-slate-900/5 sm:p-6">
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

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.06fr_0.94fr] lg:items-end">
              <div className="max-w-3xl space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-800 dark:text-teal-300">Property details</p>
                <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight text-slate-950 dark:text-slate-50 sm:text-5xl lg:text-6xl">{listing.title}</h1>
                <p className="text-base leading-7 text-slate-600 dark:text-slate-300">{listing.locality}, {listing.city} · {listing.spaceType.toUpperCase()} · {listing.genderPreference === "any" ? "Any gender" : `${listing.genderPreference} only`}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge className="bg-[color:var(--surface-strong)] text-slate-700 dark:text-slate-200">Locality trust</Badge>
                  <Badge className="bg-[color:var(--surface-strong)] text-slate-700 dark:text-slate-200">Safety visible</Badge>
                  <Badge className="bg-[color:var(--surface-strong)] text-slate-700 dark:text-slate-200">Fast booking</Badge>
                  <Badge className="bg-[color:var(--surface-strong)] text-slate-700 dark:text-slate-200">NestPay ready</Badge>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-[color:var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.99))] p-4 shadow-sm shadow-slate-900/5 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(15,23,42,0.82))]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Starting from</p>
                <p className="mt-2 text-4xl font-semibold text-slate-950 dark:text-slate-50">{formatRupee(listing.price)}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{formatPricePeriod(listing.priceType)}</p>
                <div className="mt-4 rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800 dark:text-teal-300">Availability</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-50">{availabilityLabel}</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-5 lg:grid-cols-[1.28fr_0.72fr]">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
                <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] shadow-sm shadow-slate-900/5 sm:row-span-2 sm:min-h-[560px]">
                  <div className="relative aspect-[4/5] sm:aspect-[4/4.8]">
                    <Image src={listing.thumbnail} alt={listing.title} fill unoptimized sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
                    <div className="absolute left-4 top-4 flex flex-col gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-slate-950 backdrop-blur dark:bg-slate-950/80 dark:text-slate-50">
                        <CalendarDays className="h-3.5 w-3.5 text-teal-700 dark:text-teal-300" /> {availabilityLabel}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Main visual</p>
                      <p className="mt-1 text-xl font-semibold text-white">Premium, student-friendly living</p>
                    </div>
                  </div>
                </div>

                {heroImages.slice(1).map((item) => (
                  <div key={item.id} className="relative overflow-hidden rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] shadow-sm shadow-slate-900/5 sm:min-h-[272px]">
                    <div className="relative aspect-[4/4.6]">
                      <Image src={item.thumbnail} alt={item.title} fill unoptimized sizes="(max-width: 768px) 50vw, 20vw" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/10 to-transparent" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Availability</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{listing.availableUnits}/{listing.totalUnits}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Booking</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">Ready now</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Fast handoff to NestPay when you’re ready.</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Locality</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{listing.locality}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Built for commute decisions</p>
                </Card>
              </div>

              <details className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Trust signals <ChevronDown className="h-4 w-4 text-slate-500" /></summary>
                {hasResidentFeedback ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {scoreRows(listing.nestscore).map(([label, value]) => (
                      <div key={label} className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold text-slate-950 dark:text-slate-50">{label}</span>
                          <span className="font-medium text-slate-600 dark:text-slate-300">{Number(value).toFixed(1)}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Awaiting resident feedback. Trust metrics will appear after verified residents submit reviews.
                  </div>
                )}
              </details>

              <details className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Amenities and rules <ChevronDown className="h-4 w-4 text-slate-500" /></summary>
                <div className="mt-5 space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Amenities</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {listing.amenities.slice(0, 6).map((amenity) => {
                        const Icon = getAmenityIcon(amenity);
                        return (
                          <Chip key={amenity} className="inline-flex items-center gap-3">
                            <Icon className="mt-0.5 h-4 w-4 text-teal-700 dark:text-teal-300" />
                            {amenity}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">House rules</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
                      {houseRules.map((rule) => (
                        <div key={rule} className="min-h-24 rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5 text-sm leading-6 text-slate-600 dark:text-slate-300">{rule}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </details>

              <PropertyMapPreview listing={listing} />

              <details className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Reviews and locality <ChevronDown className="h-4 w-4 text-slate-500" /></summary>
                <div className="mt-5 space-y-5">
                  <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Reviews</p>
                        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-slate-950 dark:text-slate-50">Resident feedback</h2>
                      </div>
                      <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white dark:bg-white dark:text-slate-950">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em]">{hasResidentFeedback ? `${listing.reviewCount} reviews` : "No reviews yet"}</p>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">{hasResidentFeedback ? `Average ${listing.nestscore.toFixed(1)}` : "New listing"}</p>
                      </div>
                    </div>
                          <div className="mt-5">
                            {/* Client-rendered review section */}
                            <div id="reviews">
                              {/* ReviewSection will mount and load real reviews and form */}
                              <ReviewSection listingId={listing.id} listingSlug={listing.slug} />
                            </div>
                          </div>
                  </div>
                  <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5 sm:p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Nearby landmarks</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
                      {landmarks.map((landmark) => (
                        <div key={landmark.name} className="min-h-28 rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
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
                  </div>
                </div>
              </details>

              <div className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Why this stay works</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <li>Made for Indian students and professionals who want quick scanning and low-friction booking.</li>
                  <li>Shows verification, review status, and live unit availability before the user reaches the booking form.</li>
                  <li>Maintains a premium editorial layout without losing price or locality clarity.</li>
                </ul>
              </div>
            </div>

            <aside className="space-y-4">
              <Card className="p-5 sm:p-6 lg:sticky lg:top-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">Fast actions</p>
                <div className="mt-4 space-y-3">
                  <Button asChild className="w-full justify-center">
                    <Link href={`/book/${listing.slug}`}>Book this property</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-center">
                    <Link href="/search">Compare more stays</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-center">
                    <Link href="/guest/chat">Message host</Link>
                  </Button>
                </div>
                <div className="mt-5 rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 text-sm text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-slate-950 dark:text-slate-50">Scannable take</p>
                  <p className="mt-2 leading-6">{listing.title} balances locality context, trust signals, and clear pricing so users can decide quickly.</p>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--border)] bg-[color:var(--surface)]/96 px-4 py-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Button asChild variant="outline" className="min-w-0 flex-1 justify-center">
            <Link href="#reviews">Reviews</Link>
          </Button>
          <Button asChild className="min-w-0 flex-[1.35] justify-center shadow-sm shadow-teal-900/10">
            <Link href={`/book/${listing.slug}`}>Book now</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
