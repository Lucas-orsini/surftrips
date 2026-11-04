import { test, expect } from "@playwright/test";

const slugs = ["ericeira", "biarritz", "imsouane", "bukit-bali", "hossegor"];
for (const width of [1440, 1280, 768, 390]) {
  test(`éditorial : cinq destinations à ${width}px, parcours Surf / Vol / Logement`, async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== "desktop",
      "Largeurs explicitement parcourues.",
    );
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.route("https://tpemd.com/**", (route) => route.abort());
    await page.setExtraHTTPHeaders({
      "x-real-ip": `198.51.100.${210 + info.workerIndex}`,
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const slug of slugs) {
      expect((await page.goto(`/destination/${slug}`))?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator(".destination-introduction")).toBeVisible();
      await expect(
        page.locator(".editorial-sources a").first(),
      ).toHaveAttribute("href", /^https:\/\//);
      await expect(
        page.locator(".detail-photo .destination-visual"),
      ).toHaveAttribute("data-image-state", "ready");
      await expect(page.locator(".spot-heading h3").first()).toBeVisible();
      await expect(page.locator("#levels-title")).toBeVisible();
      await expect(page.locator("#season-title")).toBeVisible();
      await expect(page.locator("#access-title")).toBeVisible();
      await expect(page.locator("#hebergement")).toBeVisible();
      for (const anchor of ["surf", "reservation", "hebergement"]) {
        await page.locator(`.destination-jumps a[href="#${anchor}"]`).click();
        await expect(page).toHaveURL(new RegExp(`#${anchor}$`));
        await expect(page.locator(`#${anchor}`)).toBeVisible();
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(page.locator("main")).not.toContainText(
        /TODO|contenu à venir|sans prendre de risques|meilleure d'Europe|25 jours par an/,
      );
      await page.screenshot({
        path: `.local/seo-phase2/screenshots/${slug}-${width}.png`,
        fullPage: true,
      });
    }
    expect(errors).toEqual([]);
  });
}

test("éditorial : liens propres et filtrage Débutant conservé", async ({
  page,
  request,
}) => {
  await page.route("https://tpemd.com/**", (route) => route.abort());
  const date = new Date();
  date.setUTCDate(10);
  date.setUTCMonth(date.getUTCMonth() + 1);
  const dateDepart = date.toISOString().slice(0, 10);
  date.setUTCDate(20);
  const params = new URLSearchParams({
    origine: "PAR",
    niveau: "debutant",
    dateDepart,
    dateRetour: date.toISOString().slice(0, 10),
  });
  await page.goto(`/destination/ericeira?${params}`);
  await expect(
    page.locator('.spot-detail[data-spot-id="ribeira-ilhas"]'),
  ).toBeVisible();
  await expect(page.locator('.spot-detail[data-spot-id="coxos"]')).toHaveCount(
    0,
  );
  await expect(page.locator(".spot-facts")).toContainText("À vérifier");
  await expect(page.locator(".back-link")).toHaveAttribute(
    "href",
    /niveau=debutant/,
  );
  const links = await page
    .locator(".country-destinations a")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")!));
  expect(links.length).toBeGreaterThan(0);
  for (const href of links) {
    expect(href).toMatch(/^\/destination\/[a-z0-9-]+$/);
    expect((await request.get(href)).status()).toBe(200);
  }
});
