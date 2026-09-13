import { expect, test, type Locator } from "@playwright/test";
import manifest from "../../docs/destination-image-final-seven.json" with { type: "json" };

test.beforeEach(async ({ page }, info) => {
  test.skip(
    info.project.name !== "desktop",
    "Deux largeurs explicites, sur les données réelles.",
  );
  await page.setExtraHTTPHeaders({
    "x-real-ip": `198.51.100.${190 + info.workerIndex}`,
  });
  await page.route("https://tpemd.com/**", (route) => route.abort());
  await page.route("https://creator.expediagroup.com/**", (route) =>
    route.abort(),
  );
});

async function imageReady(
  visual: Locator,
  entry: (typeof manifest.images)[number],
) {
  await expect(visual).toHaveAttribute("data-image-state", "ready", {
    timeout: 20_000,
  });
  const img = visual.locator("img");
  await expect(img).toHaveAttribute(
    "alt",
    `Surf à ${entry.destination}, ${entry.country}`,
  );
  expect(
    await img.evaluate(
      (node: HTMLImageElement) =>
        new URL(new URL(node.src).searchParams.get("url")!).pathname,
    ),
  ).toBe(`/storage/v1/object/public/destinations/${entry.storage_path}`);
  await expect(img).toHaveCSS("object-fit", "cover");
}

for (const width of [1440, 390]) {
  test(`six nouvelles photos : bannières et attribution ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const entry of manifest.images) {
      expect((await page.goto(`/destination/${entry.zone_id}`))?.status()).toBe(
        200,
      );
      const banner = page.locator(
        ".detail-photo:not(.destination-hero-skeleton)",
      );
      await imageReady(banner.locator(".destination-visual"), entry);
      expect((await banner.boundingBox())!.height).toBe(
        width === 390 ? 220 : 340,
      );
      const credit = page
        .locator(`[data-photo-credit="${entry.storage_path}"]`)
        .first();
      if (entry.attribution_required) {
        await expect(credit).toBeVisible();
        await expect(credit).toContainText(entry.photographer);
        await expect(
          credit.locator(`a[href="${entry.photographer_url}"]`),
        ).toHaveText(entry.photographer);
        await expect(credit).toContainText(entry.title);
        await expect(
          credit.locator(`a[href="${entry.license_url}"]`),
        ).toHaveText(entry.license);
        await expect(credit).toContainText("Recadrée");
      } else await expect(credit).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await banner.screenshot({
        path: `test-results/final-seven/banner-${entry.zone_id}-${width}.png`,
        scale: "css",
      });
      await page.screenshot({
        path: `test-results/final-seven/page-${entry.zone_id}-${width}.png`,
        scale: "css",
      });
    }
    await page.reload();
    await imageReady(
      page.locator(".detail-photo .destination-visual"),
      manifest.images.at(-1)!,
    );
    await page.goto("/destination/pavones");
    const fallback = page.locator(".detail-photo .destination-visual");
    await expect(fallback).toHaveAttribute("data-image-state", "fallback");
    await expect(fallback).toBeVisible();
    expect((await fallback.boundingBox())!.height).toBe(
      width === 390 ? 220 : 340,
    );
  });

  test(`six nouvelles photos : cartes et recherches réelles ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: 1000 });
    const depart = new Date();
    depart.setUTCDate(depart.getUTCDate() + 30);
    const retour = new Date(depart);
    retour.setUTCDate(retour.getUTCDate() + 10);
    const criteria = {
      niveau: "expert",
      origine: "PAR",
      dateDepart: depart.toISOString().slice(0, 10),
      dateRetour: retour.toISOString().slice(0, 10),
    };
    for (const country of new Set(manifest.images.map((e) => e.country))) {
      await page.goto(
        `/search?${new URLSearchParams({ ...criteria, region: country })}`,
      );
      for (const entry of manifest.images.filter(
        (e) => e.country === country,
      )) {
        const card = page.locator(".destination-card").filter({
          has: page.locator(
            `a.destination-photo-link[href^="/destination/${entry.zone_id}?"]`,
          ),
        });
        await card.scrollIntoViewIfNeeded();
        await imageReady(card.locator(".destination-visual"), entry);
        await expect(card.locator(".season-timeline")).toBeVisible();
        await expect(card.locator("img")).toHaveAttribute("loading", "lazy");
        await expect(
          card.locator(`[data-photo-credit="${entry.storage_path}"]`),
        ).toHaveCount(entry.attribution_required ? 1 : 0);
        await card.screenshot({
          path: `test-results/final-seven/card-${entry.zone_id}-${width}.png`,
          scale: "css",
        });
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    const last = manifest.images.at(-1)!;
    await page
      .locator(
        `a.destination-photo-link[href^="/destination/${last.zone_id}?"]`,
      )
      .click();
    await imageReady(page.locator(".detail-photo .destination-visual"), last);
    expect(new URL(page.url()).searchParams.get("origine")).toBe("PAR");
  });
}

test("la panne d’une nouvelle image conserve le fallback et les dimensions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/_next/image?**", (route) => route.abort());
  await page.goto("/destination/chicama");
  const visual = page.locator(".detail-photo .destination-visual");
  await expect(visual).toHaveAttribute("data-image-state", "fallback");
  expect((await visual.boundingBox())!.height).toBe(220);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Chicama",
  );
});
