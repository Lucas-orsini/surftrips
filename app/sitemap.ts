import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/db/zones";
import { catalogSitemap } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return catalogSitemap((await getCatalog()).zones);
}
