import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { buildListingThumbnail } from "@/lib/listing-thumbnail";

export async function getActiveListings() {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active");

  console.log("SUPABASE LISTINGS:", data);
  console.log("SUPABASE ERROR:", error);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row: any) => {
    const spaceType =
      row.space_type === "room"
        ? "room"
        : row.space_type === "bed"
          ? "bed"
          : row.space_type === "apartment"
            ? "apartment"
            : row.space_type === "lodge"
              ? "lodge"
              : "pg";

    return {
      id: row.id,

      slug: row.id,

      ownerId: row.host_id,

      createdAt: Date.now(),

      title: row.title,

      city: row.city,

      locality: row.locality,

      address: row.address ?? "",

      googleMapsUrl: undefined,

      latitude: row.latitude,

      longitude: row.longitude,

      genderPreference:
        row.gender_preference === "male"
          ? "male"
          : row.gender_preference === "female"
            ? "female"
            : "any",

      price: Number(row.price),

      priceType:
        row.price_type === "daily"
          ? "daily"
          : row.price_type === "bedspace"
            ? "bedspace"
            : "monthly",

      spaceType,

      nestscore: Number(row.nestscore ?? 0),

      verified: false,

      reviewCount: 0,

      status: "approved",

      moderationState: "active",

      rejectionReason: null,
      suspensionReason: null,

      approvedAt: null,
      reviewedAt: null,
      expiresAt: null,
      archivedAt: null,

      description: row.description ?? "",

      amenities: row.amenities ?? [],

      mapPosition: {
        left: "50%",
        top: "50%",
      },

      thumbnail: buildListingThumbnail({
        title: row.title,
        city: row.city,
        locality: row.locality,
        spaceType,
        verified: false,
        nestscore: Number(row.nestscore ?? 0),
        status: "approved",
        reviewCount: 0,
      }),

      kind: spaceType,

      totalUnits: 1,

      availableUnits: 1,

      hostUserPhone: undefined,
    };
  });
}