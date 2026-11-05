import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/db/zones";
import { catalogSitemap } from "@/lib/seo";
import { publishedThemes } from "@/lib/editorial/themes";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { zones } = await getCatalog();
  return catalogSitemap(
    zones,
    publishedThemes(zones).map((theme) => theme.path),
  );
}
