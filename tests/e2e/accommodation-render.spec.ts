import { test, expect } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AccommodationCard } from "../../components/accommodation/AccommodationCard";
import { HotelsSearchWidget } from "../../components/accommodation/HotelsSearchWidget";
import type { Accommodation } from "../../lib/accommodation/types";

// Isolated rendering fixtures, never inserted into Supabase or served by the app.
// Labels describe test cases, not invented hotel identities; supplied URLs use example.com.
const recommendations: Accommodation[] = [0, 1, 2].map((index) => ({
  id: `fixture-${index}`,
  zoneId: "ericeira",
  name: `Recommandation éditoriale ${index + 1} (test isolé)`,
  slug: `fixture-${index}`,
  type: "guesthouse",
  affiliateUrl: `https://example.com/provided-link-${index}?tracking=unchanged`,
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
      createElement("h2", null, "Où dormir à Ericeira ?"),
      createElement(
        "div",
        { className: "accommodation-grid" },
        ...recommendations.map((accommodation) =>
          createElement(AccommodationCard, {
            key: accommodation.id,
            accommodation,
          }),
        ),
      ),
      createElement(HotelsSearchWidget, {
        pubref: "surftrips-ericeira",
        fallbackUrl:
          "https://example.com/supplied-general-link?tracking=unchanged",
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
  await expect(page.locator(".hotels-fallback-link")).toHaveAttribute(
    "href",
    "https://example.com/supplied-general-link?tracking=unchanged",
  );
  await expect(page.locator(".hotels-fallback-link")).toHaveAttribute(
    "rel",
    "sponsored noopener noreferrer",
  );
  await expect(page.locator(".hotels-fallback-link")).toHaveAttribute(
    "target",
    "_blank",
  );
  for (let index = 0; index < 3; index++) {
    await expect(links.nth(index)).toHaveAttribute(
      "href",
      recommendations[index].affiliateUrl,
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
