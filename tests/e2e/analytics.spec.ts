import { test, expect, type Page } from "@playwright/test";
import type { BeforeSendEvent } from "@vercel/analytics/next";

// Observe the real SDK queue without loading a collector or sending test visits.
const analyticsScript =
  /\/_vercel\/insights\/script\.js|https:\/\/va\.vercel-scripts\.com\//;
async function queuedPages(page: Page) {
  return page.evaluate(() =>
    (window.vaq || [])
      .filter(([type]) => type === "pageview")
      .map(([, data]) => data as { path: string; route: string }),
  );
}

async function initialPages(page: Page, path: string, route = path) {
  await expect
    .poll(() => page.evaluate(() => window.vam))
    .toMatch(/^(development|production)$/);
  // React Strict Mode replays mount effects only in dev. No collection happens there.
  const count = await page.evaluate(() =>
    window.vam === "development" ? 2 : 1,
  );
  return Array.from({ length: count }, () => ({ path, route }));
}

test("Analytics : une instance, chargement direct puis navigations Next.js sans doublon", async ({
  page,
}, info) => {
  const scripts: string[] = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route(analyticsScript, (route) => {
    scripts.push(route.request().url());
    return route.fulfill({
      contentType: "text/javascript",
      body: "/* Collector intentionally disabled by the test. */",
    });
  });
  await page.goto("/?token=test-only#private");
  const homeViews = await initialPages(page, "/");
  await expect.poll(() => queuedPages(page)).toEqual(homeViews);
  const filtered = await page.evaluate(() => {
    const callback = window.vaq?.find(
      ([type]) => type === "beforeSend",
    )?.[1] as ((event: BeforeSendEvent) => BeforeSendEvent | null) | undefined;
    return callback?.({ type: "pageview", url: location.href });
  });
  expect(filtered).toEqual({
    type: "pageview",
    url: `${new URL(page.url()).origin}/`,
  });
  expect(page.url()).toContain("?token=test-only#private");
  if (info.project.name === "mobile")
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
  await page
    .getByRole("navigation", {
      name:
        info.project.name === "mobile"
          ? "Navigation mobile"
          : "Navigation principale",
      exact: true,
    })
    .getByRole("link", { name: "Destinations", exact: true })
    .click();
  await expect
    .poll(() => queuedPages(page))
    .toEqual([...homeViews, { path: "/destinations", route: "/destinations" }]);
  expect(scripts).toHaveLength(1);
  // The catalog deliberately uses a plain HTML link: this creates a new document.
  await page.locator('#guides a[href="/ou-surfer-en/novembre"]').click();
  await expect(page.locator("h1")).toHaveText("Où surfer en novembre ?");
  const articleViews = await initialPages(
    page,
    "/ou-surfer-en/novembre",
    "/ou-surfer-en/[mois]",
  );
  await page
    .locator('.article-destination-link[href="/destination/ericeira"]')
    .click();
  await expect(page).toHaveURL(/\/destination\/ericeira$/);
  await page.goBack();
  await expect
    .poll(() => queuedPages(page))
    .toEqual([
      ...articleViews,
      { path: "/destination/ericeira", route: "/destination/[slug]" },
      { path: "/ou-surfer-en/novembre", route: "/ou-surfer-en/[mois]" },
    ]);
  expect(scripts).toHaveLength(2); // One script for each document, none for soft navigations.
  const script = page.locator('script[data-sdkn="@vercel/analytics/next"]');
  await expect(script).toHaveCount(1);
  await expect(script).toHaveAttribute("defer", "");
  const development = scripts[0].includes("script.debug.js");
  expect(await page.evaluate(() => window.vam)).toBe(
    development ? "development" : "production",
  );
  if (development) await expect(script).toHaveAttribute("data-debug", "false");
  expect(errors).toEqual([]);
});

test("Analytics : pages publiques directement suivies, URL nettoyées sans toucher au produit", async ({
  page,
}) => {
  await page.route(analyticsScript, (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: "/* No telemetry in tests. */",
    }),
  );
  for (const path of [
    "/recherche",
    "/destination/imsouane",
    "/ou-surfer-en/decembre",
    "/surf/portugal",
    "/comparer/ericeira-vs-peniche",
    "/confidentialite",
  ]) {
    await page.goto(`${path}?email=test%40example.com&token=private#secret`);
    const expected = await initialPages(page, path);
    await expect
      .poll(async () => (await queuedPages(page)).map((v) => v.path))
      .toEqual(expected.map((v) => v.path));
    const filtered = await page.evaluate(() => {
      const callback = window.vaq?.find(
        ([type]) => type === "beforeSend",
      )?.[1] as
        ((event: BeforeSendEvent) => BeforeSendEvent | null) | undefined;
      return callback?.({ type: "pageview", url: location.href });
    });
    expect(filtered).toEqual({
      type: "pageview",
      url: `${new URL(page.url()).origin}${path}`,
    });
    expect(page.url()).toContain(
      "?email=test%40example.com&token=private#secret",
    );
  }
});
