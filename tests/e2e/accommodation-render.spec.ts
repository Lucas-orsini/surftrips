import { test, expect } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AccommodationContent } from "../../components/accommodation/AccommodationContent";
import type { Accommodation } from "../../lib/accommodation/types";

// Isolated rendering fixtures, never inserted into Supabase or served by the app.
// Labels describe test cases, not invented hotel identities; Booking URLs are isolated technical fixtures.
const recommendations: Accommodation[] = [0, 1, 2].map((index) => ({
  id: `00000000-0000-4000-8000-00000000000${index}`,
  zoneId: "ericeira",
  name: `Recommandation éditoriale ${index + 1} (test isolé)`,
  slug: `fixture-${index}`,
  type: "guesthouse",
  bookingUrl: `https://www.booking.com/hotel/pt/fixture-${index}.html`,
  priceCategory: index === 0 ? "mid" : undefined,
  featured: index === 0,
  displayOrder: index,
}));

test("recommandations rendues côté serveur : cartes, liens exacts, gamme et champs absents", async ({
  page,
}, info) => {
  await page.goto("/destination/ericeira");
  const styles = await page
    .locator('link[rel="stylesheet"]')
    .evaluateAll((links) =>
      links.map((link) => (link as HTMLLinkElement).href),
    );
  const markup = renderToStaticMarkup(
    createElement(
      "main",
      { className: "container" },
      createElement(AccommodationContent, {
        zoneId: "ericeira",
        name: "Ericeira",
        country: "Portugal",
        recommendations: { items: recommendations, status: "ready" },
        bookingEnabled: true,
        destinationAvailable: true,
        trip: "10–20 octobre 2026",
      }),
    ),
  );
  await page.setContent(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8">${styles.map((href) => `<link rel="stylesheet" href="${href}">`).join("")}</head><body>${markup}</body></html>`,
  );
  await expect(page.locator(".accommodation-card")).toHaveCount(3);
  await expect(page.locator(".accommodation-card img")).toHaveCount(0);
  await expect(page.locator(".accommodation-location")).toHaveCount(0);
  await expect(page.locator(".accommodation-distance")).toHaveCount(0);
  await expect(page.locator(".accommodation-price")).toContainText(
    "Gamme indicative, hors tarif actuel",
  );
  const links = page.locator(".accommodation-card a");
  await expect(page.locator(".accommodation-search-box a")).toHaveAttribute(
    "href",
    "/go/booking/destination/ericeira",
  );
  await expect(page.locator(".accommodation-search-box a")).toHaveAttribute(
    "rel",
    "sponsored noopener noreferrer",
  );
  await expect(page.locator(".accommodation-search-box a")).toHaveAttribute(
    "target",
    "_blank",
  );
  for (let index = 0; index < 3; index++) {
    await expect(links.nth(index)).toHaveAttribute(
      "href",
      `/go/booking/accommodation/${recommendations[index].id}`,
    );
    await expect(links.nth(index)).toHaveAttribute("target", "_blank");
    await expect(links.nth(index)).toHaveAttribute(
      "rel",
      "sponsored noopener noreferrer",
    );
  }
  for (const [width, columns] of [
    [1440, 3],
    [800, 2],
    [375, 1],
  ]) {
    await page.setViewportSize({ width, height: 950 });
    await expect(page.locator(".accommodation-grid")).toHaveCSS(
      "display",
      "grid",
    );
    const count = await page
      .locator(".accommodation-grid")
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
      );
    expect(count).toBe(columns);
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
  }
  await page.screenshot({
    path: `test-results/accommodation-cards-${info.project.name}.png`,
    fullPage: true,
  });
});

test("Booking : états sans URL, sans recommandations et sans configuration", async ({
  page,
}) => {
  for (const [items, bookingEnabled, destinationAvailable, linkCount] of [
    [recommendations, true, false, 3],
    [[], true, true, 1],
    [[], true, false, 0],
    [recommendations, false, true, 0],
    [
      recommendations.map((item) => ({ ...item, bookingUrl: undefined })),
      true,
      false,
      0,
    ],
  ] as const) {
    const markup = renderToStaticMarkup(
      createElement(AccommodationContent, {
        zoneId: "ericeira",
        name: "Ericeira",
        country: "Portugal",
        recommendations: { items: [...items], status: "ready" },
        bookingEnabled,
        destinationAvailable,
      }),
    );
    await page.setContent(markup);
    await expect(page.locator("a")).toHaveCount(linkCount);
    await expect(page.locator(".accommodation-card")).toHaveCount(items.length);
    await expect(page.locator("#hebergement")).not.toContainText(
      "Aucun hôtel disponible",
    );
    if (!items.length && !destinationAvailable)
      await expect(page.locator("#hebergement")).toContainText(
        "Nos adresses à Ericeira sont en préparation",
      );
    if (linkCount)
      await expect(page.locator(".booking-disclosure")).toBeVisible();
  }
});
