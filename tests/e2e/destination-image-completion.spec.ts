import { test, expect, type Locator } from "@playwright/test";
import completion from "../../docs/destination-image-completion.json" with { type: "json" };
import first from "../../docs/destination-image-batch.json" with { type: "json" };
import second from "../../docs/destination-image-batch-02.json" with { type: "json" };
import finalSeven from "../../docs/destination-image-final-seven.json" with { type: "json" };

const allImages = [
  ...first.images,
  ...second.images,
  ...completion.images,
  ...finalSeven.images,
];
const viewports = [
  { width: 1440, height: 1000, bannerHeight: 340 },
  { width: 1280, height: 900, bannerHeight: 340 },
  { width: 768, height: 1024, bannerHeight: 280 },
  { width: 390, height: 844, bannerHeight: 220 },
];

test.beforeEach(async ({ page }, info) => {
  test.skip(
    info.project.name !== "desktop",
    "Les quatre largeurs sont explicites.",
  );
  await page.setExtraHTTPHeaders({
    "x-real-ip": `198.51.100.${120 + info.workerIndex}`,
  });
  // No image or database mocks; booking scripts are unrelated to this publication.
  await page.route("https://creator.expediagroup.com/**", (route) =>
    route.abort(),
  );
  await page.route("https://tpemd.com/**", (route) => route.abort());
});

async function loadedImage(
  visual: Locator,
  entry: (typeof completion.images)[number],
) {
  await expect(visual).toHaveAttribute("data-image-state", "ready", {
    timeout: 20_000,
  });
  const img = visual.locator("img");
  await expect(img).toHaveAttribute(
    "alt",
    `Surf à ${entry.destination}, ${entry.country}`,
  );
  const source = await img.evaluate((node: HTMLImageElement) => {
    const src = new URL(node.src);
    return {
      path: new URL(src.searchParams.get("url")!).pathname,
      width: node.naturalWidth,
    };
  });
  expect(source.width).toBeGreaterThan(0);
  expect(source.path).toBe(
    `/storage/v1/object/public/destinations/${entry.storage_path}`,
  );
  await expect(img).toHaveCSS("object-fit", "cover");
}

for (const viewport of viewports) {
  test(`publication complète : bannières ${viewport.width}px`, async ({
    page,
  }) => {
    test.setTimeout(300_000);
    await page.setViewportSize(viewport);
    for (const entry of completion.images) {
      expect((await page.goto(`/destination/${entry.zone_id}`))?.status()).toBe(
        200,
      );
      const banner = page.locator(
        ".detail-photo:not(.destination-hero-skeleton)",
      );
      await loadedImage(banner.locator(".destination-visual"), entry);
      await expect(page.locator(".destination-hero-skeleton")).toHaveCount(0);
      await expect(banner).toBeVisible();
      const box = (await banner.boundingBox())!;
      expect(box.height).toBe(viewport.bannerHeight);
      expect(
        (await page.locator(".destination-overview").boundingBox())!.y,
      ).toBeLessThan(box.y);
      await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(
        1,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        await page.evaluate(() => {
          const surf = document.querySelector("#surf")!;
          const flight = document.querySelector("#reservation")!;
          const hotel = document.querySelector("#hebergement")!;
          return (
            !!(
              surf.compareDocumentPosition(flight) &
              Node.DOCUMENT_POSITION_FOLLOWING
            ) &&
            !!(
              flight.compareDocumentPosition(hotel) &
              Node.DOCUMENT_POSITION_FOLLOWING
            )
          );
        }),
      ).toBe(true);
      await banner.screenshot({
        path: `test-results/completion/banner-${entry.zone_id}-${viewport.width}.png`,
        scale: "css",
      });
    }
    await page.reload();
    await loadedImage(
      page.locator(".detail-photo .destination-visual"),
      completion.images.at(-1)!,
    );
  });

  test(`publication complète : cartes ${viewport.width}px`, async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.setViewportSize(viewport);
    await page.goto("/destinations");
    const cards = page.locator(".destination-card");
    await expect(cards).toHaveCount(77);
    for (const card of await cards.all()) {
      const href = await card
        .locator("a.destination-photo-link")
        .getAttribute("href");
      const id = href!.split("/").at(-1)!;
      const entry = allImages.find((e) => e.zone_id === id);
      await card.scrollIntoViewIfNeeded();
      const visual = card.locator(".destination-visual");
      if (entry) {
        await loadedImage(visual, entry as (typeof completion.images)[number]);
        await expect(visual.locator("img")).toHaveAttribute("loading", "lazy");
      } else {
        await expect(visual).toHaveAttribute("data-image-state", "fallback");
        await expect(visual.locator("img")).toHaveCount(0);
      }
      await expect(card.locator(".season-timeline")).toBeVisible();
      if (completion.images.some((e) => e.zone_id === id))
        await card.locator(".destination-photo").screenshot({
          path: `test-results/completion/card-${id}-${viewport.width}.png`,
          scale: "css",
        });
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test("publication complète : recherches réelles par pays et navigation Next.js", async ({
  page,
}, info) => {
  test.setTimeout(180_000);
  const date = new Date();
  date.setUTCDate(10);
  date.setUTCMonth(date.getUTCMonth() + 1);
  const departure = date.toISOString().slice(0, 10);
  date.setUTCDate(20);
  const criteria = {
    niveau: "expert",
    origine: "PAR",
    dateDepart: departure,
    dateRetour: date.toISOString().slice(0, 10),
  };
  const seen = new Set<string>();
  const countries = [...new Set(completion.images.map((e) => e.country))];
  for (const [index, region] of countries.entries()) {
    await page.setExtraHTTPHeaders({ "x-real-ip": `203.0.113.${index + 1}` });
    await page.goto(`/search?${new URLSearchParams({ ...criteria, region })}`);
    await expect(page.locator(".search-result-heading h2")).toBeVisible();
    await expect(page.locator(".destination-card.skeleton")).toHaveCount(0);
    await expect(page.locator(".form-error")).toHaveCount(0);
    for (const card of await page.locator(".destination-card").all()) {
      const href = await card
        .locator("a.destination-photo-link")
        .getAttribute("href");
      const id = new URL(href!, page.url()).pathname.split("/").at(-1)!;
      const entry = completion.images.find((e) => e.zone_id === id);
      if (!entry) continue;
      await card.scrollIntoViewIfNeeded();
      await loadedImage(card.locator(".destination-visual"), entry);
      seen.add(id);
    }
  }
  await info.attach("recherches-par-pays", {
    body: JSON.stringify(
      {
        countries,
        seen: [...seen],
        absent: completion.images
          .filter((e) => !seen.has(e.zone_id))
          .map((e) => e.zone_id),
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
  expect([...seen].sort()).toEqual(
    completion.images.map((e) => e.zone_id).sort(),
  );
  const last = completion.images.at(-1)!;
  await page.goto(
    `/search?${new URLSearchParams({ ...criteria, region: last.country })}`,
  );
  await page
    .locator(`a.destination-photo-link[href^="/destination/${last.zone_id}?"]`)
    .click();
  await expect(page).toHaveURL(new RegExp(`/destination/${last.zone_id}\\?`));
  await loadedImage(page.locator(".detail-photo .destination-visual"), last);
  expect(new URL(page.url()).searchParams.get("origine")).toBe("PAR");
  await page.reload();
  await loadedImage(page.locator(".detail-photo .destination-visual"), last);
  await page
    .getByRole("link", { name: "surftrips.fr — accueil", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/$/);
});
