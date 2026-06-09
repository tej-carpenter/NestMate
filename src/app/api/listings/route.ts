import { NextResponse } from "next/server";
import { z } from "zod";
import { createListing, listListings } from "@/lib/database/listing-store";

const actorSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["user", "admin"]),
});

const createSchema = z.object({
  actor: actorSchema,
  hostId: z.string().min(1).optional(),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(5000),
  city: z.string().trim().min(1).max(80),
  locality: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(240),
  googleMapsUrl: z.string().trim().max(2048).optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  spaceType: z.enum(["pg", "room", "bed", "lodge", "apartment"]),
  price: z.number().int().positive(),
  priceType: z.enum(["monthly", "daily", "bedspace"]),
  amenities: z.array(z.string().min(1)).min(1),
  genderPreference: z.enum(["male", "female", "any"]),
  images: z.array(z.string().min(1)).default([]),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const visibility = url.searchParams.get("visibility");
  const includeHidden = visibility === "all";
  const listings = await listListings(includeHidden);

  return NextResponse.json({ listings });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (parsed.data.actor.role !== "user" && parsed.data.actor.role !== "admin") {
    return NextResponse.json({ error: "Only users and admins can create listings." }, { status: 403 });
  }

  const explicitGoogleMapsUrl = typeof parsed.data.googleMapsUrl === "string" && parsed.data.googleMapsUrl.trim().length > 0 ? parsed.data.googleMapsUrl.trim() : null;
  const generatedGoogleMapsUrl =
    explicitGoogleMapsUrl ??
    `https://www.google.com/maps/search/${encodeURIComponent(`${parsed.data.title} ${parsed.data.locality} ${parsed.data.city}`)}`;
  const listing = await createListing(
    {
      host_id: parsed.data.hostId ?? parsed.data.actor.id,
      title: parsed.data.title,
      description: parsed.data.description,
      city: parsed.data.city,
      locality: parsed.data.locality,
      address: parsed.data.address,
      google_maps_url: generatedGoogleMapsUrl,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      space_type: parsed.data.spaceType,
      price: parsed.data.price,
      price_type: parsed.data.priceType,
      amenities: parsed.data.amenities,
      gender_preference: parsed.data.genderPreference,
      images: parsed.data.images,
    },
    parsed.data.actor,
  );

  return NextResponse.json({ listing }, { status: 201 });
}