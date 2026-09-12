import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import batch from "../../docs/destination-image-batch.json" with { type: "json" };

const local = fileURLToPath(
  new URL("../../.local/destination-images/", import.meta.url),
);
test.skip(
  !existsSync(`${local}/catalog.json`),
  "La revue nécessite les photos et le catalogue local réel.",
);

test("lot Unsplash : dix heroes, cartes, landing, navigation et recadrages", async ({
  page,
}, info) => {
  test.setTimeout(120_000);
  await page.route("**/_next/image?**", (route) => {
    const source = new URL(route.request().url()).searchParams.get("url") || "";
    const entry = batch.images.find((image) =>
      source.endsWith(`/destinations/${image.storage_path}`),
    );
    if (entry)
      return route.fulfill({
        contentType: "image/webp",
        path: `${local}/${entry.storage_path}`,
      });
    if (source === "/images/hero.jpg")
      return route.fulfill({
        contentType: "image/jpeg",
        path: fileURLToPath(
          new URL("../../public/images/hero.jpg", import.meta.url),
        ),
      });
    return route.fulfill({ status: 404, body: "" });
  });
  const hero = page.locator(".detail-photo .destination-visual");
  const navigation = page.getByRole("navigation", {
    name: "Revue du lot de photos",
  });
  await page.goto(`/batch?zone=${batch.images[0].zone_id}`);
  for (const entry of batch.images) {
    await navigation
      .getByRole("link", { name: entry.destination, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`zone=${entry.zone_id}$`));
    await expect(hero).toHaveAttribute("data-image-state", "ready");
    await expect(hero.locator("img")).toHaveAttribute(
      "alt",
      `Surf à ${entry.destination}, ${entry.country}`,
    );
    expect(
      await hero
        .locator("img")
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    ).toBeGreaterThan(0);
    await expect(hero.locator("img")).toHaveAttribute(
      "src",
      new RegExp(encodeURIComponent(entry.storage_path)),
    );
    await page.locator(".detail-photo").screenshot({
      path: `test-results/images/batch-${entry.zone_id}-${info.project.name}.png`,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.reload();
  await expect(hero).toHaveAttribute("data-image-state", "ready");
  await navigation
    .getByRole("link", { name: "Cartes résultats", exact: true })
    .click();
  const cards = page.locator(".destination-card");
  await expect(cards).toHaveCount(10);
  for (const [index, card] of (await cards.all()).entries()) {
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator(".destination-visual")).toHaveAttribute(
      "data-image-state",
      "ready",
    );
    await expect(card.locator("img")).toHaveAttribute("loading", "lazy");
    await expect(card.locator("img")).toHaveAttribute(
      "src",
      new RegExp(encodeURIComponent(batch.images[index].storage_path)),
    );
    await card
      .locator(".destination-photo")
      .screenshot({
        path: `test-results/images/batch-card-${batch.images[index].zone_id}-${info.project.name}.png`,
      });
  }
  await page.screenshot({
    path: `test-results/images/batch-cards-${info.project.name}.png`,
    fullPage: info.project.name === "desktop",
  });
  await navigation.getByRole("link", { name: "Landing", exact: true }).click();
  const postcard = page.locator(".hero-postcard .destination-visual");
  await expect(postcard).toHaveAttribute("data-image-state", "ready");
  await page.locator(".hero").screenshot({
    path: `test-results/images/batch-landing-${info.project.name}.png`,
  });
  for (const card of await cards.all()) {
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator(".destination-visual")).toHaveAttribute(
      "data-image-state",
      "ready",
    );
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await navigation
    .getByRole("link", { name: "Fallback sans image", exact: true })
    .click();
  await expect(hero).toHaveAttribute("data-image-state", "fallback");
});
