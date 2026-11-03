import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  return {
    // Search pages must be crawled to read their noindex. Keep the existing
    // affiliate crawl restriction and the absence of a specific GPTBot policy.
    rules: { userAgent: "*", allow: "/", disallow: ["/go/"] },
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
