import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { THEMES } from "../../lib/editorial/themes";

test.beforeEach(async ({ page }, info) => {
  await page.setExtraHTTPHeaders({
    "x-real-ip": `198.51.100.${180 + info.workerIndex}`,
  });
});

test.describe("guides sans JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  for (const theme of THEMES)
    test(`${theme.id} : HTML, métadonnées et liste structurée`, async ({
      page,
    }) => {
      expect((await page.goto(theme.path))?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(theme.heading);
      await expect(page.locator("header.article-header")).toContainText(
        theme.introduction,
      );
      await expect(page).toHaveTitle(`${theme.title} | Surftrips.fr`);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        theme.description,
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://www.surftrips.fr${theme.path}`,
      );
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
        "content",
        `https://www.surftrips.fr${theme.path}`,
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        "content",
        "https://www.surftrips.fr/opengraph-image",
      );
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        "content",
        "summary_large_image",
      );
      await expect(page.locator("main article.surf-article")).toHaveCount(1);
      await expect(
        page.locator("main table, main [data-theme-spot]"),
      ).toHaveCount(0);
      await expect(page.locator(".article-photo-hero img")).toHaveCount(1);
      const ids = await page
        .locator("[data-theme-destination]")
        .evaluateAll((nodes) =>
          nodes.map((n) => n.getAttribute("data-theme-destination")),
        );
      expect(ids.length).toBe(
        { novembre: 4, decembre: 4, portugal: 5, "ericeira-vs-peniche": 2 }[
          theme.id
        ],
      );
      expect(new Set(ids).size).toBe(ids.length);
      const json = JSON.parse(
        await page.locator('script[type="application/ld+json"]').innerHTML(),
      );
      expect(
        json["@graph"].map((entry: { "@type": string }) => entry["@type"]),
      ).toEqual(["BreadcrumbList", "ItemList"]);
      expect(
        json["@graph"][1].itemListElement.map(
          (entry: { url: string }) => entry.url,
        ),
      ).toEqual(ids.map((id) => `https://www.surftrips.fr/destination/${id}`));
      const headingLevels = await page
        .locator("main h1,main h2,main h3,main h4")
        .evaluateAll((nodes) =>
          nodes.map((n) => ({
            level: Number(n.tagName.slice(1)),
            text: n.textContent?.trim(),
          })),
        );
      expect(
        headingLevels.every(
          (h, i) => h.text && (!i || h.level <= headingLevels[i - 1].level + 1),
        ),
      ).toBe(true);
      expect(
        await page
          .locator("main section")
          .evaluateAll((nodes) => nodes.every((n) => !!n.textContent?.trim())),
      ).toBe(true);
      await expect(page.locator("main")).not.toContainText(
        /TODO|contenu à venir|lorem ipsum/i,
      );
    });
});

test("guides : routes non publiées en 404 et paramètres sans duplication", async ({
  request,
}) => {
  for (const path of [
    "/surf-debutant",
    "/ou-surfer-en/janvier",
    "/ou-surfer-en/novembre/debutant",
    "/ou-surfer-en/__proto__",
    "/surf/espagne",
    "/comparer/peniche-vs-ericeira",
  ]) {
    const response = await request.get(path, {
      headers: { "User-Agent": "Googlebot" },
    });
    expect(response.status(), path).toBe(404);
    expect(await response.text()).toContain('name="robots" content="noindex');
  }
  const response = await request.get(
    "/ou-surfer-en/novembre?origine=GVA&niveau=expert",
  );
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain(
    'rel="canonical" href="https://www.surftrips.fr/ou-surfer-en/novembre"',
  );
});

test("articles : sélections courtes, saisons et niveaux conservés", async ({
  page,
}) => {
  await page.goto("/ou-surfer-en/novembre");
  await expect(page.locator('[data-featured-spot="coxos"]')).toContainText(
    "octobre–mars",
  );
  await expect(page.locator('[data-featured-spot="coxos"]')).toContainText(
    "minimum intermédiaire",
  );
  await expect(
    page.locator('[data-featured-spot="la-graviere"]'),
  ).toContainText("septembre–novembre");
  await expect(page.locator('[data-featured-spot="uluwatu"]')).toContainText(
    "mois d’épaule",
  );
  await expect(page.locator('[data-featured-spot="im-bay"]')).toContainText(
    "niveau idéal reste à vérifier",
  );
  await expect(page.locator("main")).not.toContainText("Bingin");
  await expect(page.locator("main")).not.toContainText("Côte des Basques");
  await expect(page.locator("header .article-intro-cta")).toHaveAttribute(
    "href",
    "/destinations#recherche",
  );
  await page.goto("/ou-surfer-en/decembre");
  await expect(
    page.locator('[data-featured-spot="calimba-do-padre"]'),
  ).toContainText("décembre–mars");
  await expect(page.locator('[data-featured-spot="monpiche"]')).toContainText(
    "décembre–mars",
  );
  await expect(
    page.locator('[data-featured-spot="jardim-do-mar"]'),
  ).toContainText("novembre–février");
  await expect(page.locator('[data-featured-spot="la-graviere"]')).toHaveCount(
    0,
  );
  await expect(page.locator('[data-featured-spot="uluwatu"]')).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText("Avancé");
});

test("guides : maillage bidirectionnel et liens thématiques contextualisés", async ({
  page,
  request,
}) => {
  await page.goto("/destination/ericeira");
  const guides = page.locator(".destination-guides a");
  await expect(guides).toHaveCount(4);
  for (const link of await guides.all()) {
    const href = (await link.getAttribute("href"))!;
    expect(href).not.toContain("?");
    expect((await request.get(href)).status()).toBe(200);
  }
  await page.goto("/destination/biarritz");
  await expect(
    page.locator('.destination-guides a[href="/ou-surfer-en/novembre"]'),
  ).toHaveCount(1);
  await expect(
    page.locator('.destination-guides a[href="/ou-surfer-en/decembre"]'),
  ).toHaveCount(0);
  await expect(page.locator('a[href="/surf-debutant"]')).toHaveCount(0);
  for (const theme of THEMES) {
    await page.goto(theme.path);
    const contextual = page.locator(".theme-contextual a");
    await expect(contextual).toHaveCount(1);
    expect(
      (await request.get((await contextual.getAttribute("href"))!)).status(),
    ).toBe(200);
  }
});

test("Portugal : formulaire existant, dates libres, origine et pays conservés jusqu’au produit", async ({
  page,
}) => {
  await page.route("https://tpemd.com/**", (route) => route.abort());
  await page.goto("/surf/portugal");
  await page
    .getByRole("link", {
      name: "Organiser mon surf trip au Portugal",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/#recherche$/);
  await expect(
    page.getByRole("button", { name: "Destination Portugal" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Dates Choisir mes dates" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Départ Paris/ }).click();
  await page.getByRole("searchbox").fill("GVA");
  await page.getByRole("button", { name: /Genève.*GVA/ }).click();
  await page.getByRole("button", { name: "Niveau Intermédiaire" }).click();
  // The existing selector unmounts its radios as soon as a level is chosen.
  await page.getByRole("radio", { name: /Expert/ }).click();
  await expect(
    page.getByRole("button", { name: "Niveau Expert" }),
  ).toBeVisible();
  const day = new Date();
  day.setUTCDate(10);
  day.setUTCMonth(day.getUTCMonth() + 1);
  const departure = day.toISOString().slice(0, 10);
  day.setUTCDate(20);
  const returnDate = day.toISOString().slice(0, 10);
  await page.getByRole("button", { name: "Dates Choisir mes dates" }).click();
  await page.getByLabel("Date de départ", { exact: true }).fill(departure);
  await page.getByLabel("Date de retour", { exact: true }).fill(returnDate);
  await page.getByRole("button", { name: "Valider mes dates" }).click();
  await page.getByRole("button", { name: "Trouver où surfer" }).click();
  await expect(page).toHaveURL(/\/recherche\?/);
  const query = new URL(page.url()).searchParams;
  expect(Object.fromEntries(query)).toEqual({
    niveau: "expert",
    origine: "GVA",
    dateDepart: departure,
    dateRetour: returnDate,
    region: "Portugal",
  });
  expect(await page.locator(".country-label").allTextContents()).toEqual(
    Array(5).fill("Portugal"),
  );
  await page
    .locator('.destination-title-row a[href*="/destination/ericeira?"]')
    .click();
  await expect(page.locator(".booking-route")).toContainText("GVA");
  await expect(page.locator("#hebergement")).toBeVisible();
});

for (const width of [1440, 1280, 768, 390])
  test(`guides : responsive et clavier à ${width}px`, async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== "desktop",
      "Largeurs explicitement parcourues.",
    );
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 950 });
    const thirdParty: string[] = [];
    const errors: string[] = [];
    page.on("request", (req) => {
      if (/tpemd\.com|widgets\.kiwi\.com|booking\.com/.test(req.url()))
        thirdParty.push(req.url());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    for (const theme of THEMES) {
      await page.goto(theme.path);
      await expect(page.locator("header .article-intro-cta")).toBeVisible();
      await page.locator("header .article-intro-cta").focus();
      await expect(page.locator("header .article-intro-cta")).toBeFocused();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `.local/seo-editorial-ux/responsive/${theme.id}-${width}-header.png`,
      });
      const images = page.locator(".article-photo img");
      expect(await images.count()).toBe(
        { novembre: 4, decembre: 4, portugal: 3, "ericeira-vs-peniche": 2 }[
          theme.id
        ],
      );
      for (const img of await images.all()) {
        await img.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            img.evaluate((el) => (el as HTMLImageElement).naturalWidth),
          )
          .toBeGreaterThan(0);
        expect(await img.getAttribute("sizes")).toBeTruthy();
        expect(await img.getAttribute("alt")).toBeTruthy();
      }
      const prose = page.locator(".article-prose").first();
      const box = await prose.boundingBox();
      expect(box!.width).toBeLessThanOrEqual(720);
      expect(
        await prose.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
      ).toBeGreaterThanOrEqual(16);
      const firstLink = page.locator(".article-destination-link").first();
      await firstLink.focus();
      await expect(firstLink).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/destination\//);
      await page.goBack();
      await page
        .locator(".article-destination")
        .first()
        .screenshot({
          path: `.local/seo-editorial-ux/responsive/${theme.id}-${width}-feature.png`,
        });
      await page.screenshot({
        path: `.local/seo-editorial-ux/responsive/${theme.id}-${width}-full.png`,
        fullPage: true,
      });
    }
    expect(thirdParty).toEqual([]);
    expect(errors).toEqual([]);
  });

test("articles : accessibilité des photographies et des liens", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const theme of THEMES) {
    await page.goto(theme.path);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      theme.path,
    ).toEqual([]);
  }
});
