import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/app-url";

const routes = ["", "/features", "/pricing", "/support", "/guides", "/terms", "/privacy", "/login", "/register"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl();
  return routes.map((route) => ({ url: `${base}${route}` }));
}
