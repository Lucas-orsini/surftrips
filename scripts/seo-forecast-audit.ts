/** Educational guide checks within the existing read-only SEO audit. */
import type { APIRequestContext, Page } from "@playwright/test";
import { SURF_FORECAST } from "../lib/editorial/surf-forecast.ts";
import { canonicalUrl } from "../lib/seo.ts";

export async function auditForecastPage({
  request,
  parser,
  expectNoindex,
  knownPaths,
  backlinkPaths,
}: {
  request: APIRequestContext;
  parser: Page;
  expectNoindex: boolean;
  knownPaths: string[];
  backlinkPaths: string[];
}) {
  const failures: string[] = [];
  const response = await request.get(SURF_FORECAST.path, { maxRedirects: 0 });
  const html = await response.text();
  const data = await parser.evaluate((html) => {
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
      title: doc.title,
      description: meta("description"),
      robots: meta("robots"),
      ogUrl: meta("og:url"),
      ogTitle: meta("og:title"),
      ogImage: meta("og:image"),
      twitter: meta("twitter:card"),
      twitterImage: meta("twitter:image"),
      canonical: [...doc.querySelectorAll('link[rel="canonical"]')].map((n) =>
        n.getAttribute("href"),
      ),
      h1: [...doc.querySelectorAll("h1")].map((n) => n.textContent),
      headings: [
        ...doc.querySelectorAll("main h1,main h2,main h3,main h4"),
      ].map((n) => Number(n.tagName.slice(1))),
      body: doc.querySelector("main")?.textContent?.replace(/\s+/g, " ") || "",
      lang: doc.documentElement.lang,
      ids: [...doc.querySelectorAll("[id]")].map((n) => n.id),
      links: [...doc.querySelectorAll("main a[href]")].map((n) => ({
        href: n.getAttribute("href")!,
        text: n.textContent?.trim(),
      })),
      jsonLd,
    };
  }, html);
  const url = canonicalUrl(SURF_FORECAST.path);
  if (response.status() !== 200) failures.push("Guide HTTP status");
  if (
    data.title !== `${SURF_FORECAST.title} | Surftrips.fr` ||
    data.description !== SURF_FORECAST.description
  )
    failures.push("Guide metadata");
  if (
    data.canonical.length !== 1 ||
    data.canonical[0] !== url ||
    data.ogUrl !== url
  )
    failures.push("Guide canonical/OG");
  if (
    /noindex/i.test(
      data.robots + (response.headers()["x-robots-tag"] || ""),
    ) !== expectNoindex
  )
    failures.push("Guide indexability");
  if (
    data.ogTitle !== SURF_FORECAST.title ||
    data.ogImage !== canonicalUrl("/opengraph-image") ||
    data.twitter !== "summary_large_image" ||
    data.twitterImage !== data.ogImage
  )
    failures.push("Guide social metadata");
  if (
    data.lang !== "fr" ||
    data.h1.length !== 1 ||
    data.h1[0] !== SURF_FORECAST.heading ||
    data.headings.some((n, i) => i && n > data.headings[i - 1] + 1)
  )
    failures.push("Guide semantic HTML");
  if (
    !data.body.includes(SURF_FORECAST.introduction) ||
    !data.body.includes("Exemple fictif et illustratif") ||
    !data.body.includes("Surftrips ne fournit pas de prévisions actualisées")
  )
    failures.push("Guide server content/disclosure");
  if (
    data.jsonLd.length !== 1 ||
    data.jsonLd[0]["@type"] !== "WebPage" ||
    data.jsonLd[0].url !== url ||
    data.jsonLd[0].name !== data.h1[0] ||
    data.jsonLd[0].inLanguage !== "fr"
  )
    failures.push("Guide JSON-LD");
  for (const { href, text } of data.links) {
    if (!text) failures.push(`Empty guide link: ${href}`);
    if (!href.startsWith("/") && !href.startsWith("#")) continue;
    const [path, anchor] = href.split("#");
    if (path && (!knownPaths.includes(path) || href.includes("?")))
      failures.push(`Unknown guide target: ${href}`);
    if (!path && anchor && !data.ids.includes(anchor))
      failures.push(`Broken guide anchor: ${href}`);
  }
  if (!data.links.some((n) => n.href === SURF_FORECAST.ctaHref))
    failures.push("Guide search CTA missing");
  const backlinks = [];
  for (const path of backlinkPaths) {
    const linked = await request.get(path);
    const found = await parser.evaluate(
      ({ html, href }) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        doc
          .querySelectorAll("script,template,[hidden]")
          .forEach((n) => n.remove());
        return !!doc.querySelector(`main a[href="${href}"]`);
      },
      { html: await linked.text(), href: SURF_FORECAST.path },
    );
    backlinks.push({ path, found });
    if (linked.status() !== 200 || !found)
      failures.push(`Guide backlink missing: ${path}`);
  }
  return {
    path: SURF_FORECAST.path,
    status: response.status(),
    title: data.title,
    description: data.description,
    htmlBytes: Buffer.byteLength(html),
    backlinks,
    failures,
  };
}
