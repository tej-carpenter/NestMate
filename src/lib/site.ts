export const siteConfig = {
  name: "Nestmate",
  description:
    "A mobile-first accommodation marketplace for India with verified listings, NestScore trust, OTP auth, booking flows, and Supabase-powered infrastructure.",
  url: "https://nestmate.example.com",
  cityPages: ["bengaluru", "delhi", "mumbai", "pune", "hyderabad", "chennai"],
} as const;

export type SiteConfig = typeof siteConfig;