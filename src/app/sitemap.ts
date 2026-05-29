import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

const staticRoutes = ["/", "/search", "/nestscore", "/map", "/auth/login", "/profile", "/host/listings/new", "/host/dashboard", "/host/verification", "/guest/dashboard", "/guest/wallet", "/guest/bookings", "/guest/chat", "/admin/dashboard", "/admin/fraud", "/admin/analytics"];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
  }));

  siteConfig.cityPages.forEach((city) => {
    routes.push({ url: `${siteConfig.url}/city/${city}`, lastModified: new Date() });
  });

  return routes;
}