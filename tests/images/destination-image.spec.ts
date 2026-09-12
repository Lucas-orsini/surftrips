import { test, expect } from "@playwright/test";
import { fileURLToPath } from "node:url";

test("photo optimisée, fallback absent/404 et retour après navigation Next.js", async ({
  page,
}, info) => {
  // Existing local photograph used only for isolated browser rendering, no Supabase writes.
  await page.route("**/_next/image?**", (route) => {
    const source = new URL(route.request().url()).searchParams.get("url") || "";
    return source.endsWith("missing.webp")
      ? route.fulfill({ status: 404, body: "" })
      : route.fulfill({
          contentType: "image/jpeg",
          path: fileURLToPath(
            new URL("../../public/images/ericeira.jpg", import.meta.url),
          ),
        });
  });
  await page.goto("/?image=present");
  const hero = page.locator(".detail-photo .destination-visual");
  const card = page.locator(".destination-card .destination-visual");
  await expect(hero).toHaveAttribute("data-image-state", "ready");
  await expect(hero.locator("img")).toHaveAttribute(
    "alt",
    "Surf à Ericeira, Portugal",
  );
  await expect(hero.locator("img")).toHaveAttribute("sizes", /calc\(100vw/);
  await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(1);
  await expect(card.locator("img")).toHaveAttribute("loading", "lazy");
  const originalSize = await page.locator(".detail-photo").boundingBox();
  await page.screenshot({
    path: `test-results/images/hero-${info.project.name}.png`,
  });
  for (const name of ["Sans image", "Image introuvable"]) {
    await page.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(
      name === "Sans image" ? /image=none/ : /image=broken/,
    );
    await expect(hero).toHaveAttribute("data-image-state", "fallback");
    await expect(hero.locator("img")).toHaveCount(0);
    await expect(hero.getByRole("img")).toHaveAccessibleName(
      name === "Sans image"
        ? "Surf à Taghazout, Maroc"
        : "Surf à Ericeira, Portugal",
    );
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveAttribute("data-image-state", "fallback");
    const size = await page.locator(".detail-photo").boundingBox();
    expect(size?.height).toBe(originalSize?.height);
    expect(size?.width).toBe(originalSize?.width);
    const widths = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  }
  await page.getByRole("link", { name: "Avec image", exact: true }).click();
  await expect(hero).toHaveAttribute("data-image-state", "ready");
  await page.reload();
  await expect(hero).toHaveAttribute("data-image-state", "ready");
});
