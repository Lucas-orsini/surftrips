/** Phase 3 checks, called by audit-seo.ts; no separate SEO command or data source. */
import type { APIRequestContext, Page } from "@playwright/test";
import type { Zone } from "../lib/types.ts";
import { publishedThemes, contextualThemes } from "../lib/editorial/themes.ts";
import {
  canonicalUrl,
  destinationPath,
  thematicStructuredData,
} from "../lib/seo.ts";
import {
  articleHighlights,
  articlePeriod,
  articleSelectionIssues,
} from "../lib/editorial/theme-articles.ts";
import { articlePhoto } from "../lib/editorial/theme-photos.ts";
import { monthStatus, isMonth } from "../lib/surf/season.ts";

export async function auditThematicPages({
  catalog,
  request,
  parser,
  expectNoindex,
  destinationRows,
}: {
  catalog: Zone[];
  request: APIRequestContext;
  parser: Page;
  expectNoindex: boolean;
  destinationRows: { slug: string; status: number }[];
}) {
  const themes = publishedThemes(catalog);
  const failures: string[] = [];
  const rows = [];
  const knownPaths = new Set([
    "/",
    "/destinations",
    ...themes.map((t) => t.path),
    ...destinationRows
      .filter((r) => r.status === 200)
      .map((r) => destinationPath(r.slug)),
  ]);
  for (const theme of themes) {
    const issues: string[] = [];
    try {
      const response = await request.get(theme.path, { maxRedirects: 0 });
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
            robots: meta("robots"),
            ogUrl: meta("og:url"),
            image: meta("og:image"),
            twitterImage: meta("twitter:image"),
            canonicals: [...doc.querySelectorAll('link[rel="canonical"]')].map(
              (n) => n.getAttribute("href"),
            ),
            h1: [...doc.querySelectorAll("h1")].map((n) => n.textContent),
            headings: [
              ...doc.querySelectorAll("main h1,main h2,main h3,main h4"),
            ].map((n) => ({
              level: Number(n.tagName.slice(1)),
              text: n.textContent?.trim(),
            })),
            body: doc.querySelector("main")?.textContent || "",
            emptySections: [...doc.querySelectorAll("main section")].filter(
              (n) => !n.textContent?.trim(),
            ).length,
            destinations: [
              ...doc.querySelectorAll("[data-theme-destination]"),
            ].map((n) => n.getAttribute("data-theme-destination")),
            features: [...doc.querySelectorAll("[data-theme-destination]")].map(
              (n) => ({
                zoneId: n.getAttribute("data-theme-destination"),
                spotId: n.getAttribute("data-featured-spot"),
                body: n.textContent || "",
              }),
            ),
            tables: doc.querySelectorAll("main table").length,
            technicalSpotRows: doc.querySelectorAll("[data-theme-spot]").length,
            links: [...doc.querySelectorAll("main a[href]")].map((n) => ({
              href: n.getAttribute("href")!,
              text: n.textContent?.trim(),
            })),
            contextual: [
              ...doc.querySelectorAll(".theme-contextual a[href]"),
            ].map((n) => n.getAttribute("href")),
            jsonLd,
          };
        },
        await response.text(),
      );
      const highlights = articleHighlights(theme, catalog);
      const selected = highlights.map((h) => h.zone);
      issues.push(...articleSelectionIssues(theme, catalog));
      if (response.status() !== 200) issues.push(`HTTP ${response.status()}`);
      if (
        data.title !== `${theme.title} | Surftrips.fr` ||
        data.description !== theme.description
      )
        issues.push("Theme metadata mismatch");
      if (
        data.canonicals.length !== 1 ||
        data.canonicals[0] !== canonicalUrl(theme.path) ||
        data.ogUrl !== canonicalUrl(theme.path)
      )
        issues.push("Theme canonical/OG mismatch");
      if (
        /noindex/i.test(
          data.robots + (response.headers()["x-robots-tag"] || ""),
        ) !== expectNoindex
      )
        issues.push("Theme indexability mismatch");
      if (
        data.image !== canonicalUrl("/opengraph-image") ||
        data.twitterImage !== data.image
      )
        issues.push("Theme social fallback mismatch");
      if (
        data.h1.length !== 1 ||
        data.h1[0] !== theme.heading ||
        !data.body.includes(theme.introduction) ||
        data.emptySections ||
        data.headings.some(
          (h, i) =>
            !h.text || (i > 0 && h.level > data.headings[i - 1].level + 1),
        )
      )
        issues.push("Theme semantic server HTML mismatch");
      if (
        JSON.stringify(data.destinations) !==
        JSON.stringify(selected.map((z) => z.zoneId))
      )
        issues.push("Theme selection/source mismatch");
      if (
        data.jsonLd.length !== 1 ||
        JSON.stringify(data.jsonLd[0]) !==
          JSON.stringify(thematicStructuredData(theme, selected))
      )
        issues.push("Theme structured data mismatch");
      if (data.tables || data.technicalSpotRows)
        issues.push("Dense spot tables reintroduced in article");
      if (
        theme.kind === "month" &&
        (selected.length < 3 || selected.length > 5)
      )
        issues.push("Monthly editorial selection outside 3–5 destinations");
      for (const highlight of highlights) {
        const { zone, spot, paragraphs } = highlight;
        const rendered = data.features.find(
          (feature) => feature.zoneId === zone.zoneId,
        );
        if (
          !rendered ||
          rendered.spotId !== spot.spotId ||
          spot.zoneId !== zone.zoneId ||
          !rendered.body.includes(articlePeriod(spot)) ||
          paragraphs.some((paragraph) => !rendered.body.includes(paragraph))
        )
          issues.push(
            `Article facts/source mismatch: ${zone.zoneId}/${spot.spotId}`,
          );
        if (
          theme.kind === "month" &&
          (!isMonth(spot.startMonth) ||
            !isMonth(spot.endMonth) ||
            !["optimale", "epaule"].includes(
              monthStatus(theme.month, spot.startMonth, spot.endMonth) || "",
            ))
        )
          issues.push(`Article season is not eligible: ${spot.spotId}`);
      }
      const photoSources = new Set(
        selected.map((zone) => articlePhoto(zone.heroImagePath)?.source),
      );
      for (const link of data.links) {
        const path = link.href.split("#")[0];
        if (
          !link.text ||
          link.href.includes("?") ||
          (path && !knownPaths.has(path) && !photoSources.has(link.href))
        )
          issues.push(`Invalid theme link: ${link.href}`);
      }
      if (
        JSON.stringify(data.contextual) !==
        JSON.stringify(contextualThemes(theme, catalog).map((t) => t.path))
      )
        issues.push("Theme contextual links mismatch");
      rows.push({
        path: theme.path,
        status: response.status(),
        title: data.title,
        description: data.description,
        destinations: selected.map((z) => z.zoneId),
        destinationLinkCount: data.links.filter((a) =>
          a.href.startsWith("/destination/"),
        ).length,
        contextualLinkCount: data.contextual.length,
        htmlCharacters: data.body.length,
        featuredDestinationCount: highlights.filter((h) => !h.compact).length,
        briefMentionCount: highlights.filter((h) => h.compact).length,
        representativeSpotCount: highlights.length,
        detailedSpotRows: data.technicalSpotRows,
        tableCount: data.tables,
        issues,
      });
    } catch {
      issues.push("Theme HTTP/HTML parsing failed");
      rows.push({ path: theme.path, status: 0, issues });
    }
    for (const issue of issues) failures.push(`${theme.path}: ${issue}`);
  }
  const unpublished = [];
  for (const path of [
    "/surf-debutant",
    "/ou-surfer-en/janvier",
    "/ou-surfer-en/novembre/debutant",
    "/surf/espagne",
    "/comparer/peniche-vs-ericeira",
  ]) {
    const response = await request.get(path);
    const noindex = /name="robots" content="noindex/.test(
      await response.text(),
    );
    unpublished.push({ path, status: response.status(), noindex });
    if (response.status() !== 404 || !noindex)
      failures.push(`${path}: unpublished route is not 404/noindex`);
  }
  const catalogResponse = await request.get("/destinations");
  const catalogLinks = await parser.evaluate(
    (html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      doc
        .querySelectorAll("script,template,[hidden]")
        .forEach((n) => n.remove());
      return [...doc.querySelectorAll("#guides a[href]")].map((n) =>
        n.getAttribute("href"),
      );
    },
    await catalogResponse.text(),
  );
  if (
    catalogResponse.status() !== 200 ||
    JSON.stringify(catalogLinks) !== JSON.stringify(themes.map((t) => t.path))
  )
    failures.push("Catalog/theme links mismatch");
  return { rows, unpublished, catalogLinks, failures };
}
