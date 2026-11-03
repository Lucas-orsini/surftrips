import type { Metadata, MetadataRoute } from "next";
import type { Zone } from "./types.ts";
import { getDestinationImageUrl } from "./images/destination.ts";

// Verified against the production redirects on 2026-11-03. Never use VERCEL_URL.
export function siteOrigin(value = process.env.NEXT_PUBLIC_SITE_URL): string {
  if (value) {
    const url = new URL(value);
    if (
      !["surftrips.fr", "www.surftrips.fr"].includes(url.hostname) ||
      !["http:", "https:"].includes(url.protocol) ||
      url.port ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      throw new Error(
        "NEXT_PUBLIC_SITE_URL must be the public Surftrips origin",
      );
  }
  return "https://www.surftrips.fr";
}

export function nonProduction(
  env: { VERCEL_ENV?: string; NODE_ENV?: string } = process.env,
): boolean {
  return env.VERCEL_ENV
    ? env.VERCEL_ENV !== "production"
    : env.NODE_ENV === "development" || env.NODE_ENV === "test";
}

export function canonicalUrl(path: string): string {
  // Next's Metadata API serializes the origin without a trailing slash.
  if (path === "/") return siteOrigin();
  return new URL(path, siteOrigin()).href;
}

export function destinationPath(zoneId: string): string {
  return `/destination/${encodeURIComponent(zoneId)}`;
}

export function isIndexableDestination(
  zone: Pick<Zone, "zoneId" | "name" | "country">,
): boolean {
  return (
    /^[a-zA-Z0-9_-]{1,160}$/.test(zone.zoneId) &&
    Boolean(zone.name?.trim() && zone.country?.trim())
  );
}

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  image?: string,
): Metadata {
  const url = canonicalUrl(path);
  const socialImage = image || canonicalUrl("/opengraph-image");
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: "Surftrips.fr",
      title,
      description,
      url,
      images: [{ url: socialImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export function destinationMetadata(zone: Zone): Metadata {
  const description = `Surf à ${zone.name}, ${zone.country} : ${zone.spots.length} spot${zone.spots.length > 1 ? "s" : ""} documenté${zone.spots.length > 1 ? "s" : ""}, niveaux et saisons.${zone.airportCode ? ` Aéroport d’arrivée : ${zone.airportCode}.` : ""}`;
  return {
    ...pageMetadata(
      `Surf à ${zone.name} : spots, saison et niveau`,
      description,
      destinationPath(zone.zoneId),
      getDestinationImageUrl(
        zone.heroImagePath,
        process.env.NEXT_PUBLIC_SUPABASE_URL,
      ) || undefined,
    ),
    ...(!isIndexableDestination(zone)
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

export function catalogSitemap(
  zones: Pick<Zone, "zoneId" | "name" | "country">[],
): MetadataRoute.Sitemap {
  // An empty catalog is not a successful sitemap. Do not publish a partial fallback.
  if (!zones.length) throw new Error("SEO_CATALOG_EMPTY");
  const paths = [
    "/",
    "/destinations",
    ...zones
      .filter(isIndexableDestination)
      .map((z) => destinationPath(z.zoneId)),
  ];
  return [...new Set(paths)].map((path) => ({ url: canonicalUrl(path) }));
}

export function siteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": canonicalUrl("/#website"),
    url: canonicalUrl("/"),
    name: "Surftrips.fr",
    inLanguage: "fr",
  };
}

export function destinationStructuredData(zone: Zone) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: canonicalUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Destinations",
        item: canonicalUrl("/destinations"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: zone.name,
        item: canonicalUrl(destinationPath(zone.zoneId)),
      },
    ],
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
