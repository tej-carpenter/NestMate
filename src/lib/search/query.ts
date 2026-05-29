import { z } from "zod";

export const searchParamsSchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  locality: z.string().optional(),
  propertyType: z.enum(["pg", "room", "bed", "lodge", "apartment"]).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  gender: z.enum(["male", "female", "any"]).optional(),
  sort: z.enum(["recommended", "price_asc", "price_desc", "distance"]).optional(),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

export function parseSearchParams(input: Record<string, string | string[] | undefined>) {
  return searchParamsSchema.parse({
    q: typeof input.q === "string" ? input.q : undefined,
    city: typeof input.city === "string" ? input.city : undefined,
    locality: typeof input.locality === "string" ? input.locality : undefined,
    propertyType: typeof input.propertyType === "string" ? input.propertyType : undefined,
    minPrice: typeof input.minPrice === "string" ? input.minPrice : undefined,
    maxPrice: typeof input.maxPrice === "string" ? input.maxPrice : undefined,
    gender: typeof input.gender === "string" ? input.gender : undefined,
    sort: typeof input.sort === "string" ? input.sort : undefined,
  });
}