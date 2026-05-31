import { NextResponse } from "next/server";
import { z } from "zod";
import { approveListing, archiveListing, getListingById, rejectListing, renewExpiredListing, suspendListing, updateListing } from "@/lib/database/listing-store";

const actorSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["owner", "admin"]),
});

const patchSchema = z.object({
  actor: actorSchema.optional(),
  action: z.enum(["update", "approve", "reject", "suspend", "archive", "renew"]).default("update"),
  reason: z.string().trim().max(500).optional(),
  patch: z.object({
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().min(1).max(5000).optional(),
    city: z.string().trim().min(1).max(80).optional(),
    locality: z.string().trim().min(1).max(120).optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    price: z.number().int().positive().optional(),
    priceType: z.enum(["monthly", "daily", "bedspace"]).optional(),
    amenities: z.array(z.string().min(1)).optional(),
    genderPreference: z.enum(["male", "female", "any"]).optional(),
    images: z.array(z.string().min(1)).optional(),
    status: z.enum(["draft", "pending_review", "approved", "rejected", "expired", "archived"]).optional(),
  }).optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ listingId: string }> | { listingId: string } }) {
  const resolvedParams = await params;
  const listing = await getListingById(resolvedParams.listingId, new URL(_request.url).searchParams.get("visibility") === "all");

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json({ listing });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ listingId: string }> | { listingId: string } }) {
  const resolvedParams = await params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const listing = await getListingById(resolvedParams.listingId, true);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const actor = parsed.data.actor;
  const isAdmin = actor?.role === "admin";
  const isOwner = actor?.role === "owner" && actor.id === listing.host_id;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  if (parsed.data.action === "approve") {
    if (!isAdmin) return NextResponse.json({ error: "Only admins can approve listings." }, { status: 403 });
    return NextResponse.json({ listing: await approveListing(resolvedParams.listingId) });
  }

  if (parsed.data.action === "reject") {
    if (!isAdmin) return NextResponse.json({ error: "Only admins can reject listings." }, { status: 403 });
    if (!parsed.data.reason) return NextResponse.json({ error: "A rejection reason is required." }, { status: 400 });
    return NextResponse.json({ listing: await rejectListing(resolvedParams.listingId, parsed.data.reason) });
  }

  if (parsed.data.action === "suspend") {
    if (!isAdmin) return NextResponse.json({ error: "Only admins can suspend listings." }, { status: 403 });
    return NextResponse.json({ listing: await suspendListing(resolvedParams.listingId, parsed.data.reason) });
  }

  if (parsed.data.action === "archive") {
    if (!isAdmin && !isOwner) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    return NextResponse.json({ listing: await archiveListing(resolvedParams.listingId, parsed.data.reason) });
  }

  if (parsed.data.action === "renew") {
    if (!isOwner && !isAdmin) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    return NextResponse.json({ listing: await renewExpiredListing(resolvedParams.listingId) });
  }

  if (parsed.data.patch) {
    const nextListing = await updateListing(resolvedParams.listingId, parsed.data.patch);
    return NextResponse.json({ listing: nextListing });
  }

  return NextResponse.json({ error: "No update provided" }, { status: 400 });
}