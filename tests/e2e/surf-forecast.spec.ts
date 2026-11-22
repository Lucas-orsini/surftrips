import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { SURF_FORECAST } from "../../lib/editorial/surf-forecast";
import { THEMES } from "../../lib/editorial/themes";

test.describe("guide surf forecast sans JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("HTML initial, métadonnées, limites et schéma éditorial", async ({
    page,
  }) => {
    const response = await page.goto(`${SURF_FORECAST.path}?origine=GVA`);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(`${SURF_FORECAST.title} | Surftrips.fr`);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(SURF_FORECAST.heading);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://www.surftrips.fr/surf-forecast",
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      SURF_FORECAST.description,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      "https://www.surftrips.fr/surf-forecast",
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator("header.article-header")).toContainText(
      "Surftrips ne fournit pas de prévisions actualisées",
    );
    await expect(page.locator("#exemple")).toContainText(
      "Exemple fictif et illustratif",
    );
    await expect(page.locator("#previsions-et-saisons")).toContainText(
      "ne sont ni des mesures en direct",
    );
    const json = JSON.parse(
      await page.locator('script[type="application/ld+json"]').innerHTML(),
    );
    expect(json["@type"]).toBe("WebPage");
    expect(json.name).toBe(SURF_FORECAST.heading);
    expect(json.url).toBe("https://www.surftrips.fr/surf-forecast");
    expect(json.inLanguage).toBe("fr");
    await expect(
      page.getByRole("img", {
        name: "Hauteur et période d’une onde simplifiée",
      }),
    ).toBeVisible();
    const levels = await page
      .locator("main h1,main h2,main h3")
      .evaluateAll((nodes) => nodes.map((n) => Number(n.tagName[1])));
    expect(levels.every((level, i) => !i || level <= levels[i - 1] + 1)).toBe(
      true,
    );
    await page
      .getByRole("link", { name: "Trouver ma destination surf", exact: true })
      .click();
    await expect(page).toHaveURL(/\/destinations#recherche$/);
    await expect(page.locator("#recherche")).toBeVisible();
  });
});

test("maillage réel, ancres, sitemap et absence de pages satellites", async ({
  page,
  request,
}) => {
  await page.goto(SURF_FORECAST.path);
  const links = await page
    .locator('main a[href^="/"],main a[href^="#"]')
    .evaluateAll((nodes) => [
      ...new Set(nodes.map((n) => n.getAttribute("href")!)),
    ]);
  for (const href of links) {
    const [path, hash] = href.split("#");
    if (!path) await expect(page.locator(`[id="${hash}"]`)).toHaveCount(1);
    else {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status(), href).toBe(200);
      if (hash) expect(await response.text()).toContain(`id="${hash}"`);
    }
  }
  for (const theme of THEMES) {
    await page.goto(theme.path);
    await expect(page.locator('main a[href="/surf-forecast"]')).toHaveCount(1);
  }
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(
    xml.match(/<loc>https:\/\/www.surftrips.fr\/surf-forecast<\/loc>/g),
  ).toHaveLength(1);
  for (const path of [
    "/surf-forecast/demain",
    "/surf-forecast/ericeira",
    "/en/surf-forecast",
  ]) {
    expect((await request.get(path)).status()).toBe(404);
  }
});

for (const width of [1440, 1280, 768, 390]) {
  test(`lecture, clavier et accessibilité à ${width}px`, async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== "desktop",
      "Les quatre largeurs sont déjà couvertes dans le projet desktop.",
    );
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route(/\/_vercel\/insights\/script\.js/, (route) =>
      route.fulfill({
        contentType: "text/javascript",
        body: "/* No test telemetry */",
      }),
    );
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(SURF_FORECAST.path);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const prose = await page
      .locator("#les-donnees")
      .evaluate((n) => ({
        width: n.getBoundingClientRect().width,
        size: parseFloat(getComputedStyle(n).fontSize),
      }));
    expect(prose.width).toBeLessThanOrEqual(720);
    expect(prose.size).toBeGreaterThanOrEqual(16);
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      axe.violations.map((v) => ({
        id: v.id,
        targets: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    await page.screenshot({
      path: info.outputPath(`forecast-${width}-top.png`),
    });
    await page.screenshot({
      path: info.outputPath(`forecast-${width}-full.png`),
      fullPage: true,
    });
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Aller au contenu" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    const exampleLink = page.getByRole("link", {
      name: "Voir l’exemple expliqué",
    });
    await exampleLink.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#exemple$/);
    await expect(page.locator("#example-title")).toBeInViewport();
    const cta = page.getByRole("link", {
      name: "Trouver ma destination surf",
      exact: true,
    });
    await cta.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/destinations#recherche$/);
    await expect(
      page.getByRole("button", { name: "Niveau Intermédiaire" }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
}
