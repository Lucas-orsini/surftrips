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
import { isSurfLevel, LEVEL_LABELS } from "../lib/surf/levels.ts";
import { adaptZone } from "../lib/db/rows.ts";
import {
  publishedThemes,
  themesForDestination,
} from "../lib/editorial/themes.ts";
import { hasUnambiguousBeginnerLevel } from "../lib/surf/thematic.ts";
import { auditThematicPages } from "./seo-theme-audit.ts";
import {
  destinationEditorials,
  getDestinationEditorial,
  validateDestinationEditorial,
  relatedCountryDestinations,
} from "../lib/editorial/destinations.ts";

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
  airportCode: string | null;
  airportName: string | null;
  airportAlternative: string | null;
  latitude: string | null;
  longitude: string | null;
  transfer: string | null;
  centerStatus: string | null;
  spots: {
    spotId: string;
    name: string;
    notes: string | null;
    level: string | null;
    season: string | null;
    minimum: string | null;
    startMonth: number | null;
    endMonth: number | null;
    wave: string | null;
    bottom: string | null;
    caution: string | null;
    coordinateStatus: string | null;
  }[];
}

async function audit() {
  const zones =
    await readQuery<CensusRow>(`SELECT z.zone_id AS "zoneId", z.nom AS name, z.pays AS country,
    z.notes, to_jsonb(z)->>'hero_image_path' AS image, z.code_aeroport AS "airportCode",
    z.transfert AS transfer, z.centre_statut AS "centerStatus", z.aeroport AS "airportName",
    z.code_aeroport_alt AS "airportAlternative",z.lat_centre AS latitude,z.lon_centre AS longitude,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('spotId',s.spot_id,'name',s.nom,'notes',s.notes,
    'level',s.niveau_ideal,'season',s.saison_ideale,'minimum',s.niveau_min,
    'startMonth',s.mois_debut,'endMonth',s.mois_fin,'wave',s.type_vague,'bottom',s.fond,
    'caution',s.flag_verif,'coordinateStatus',s.coord_statut) ORDER BY s.spot_id)
    FROM public.spots s WHERE s.zone_id=z.zone_id),'[]'::jsonb) AS spots
    FROM public.zones z ORDER BY z.zone_id`);
  if (!zones.length) throw new Error("Empty source catalog");
  // Reuse the application adapter; keep raw historical values in the census above.
  const catalog = zones.map((z) =>
    adaptZone(
      {
        zone_id: z.zoneId,
        nom: z.name,
        pays: z.country,
        notes: z.notes,
        hero_image_path: z.image,
        code_aeroport: z.airportCode,
        code_aeroport_alt: z.airportAlternative,
        aeroport: z.airportName,
        transfert: z.transfer,
        lat_centre: z.latitude,
        lon_centre: z.longitude,
        spots: z.spots.map((s) => ({
          spot_id: s.spotId,
          nom: s.name,
          zone_id: z.zoneId,
          niveau_min: s.minimum,
          niveau_ideal: s.level,
          mois_debut: s.startMonth,
          mois_fin: s.endMonth,
          saison_ideale: s.season,
          type_vague: s.wave,
          fond: s.bottom,
          notes: s.notes,
          flag_verif: s.caution,
        })),
      },
      [],
    ),
  );
  const themes = publishedThemes(catalog);
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      baseURL,
    });
    // DOMParser only parses the HTTP response; no site script or RSC payload executes.
    const parser = await context.newPage();
    const failures: string[] = [];
    for (const [id, entry] of Object.entries(destinationEditorials)) {
      if (!entry) continue;
      const zone = zones.find((z) => z.zoneId === id);
      if (!zone) failures.push(`Orphan editorial destination: ${id}`);
      else
        for (const issue of validateDestinationEditorial(entry, zone))
          failures.push(`${id}: ${issue}`);
    }
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
      ...themes.map((theme) => theme.path),
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
      countryLinks?: string[];
      guideLinks?: string[];
      semanticHtml?: boolean;
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
              h1Count: doc.querySelectorAll("h1").length,
              headings: [
                ...doc.querySelectorAll(
                  "main h1,main h2,main h3,main h4,main h5,main h6",
                ),
              ].map((n) => ({
                level: Number(n.tagName.slice(1)),
                text: n.textContent?.trim() || "",
              })),
              spotIds: [...doc.querySelectorAll(".spot-detail")].map((n) => ({
                id: n.getAttribute("data-spot-id"),
                heading: n.querySelector("h3")?.textContent,
                facts: Object.fromEntries(
                  [...n.querySelectorAll(".spot-facts > div")].map((row) => [
                    row.querySelector("dt")?.textContent,
                    row.querySelector("dd")?.textContent,
                  ]),
                ),
              })),
              introduction:
                doc.querySelector(".destination-introduction")?.textContent ||
                "",
              emptySections: [...doc.querySelectorAll("main section")].filter(
                (n) => !n.textContent?.trim(),
              ).length,
              countryLinks: [
                ...doc.querySelectorAll(".country-destinations a[href]"),
              ].map((n) => ({
                href: n.getAttribute("href")!,
                text: n.textContent?.trim() || "",
              })),
              guideLinks: [
                ...doc.querySelectorAll(".destination-guides a[href]"),
              ].map((n) => n.getAttribute("href")!),
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
          if (!getDestinationEditorial(zone)?.introduction)
            issues.push("Existing presentation missing in HTML");
        const editorial = getDestinationEditorial(zone);
        if (
          editorial?.introduction &&
          !data.introduction.includes(editorial.introduction.text)
        )
          issues.push("Editorial introduction missing in server HTML");
        if (!editorial?.introduction && !zone.notes && data.introduction)
          issues.push("Artificial presentation on an unedited destination");
        const semanticHtml =
          data.h1Count === 1 &&
          data.emptySections === 0 &&
          data.headings.every(
            (h, i) =>
              h.text && (!i || h.level <= data.headings[i - 1].level + 1),
          ) &&
          zone.spots.every((s) =>
            data.spotIds.some((h) => h.id === s.spotId && h.heading === s.name),
          );
        if (!semanticHtml)
          issues.push(
            "Heading hierarchy, empty section or spot association invalid",
          );
        for (const spot of zone.spots) {
          const facts = data.spotIds.find((s) => s.id === spot.spotId)?.facts;
          if (
            !facts ||
            (isSurfLevel(spot.minimum) &&
              facts["Niveau minimum"] !== LEVEL_LABELS[spot.minimum]) ||
            (isSurfLevel(spot.level) &&
              facts["Niveau idéal"] !== LEVEL_LABELS[spot.level]) ||
            (spot.level &&
              !isSurfLevel(spot.level) &&
              facts["Niveau idéal"] !== "À vérifier") ||
            (spot.season && facts.Saison !== spot.season) ||
            (spot.wave && facts.Vague !== spot.wave) ||
            (spot.bottom && facts.Fond !== spot.bottom)
          )
            issues.push(`Structured spot facts changed: ${spot.spotId}`);
        }
        const relatedIds = zone.airportCode
          ? zones
              .filter(
                (z) =>
                  z.zoneId !== zone.zoneId &&
                  z.airportCode === zone.airportCode,
              )
              .map((z) => z.zoneId)
          : [];
        const expectedCountryLinks = relatedCountryDestinations(
          zone,
          zones,
          relatedIds,
        ).map((z) => destinationPath(z.zoneId));
        if (
          data.countryLinks.length !== expectedCountryLinks.length ||
          data.countryLinks.some(
            (a) =>
              !a.text ||
              !expectedCountryLinks.includes(a.href) ||
              a.href.includes("?"),
          )
        )
          issues.push("Editorial country links mismatch");
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
        const sourceZone = catalog.find((z) => z.zoneId === zone.zoneId)!;
        const expectedGuides = themesForDestination(sourceZone, catalog).map(
          (t) => t.path,
        );
        if (JSON.stringify(data.guideLinks) !== JSON.stringify(expectedGuides))
          issues.push("Destination/theme backlinks mismatch");
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
          countryLinks: data.countryLinks.map((a) => a.href),
          semanticHtml,
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
    for (const row of rows) {
      for (const href of row.countryLinks || []) {
        if (
          !rows.some(
            (target) =>
              destinationPath(target.slug) === href && target.status === 200,
          )
        )
          failures.push(
            `${row.slug}: linked destination not HTTP 200: ${href}`,
          );
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
    const phase3 = await auditThematicPages({
      catalog,
      request: context.request,
      parser,
      expectNoindex,
      destinationRows: rows,
    });
    failures.push(...phase3.failures);
    if (themes.length) imageUrls.add(canonicalUrl("/opengraph-image"));
    const allTitles = [
      ...rows.map((r) => r.title),
      ...phase3.rows.map((r) => r.title).filter(Boolean),
    ];
    const allDescriptions = [
      ...rows.map((r) => r.description),
      ...phase3.rows.map((r) => r.description).filter(Boolean),
    ];
    if (
      new Set(allTitles).size !== allTitles.length ||
      new Set(allDescriptions).size !== allDescriptions.length
    )
      failures.push("Duplicate metadata across destinations and themes");
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
        databasePresentationCount: zones.filter((z) => z.notes?.trim()).length,
        editorialPresentationCount: zones.filter(
          (z) => getDestinationEditorial(z)?.introduction,
        ).length,
        addedPresentationCount: zones.filter(
          (z) => !z.notes?.trim() && getDestinationEditorial(z)?.introduction,
        ).length,
        effectivePresentationCount: zones.filter(
          (z) => z.notes?.trim() || getDestinationEditorial(z)?.introduction,
        ).length,
        semanticPageCount: rows.filter((r) => r.semanticHtml).length,
        addedCountryLinkCount: rows.reduce(
          (sum, r) => sum + (r.countryLinks?.length || 0),
          0,
        ),
        noEffectivePresentation: zones
          .filter(
            (z) =>
              !z.notes?.trim() && !getDestinationEditorial(z)?.introduction,
          )
          .map((z) => z.zoneId),
        detailedLevelReview: zones.flatMap((z) =>
          z.spots
            .filter(
              (s) =>
                s.level &&
                !["debutant", "intermediaire", "expert"].includes(s.level),
            )
            .map((s) => ({
              spotId: s.spotId,
              zoneId: z.zoneId,
              destination: z.name,
              field: "niveau_ideal",
              value: s.level,
              reason:
                "Valeur hors des trois niveaux validés ; aucune correspondance métier confirmée.",
            })),
        ),
        seasonsMissing: zones.flatMap((z) =>
          z.spots
            .filter((s) => !s.startMonth || !s.endMonth)
            .map((s) => ({ zoneId: z.zoneId, spotId: s.spotId })),
        ),
        geographicReview: zones.map((z) => ({
          zoneId: z.zoneId,
          centerStatus: z.centerStatus,
          spots: z.spots
            .filter((s) => s.coordinateStatus !== "ok")
            .map((s) => ({ spotId: s.spotId, status: s.coordinateStatus })),
        })),
        sourceFlags: zones.flatMap((z) =>
          z.spots
            .filter((s) => s.caution)
            .map((s) => ({
              zoneId: z.zoneId,
              spotId: s.spotId,
              flag: s.caution,
            })),
        ),
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
      phase3: {
        ...phase3,
        beginnerCandidates: catalog
          .flatMap((z) => z.spots)
          .filter((s) => s.minimumLevel === "debutant").length,
        unambiguousBeginnerLevels: catalog
          .flatMap((z) => z.spots)
          .filter(hasUnambiguousBeginnerLevel).length,
        destinationBacklinkCount: rows.reduce(
          (n, r) => n + (r.guideLinks?.length || 0),
          0,
        ),
        destinationBacklinks: rows
          .filter((r) => r.guideLinks?.length)
          .map((r) => ({ zoneId: r.slug, paths: r.guideLinks })),
      },
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
