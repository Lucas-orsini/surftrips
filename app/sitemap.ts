import type { MetadataRoute } from "next";
import { destinationRepository } from "@/lib/destinations";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://surftrips.fr";
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/destinations`, changeFrequency: "weekly", priority: 0.8 },
    ...(await destinationRepository.list()).map((destination) => ({
      url: `${base}/destination/${destination.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
