import { z } from "zod";

export const listingWizardSchema = z.object({
  propertyType: z.enum(["pg", "room", "bed", "lodge", "apartment"]),
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(3000),
  city: z.string().trim().min(1).max(80),
  locality: z.string().trim().min(1).max(120),
  address: z.string().trim().min(1).max(240),
  // Optional Google Maps URL. The wizard validates that it looks like a URL
  // when provided; empty strings are coerced to undefined so the field is
  // effectively optional.
  googleMapsUrl: z
    .string()
    .trim()
    .max(2048)
    .optional()
    .refine(
      (value) => !value || /^https?:\/\//i.test(value),
      { message: "Google Maps URL must start with http:// or https://" },
    ),
  price: z.number().int().positive(),
  priceType: z.enum(["monthly", "daily", "bedspace"]),
  amenities: z.string().trim().min(1, "Please provide at least one amenity"),
  genderPreference: z.enum(["male", "female", "any"]),
  // Legacy optional fields. Latitude/longitude are no longer required for
  // listing creation; they are kept for backwards compatibility.
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  availableUnits: z.number().int().min(1),
  durationDays: z.number().int().min(0),
  durationHours: z.number().int().min(0).max(23),
  images: z.array(z.string()).optional(),
});

export type ListingWizardInput = z.infer<typeof listingWizardSchema>;
