export const siteConfig = {
  name: "Nestmate",
  description:
    "A mobile-first accommodation marketplace for India with verified listings, NestScore trust, email/password auth, booking flows, and Supabase-powered infrastructure.",
  url: "https://nestmate.example.com",
  cityPages: ["Indore", "delhi", "mumbai", "pune", "hyderabad", "chennai"],
  links: {
    instagram: "https://instagram.com/nestmate.india",
  },
} as const;

export type SiteConfig = typeof siteConfig;
