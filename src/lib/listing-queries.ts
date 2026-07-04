import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { buildListingThumbnail } from "@/lib/listing-thumbnail";
import { ListingRow } from "@/types/database";

export async function getActiveListings() {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
  // const result = await supabase
    .from<ListingRow>("listings")
    .select("*, reviews(count), bookings(count)")
    .eq("status", "approved");
// console.log(result);
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

      createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),

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

      reviewCount: row.reviews?.[0]?.count ?? 0,

      status: "approved",

      moderationState: "active",

      rejectionReason: null,
      suspensionReason: null,

      approvedAt: null,
      reviewedAt: null,
      expiresAt: null,
      archivedAt: null,

      description: (() => {
        let desc = row.description ?? "";
        return desc.replace(/\n\n---UPI_ID:.*?---/, "");
      })(),

      amenities: row.amenities ?? [],

      mapPosition: {
        left: "50%",
        top: "50%",
      },

      images: row.images ?? [],

      thumbnail: row.images && row.images.length > 0 ? row.images[0] : buildListingThumbnail({
        title: row.title,
        city: row.city,
        locality: row.locality,
        spaceType,
        verified: false,
        nestscore: Number(row.nestscore ?? 0),
        status: "approved",
        reviewCount: row.reviews?.[0]?.count ?? 0,
      }),

      kind: spaceType,

      totalUnits: 1,

      availableUnits: row.available_units ?? 0,

      upiId: (() => {
        if (row.upi_id) return row.upi_id;
        const match = (row.description ?? "").match(/---UPI_ID:(.*?)---/);
        return match ? match[1] : undefined;
      })(),

      hostUserPhone: undefined,
      bookingCount: row.bookings?.[0]?.count ?? 0,
    };
  });
}

export async function getListingById(id: string) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from<ListingRow>("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  let actualReviewCount = 0;
  const { count } = await (supabase
    .from("reviews") as any)
    .select("*", { count: "exact", head: true })
    .eq("listing_id", data.id);
  if (count) actualReviewCount = count;



  const spaceType =
    data.space_type === "room"
      ? "room"
      : data.space_type === "bed"
        ? "bed"
        : data.space_type === "apartment"
          ? "apartment"
          : data.space_type === "lodge"
            ? "lodge"
            : "pg";

  return {
    id: data.id,
    slug: data.id,
    ownerId: data.host_id,
    createdAt: Date.now(),

    title: data.title,
    city: data.city,
    locality: data.locality,
    address: data.address ?? "",

    googleMapsUrl: undefined,

    latitude: data.latitude,
    longitude: data.longitude,

    genderPreference:
      data.gender_preference === "male"
        ? "male"
        : data.gender_preference === "female"
          ? "female"
          : "any",

    price: Number(data.price),

    priceType:
      data.price_type === "daily"
        ? "daily"
        : data.price_type === "bedspace"
          ? "bedspace"
          : "monthly",

    spaceType,

    nestscore: Number(data.nestscore ?? 0),

    verified: false,
    reviewCount: actualReviewCount,

    status: "approved",
    moderationState: "active",

    rejectionReason: null,
    suspensionReason: null,

    approvedAt: null,
    reviewedAt: null,
    expiresAt: null,
    archivedAt: null,

    description: (() => {
      let desc = data.description ?? "";
      return desc.replace(/\n\n---UPI_ID:.*?---/, "");
    })(),

    amenities: data.amenities ?? [],

    mapPosition: {
      left: "50%",
      top: "50%",
    },

    images: data.images ?? [],

    thumbnail: data.images && data.images.length > 0 ? data.images[0] : buildListingThumbnail({
      title: data.title,
      city: data.city,
      locality: data.locality,
      spaceType,
      verified: false,
      nestscore: Number(data.nestscore ?? 0),
      status: "approved",
      reviewCount: actualReviewCount,
    }),

    kind: spaceType,

    totalUnits: 1,
    availableUnits: data.available_units ?? 0,

    hostUserPhone: undefined,

    upiId: (() => {
      if (data.upi_id) return data.upi_id;
      const match = (data.description ?? "").match(/---UPI_ID:(.*?)---/);
      return match ? match[1] : undefined;
    })(),
  };
}