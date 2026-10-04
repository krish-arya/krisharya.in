import type { MetadataRoute } from "next";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://krisharya.in";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site, lastModified: new Date("2026-10-04"), changeFrequency: "monthly", priority: 1 }];
}
