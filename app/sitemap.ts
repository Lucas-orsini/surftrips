import type { MetadataRoute } from "next";
import { destinationRepository } from "@/lib/destinations";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://surftrips.fr";
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/destinations`, changeFrequency: "weekly", priority: 0.8 },
    ...(await destinationRepository.list()).map((destination) => ({
      url: `${base}/destination/${encodeURIComponent(destination.zoneId)}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
