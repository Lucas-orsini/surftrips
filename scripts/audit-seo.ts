/** Read-only census + real HTTP HTML. Run against a built server; never deploys. */
import nextEnv from "@next/env";
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { readQuery } from "../lib/db/index.ts";
import {
  canonicalUrl,
  destinationPath,
  isIndexableDestination,
} from "../lib/seo.ts";
import { getDestinationImageUrl } from "../lib/images/destination.ts";

nextEnv.loadEnvConfig(process.cwd());
const baseURL = process.env.SEO_BASE_URL || "http://127.0.0.1:3002";
const expectNoindex = process.env.SEO_EXPECT_NOINDEX === "1";
const output = process.env.SEO_REPORT_PATH || ".local/seo/audit.json";

interface CensusRow {
  zoneId: string;
  name: string;
  country: string;
  notes: string | null;
  image: string | null;
  spots: {
    name: string;
    notes: string | null;
    level: string | null;
    season: string | null;
  }[];
}

async function audit() {
  const zones =
    await readQuery<CensusRow>(`SELECT z.zone_id AS "zoneId", z.nom AS name, z.pays AS country,
    z.notes, to_jsonb(z)->>'hero_image_path' AS image,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('name',s.nom,'notes',s.notes,
    'level',s.niveau_ideal,'season',s.saison_ideale) ORDER BY s.spot_id)
    FROM public.spots s WHERE s.zone_id=z.zone_id),'[]'::jsonb) AS spots
    FROM public.zones z ORDER BY z.zone_id`);
  if (!zones.length) throw new Error("Empty source catalog");
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      baseURL,
    });
    // DOMParser only parses the HTTP response; no site script or RSC payload executes.
    const parser = await context.newPage();
    const failures: string[] = [];
    const sitemapResponse = await context.request.get("/sitemap.xml");
    const sitemap = await parser.evaluate(
      (xml) => {
        const doc = new DOMParser().parseFromString(xml, "application/xml");
        return {
          malformed: !!doc.querySelector("parsererror"),
          urls: [...doc.querySelectorAll("loc")].map((n) => n.textContent!),
        };
      },
      await sitemapResponse.text(),
    );
    if (sitemapResponse.status() !== 200 || sitemap.malformed)
      failures.push("Sitemap HTTP/XML invalid");
    if (new Set(sitemap.urls).size !== sitemap.urls.length)
      failures.push("Duplicate sitemap URLs");
    const eligible = zones.filter(isIndexableDestination);
    const expectedUrls = [
      "/",
      "/destinations",
      ...eligible.map((z) => destinationPath(z.zoneId)),
    ].map(canonicalUrl);
    const missing = expectedUrls.filter((url) => !sitemap.urls.includes(url));
    const extra = sitemap.urls.filter((url) => !expectedUrls.includes(url));
    if (missing.length || extra.length)
      failures.push("Sitemap/source mismatch");
    const rows: {
      slug: string;
      status: number;
      indexable: boolean;
      title: string;
      description: string;
      issues: string[];
      htmlCharacters?: number;
      internalLinks?: number;
    }[] = [];
    const imageUrls = new Set<string>();
    for (const zone of zones) {
      const path = destinationPath(zone.zoneId);
      try {
        const response = await context.request.get(path, {
          timeout: 30000,
          maxRedirects: 0,
        });
        const data = await parser.evaluate(
          (html) => {
            const doc = new DOMParser().parseFromString(html, "text/html");
            const meta = (key: string) =>
              doc.head
                .querySelector(`meta[name="${key}"],meta[property="${key}"]`)
                ?.getAttribute("content") || "";
            const jsonLd = [
              ...doc.querySelectorAll('script[type="application/ld+json"]'),
            ].map((n) => JSON.parse(n.textContent || ""));
            doc
              .querySelectorAll("script,style,template,[hidden]")
              .forEach((n) => n.remove());
            return {
              title: doc.head.querySelector("title")?.textContent || "",
              description: meta("description"),
              canonicals: [
                ...doc.querySelectorAll('link[rel="canonical"]'),
              ].map((n) => n.getAttribute("href")),
              ogUrl: meta("og:url"),
              image: meta("og:image"),
              twitterImage: meta("twitter:image"),
              robots: meta("robots"),
              h1: doc.querySelector("h1")?.textContent || "",
              body: doc.querySelector("main")?.textContent || "",
              jsonLd,
              links: [...doc.querySelectorAll("main a[href]")].map((n) =>
                n.getAttribute("href"),
              ),
            };
          },
          await response.text(),
        );
        const issues: string[] = [];
        if (response.status() !== 200) issues.push(`HTTP ${response.status()}`);
        if (!data.title.trim() || !data.description.trim())
          issues.push("Empty title/description");
        if (
          !data.title.includes(zone.name) ||
          !data.description.includes(zone.country)
        )
          issues.push("Metadata identity mismatch");
        if (
          data.canonicals.length !== 1 ||
          data.canonicals[0] !== canonicalUrl(path) ||
          data.ogUrl !== canonicalUrl(path)
        )
          issues.push("Canonical/OG mismatch");
        const noindex = /noindex/i.test(
          data.robots + (response.headers()["x-robots-tag"] || ""),
        );
        if (noindex !== (expectNoindex || !isIndexableDestination(zone)))
          issues.push("Unexpected indexability");
        if (
          !data.h1.includes(zone.name) ||
          !data.body.includes(zone.country) ||
          !data.body.includes("Niveau") ||
          !data.body.includes("Périodes idéales")
        )
          issues.push("Essential HTML missing or hidden");
        if (zone.notes && !data.body.includes(zone.notes))
          issues.push("Existing presentation missing in HTML");
        if (
          zone.spots.some(
            (spot) =>
              !data.body.includes(spot.name) ||
              (spot.season && !data.body.includes(spot.season)),
          )
        )
          issues.push("Spots/seasons missing in HTML");
        if (!data.links.includes("/destinations"))
          issues.push("Catalog link missing");
        if (
          data.jsonLd.length !== 1 ||
          data.jsonLd[0]["@type"] !== "BreadcrumbList" ||
          data.jsonLd[0].itemListElement?.[2]?.item !== canonicalUrl(path)
        )
          issues.push("Structured data mismatch");
        const expectedImage =
          getDestinationImageUrl(
            zone.image,
            process.env.NEXT_PUBLIC_SUPABASE_URL,
          ) || canonicalUrl("/opengraph-image");
        if (data.image !== expectedImage || data.twitterImage !== expectedImage)
          issues.push("Social image mismatch");
        if (data.image) imageUrls.add(data.image);
        for (const issue of issues) failures.push(`${zone.zoneId}: ${issue}`);
        const { body, links, ...metadata } = data;
        rows.push({
          slug: zone.zoneId,
          status: response.status(),
          indexable: !noindex,
          ...metadata,
          htmlCharacters: body.length,
          internalLinks: links.length,
          issues,
        });
      } catch {
        failures.push(`${zone.zoneId}: HTTP or HTML parsing failed`);
        rows.push({
          slug: zone.zoneId,
          status: 0,
          indexable: false,
          title: "",
          description: "",
          issues: ["HTTP or HTML parsing failed"],
        });
      }
    }
    const duplicates = (field: "title" | "description") => {
      const groups = new Map<string, string[]>();
      for (const row of rows)
        groups.set(row[field], [...(groups.get(row[field]) || []), row.slug]);
      return [...groups]
        .filter(([value, slugs]) => value && slugs.length > 1)
        .map(([value, slugs]) => ({ value, slugs }));
    };
    const duplicateTitles = duplicates("title");
    const duplicateDescriptions = duplicates("description");
    if (duplicateTitles.length || duplicateDescriptions.length)
      failures.push("Duplicate metadata");
    const images = [];
    for (const url of imageUrls) {
      try {
        // Test the current local fallback instead of an older deployed revision.
        const target =
          url === canonicalUrl("/opengraph-image")
            ? new URL("/opengraph-image", baseURL).href
            : url;
        const response = await context.request.get(target, { timeout: 30000 });
        const contentType = response.headers()["content-type"] || "";
        images.push({ url, status: response.status(), contentType });
        if (response.status() !== 200 || !contentType.startsWith("image/"))
          failures.push(`Social image unavailable: ${url}`);
      } catch {
        failures.push(`Social image request failed: ${url}`);
      }
    }
    const report = {
      measuredAt: new Date().toISOString(),
      baseURL,
      expectNoindex,
      sourceCount: zones.length,
      eligibleCount: eligible.length,
      indexableCount: rows.filter((r) => r.indexable).length,
      sitemapCount: sitemap.urls.length,
      sitemapDestinationCount: sitemap.urls.filter((u) =>
        new URL(u).pathname.startsWith("/destination/"),
      ).length,
      missing,
      extra,
      invalidDestinations: zones
        .filter((z) => !isIndexableDestination(z))
        .map((z) => z.zoneId),
      emptyMetadata: rows
        .filter((r) => !r.title || !r.description)
        .map((r) => r.slug),
      duplicateTitles,
      duplicateDescriptions,
      phase2: {
        noPresentation: zones
          .filter((z) => !z.notes?.trim())
          .map((z) => z.zoneId),
        shortPresentation: zones
          .filter((z) => z.notes?.trim() && z.notes.trim().length < 160)
          .map((z) => z.zoneId),
        noSpots: zones.filter((z) => !z.spots.length).map((z) => z.zoneId),
        noSpotNotes: zones
          .filter((z) => z.spots.some((s) => !s.notes?.trim()))
          .map((z) => z.zoneId),
        idealLevelNeedsReview: zones
          .filter((z) =>
            z.spots.some(
              (s) =>
                s.level &&
                !["debutant", "intermediaire", "expert"].includes(s.level),
            ),
          )
          .map((z) => z.zoneId),
      },
      images,
      failures,
      rows,
    };
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, JSON.stringify(report, null, 2) + "\n");
    console.log(
      JSON.stringify(
        {
          sourceCount: report.sourceCount,
          eligibleCount: report.eligibleCount,
          indexableCount: report.indexableCount,
          sitemapCount: report.sitemapCount,
          failures,
          output,
        },
        null,
        2,
      ),
    );
    if (failures.length) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

audit().catch(() => {
  console.error(
    "Audit SEO indisponible : vérifier le serveur HTTP, Chrome et l’accès en lecture à la base. Aucun rapport de succès produit.",
  );
  process.exitCode = 1;
});
