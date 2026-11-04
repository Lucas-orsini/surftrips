import { test, expect } from "@playwright/test";

const origin = "https://www.surftrips.fr";
const destinations = [
  ["ericeira", "Ericeira", "Portugal"],
  ["biarritz", "Biarritz", "France"],
  ["imsouane", "Imsouane", "Maroc"],
  ["bukit-bali", "Bukit / Uluwatu (Bali)", "Indonesie"],
  ["hossegor", "Hossegor / Seignosse", "France"],
];

test.describe("HTML sans JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  for (const [slug, name, country] of destinations) {
    test(`SEO : ${slug}, contenu serveur et métadonnées`, async ({ page }) => {
      const response = await page.goto(`/destination/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator(".destination-introduction")).toBeVisible();
      await expect(page.locator(".spot-heading h3").first()).toBeVisible();
      await expect(page.locator("#season-title")).toBeVisible();
      await expect(page.locator("#access-title")).toBeVisible();
      await expect(page.locator("h1")).toContainText(name);
      await expect(page.locator(".detail-heading")).toContainText(country);
      await expect(page.locator(".spot-detail").first()).toBeVisible();
      await expect(page.locator(".destination-info")).toContainText("Niveau");
      await expect(page.locator(".season-detail-note")).toBeVisible();
      await expect(page.locator(".back-link")).toHaveAttribute(
        "href",
        "/destinations",
      );
      await expect(page).toHaveTitle(
        `Surf à ${name} : spots, saison et niveau | Surftrips.fr`,
      );
      await expect(
        page.locator('head meta[name="description"]'),
      ).toHaveAttribute("content", new RegExp(country));
      await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${origin}/destination/${slug}`,
      );
      await expect(
        page.locator('head meta[property="og:url"]'),
      ).toHaveAttribute("content", `${origin}/destination/${slug}`);
      const data = JSON.parse(
        await page.locator('script[type="application/ld+json"]').innerHTML(),
      );
      expect(data["@type"]).toBe("BreadcrumbList");
      expect(data.itemListElement[2].name).toBe(name);
    });
  }

  test("SEO : accueil et catalogue lisibles sans hydratation", async ({
    page,
  }) => {
    expect((await page.goto("/"))?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page).toHaveTitle(
      "Surftrips.fr — Le bon spot. Au bon moment.",
    );
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
      "href",
      origin,
    );
    await expect(page.locator('head meta[name="description"]')).toHaveAttribute(
      "content",
      /destination de surf/,
    );
    expect(
      JSON.parse(
        await page.locator('script[type="application/ld+json"]').innerHTML(),
      )["@type"],
    ).toBe("WebSite");
    expect((await page.goto("/destinations"))?.status()).toBe(200);
    await expect(page.locator(".destination-card").first()).toBeVisible();
    expect(
      await page.locator('a[href^="/destination/"]').count(),
    ).toBeGreaterThan(5);
  });
});

test("SEO : 404 réelle pour tout user-agent, noindex et routes exclues", async ({
  request,
}) => {
  for (const agent of [
    "Mozilla/5.0",
    "Googlebot",
    "bingbot",
    "OAI-SearchBot",
    "ChatGPT-User",
  ]) {
    const response = await request.get(
      "/destination/seo-inexistante-20261103",
      { headers: { "User-Agent": agent } },
    );
    expect(response.status(), agent).toBe(404);
    expect(await response.text()).toMatch(/name="robots" content="noindex/);
  }
  for (const path of [
    "/recherche",
    "/search",
    "/mentions-legales",
    "/confidentialite",
  ]) {
    const response = await request.get(path, {
      headers: { "x-real-ip": "198.51.100.222" },
    });
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain(
      'name="robots" content="noindex, follow"',
    );
  }
});

test("SEO : paramètres conservés, canonical et métadonnées stables", async ({
  page,
}) => {
  await page.route("https://tpemd.com/**", (route) => route.abort());
  const start = new Date();
  start.setUTCDate(10);
  start.setUTCMonth(start.getUTCMonth() + 1);
  const end = new Date(start);
  end.setUTCDate(20);
  const dates = `dateDepart=${start.toISOString().slice(0, 10)}&dateRetour=${end.toISOString().slice(0, 10)}`;
  for (const query of [
    "",
    "origine=GVA",
    dates,
    "niveau=expert",
    `origine=GVA&niveau=expert&${dates}`,
  ]) {
    await page.goto(`/destination/ericeira${query ? `?${query}` : ""}`);
    expect(new URL(page.url()).search.slice(1)).toBe(query);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${origin}/destination/ericeira`,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      `${origin}/destination/ericeira`,
    );
  }
  await expect(page.locator(".flight-widget")).toBeAttached();
  await expect(page.locator(".back-link")).toHaveAttribute(
    "href",
    /origine=GVA/,
  );
  await expect(page.locator(".back-link")).toHaveAttribute(
    "href",
    /niveau=expert/,
  );
});

test("SEO : robots, sitemap et image sociale de secours", async ({
  request,
  page,
}) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const rules = await robots.text();
  expect(rules).toContain("User-Agent: *\nAllow: /");
  expect(rules).not.toContain("Disallow: /recherche");
  expect(rules).not.toContain("GPTBot");
  expect(rules).toContain(`Sitemap: ${origin}/sitemap.xml`);
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const sitemap = await page.evaluate(
    (xml) => {
      const doc = new DOMParser().parseFromString(xml, "application/xml");
      return {
        errors: doc.querySelectorAll("parsererror").length,
        urls: [...doc.querySelectorAll("loc")].map((el) => el.textContent!),
      };
    },
    await response.text(),
  );
  expect(sitemap.errors).toBe(0);
  expect(new Set(sitemap.urls).size).toBe(sitemap.urls.length);
  for (const url of sitemap.urls) {
    expect(new URL(url).origin).toBe(origin);
    expect(new URL(url).search).toBe("");
    expect(url).not.toMatch(/\/(go|search|recherche)\//);
  }
  const image = await request.get("/opengraph-image");
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/png");
});
