import { z } from "zod";

export const listingWizardSchema = z.object({
  propertyType: z.enum(["pg", "room", "bed", "lodge", "apartment"]),
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(3000),
  city: z.string().trim().min(1).max(80),
  locality: z.string().trim().min(1).max(120),
  price: z.number().int().positive(),
  priceType: z.enum(["monthly", "daily", "bedspace"]),
  amenities: z.array(z.string()).min(1),
  genderPreference: z.enum(["male", "female", "any"]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type ListingWizardInput = z.infer<typeof listingWizardSchema>;