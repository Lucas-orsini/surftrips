import { test, expect } from "@playwright/test";

test("bannière : quatre largeurs, informations visibles, CLS et fallback identique", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "desktop",
    "Quatre largeurs explicitement vérifiées dans ce test.",
  );
  test.setTimeout(90_000);
  await page.route("https://creator.expediagroup.com/**", (route) =>
    route.abort(),
  );
  await page.route("https://tpemd.com/**", (route) => route.abort());
  await page.addInitScript(() => {
    Object.assign(window, { bannerCLS: 0, bannerShifts: [] });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
          sources?: {
            node?: HTMLElement;
            previousRect: DOMRectReadOnly;
            currentRect: DOMRectReadOnly;
          }[];
        };
        if (!shift.hadRecentInput) {
          (window as unknown as { bannerCLS: number }).bannerCLS += shift.value;
          (window as unknown as { bannerShifts: unknown[] }).bannerShifts.push({
            value: shift.value,
            sources: shift.sources?.map((s) => ({
              className: s.node?.className,
              beforeY: s.previousRect.y,
              afterY: s.currentRect.y,
            })),
          });
        }
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  const date = new Date();
  date.setUTCDate(10);
  date.setUTCMonth(date.getUTCMonth() + 1);
  const departure = date.toISOString().slice(0, 10);
  date.setUTCDate(20);
  const query = new URLSearchParams({
    niveau: "intermediaire",
    origine: "PAR",
    dateDepart: departure,
    dateRetour: date.toISOString().slice(0, 10),
  });
  for (const { width, height, bannerHeight } of [
    { width: 1440, height: 1000, bannerHeight: 340 },
    { width: 1280, height: 900, bannerHeight: 340 },
    { width: 768, height: 1024, bannerHeight: 280 },
    { width: 390, height: 844, bannerHeight: 220 },
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(`/destination/ericeira?${query}`);
    const banner = page.locator(
      ".detail-photo:not(.destination-hero-skeleton)",
    );
    await expect(banner.locator(".destination-visual")).toHaveAttribute(
      "data-image-state",
      "ready",
      { timeout: 15_000 },
    );
    await expect(banner).toBeVisible();
    await expect(page.locator(".destination-hero-skeleton")).toHaveCount(0);
    const box = (await banner.boundingBox())!;
    expect(box.height).toBe(bannerHeight);
    await expect(banner.locator("img")).toHaveCSS("object-fit", "cover");
    await expect(banner.locator("img")).toHaveCSS("object-position", "50% 65%");
    await expect(banner).toHaveCSS("border-radius", "12px");
    await expect(page.locator(".destination-overview")).toContainText(
      "Intermédiaire",
    );
    expect(
      (await page.locator(".destination-overview").boundingBox())!.y,
    ).toBeLessThan(box.y);
    expect((await page.locator("#surf").boundingBox())!.y).toBeLessThan(height);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(() => document.fonts.ready);
    const shifts = await page.evaluate(
      () => (window as unknown as { bannerShifts: unknown[] }).bannerShifts,
    );
    expect(
      await page.evaluate(
        () => (window as unknown as { bannerCLS: number }).bannerCLS,
      ),
      JSON.stringify(shifts),
    ).toBeLessThanOrEqual(0.01);
    await page.screenshot({
      path: `test-results/banner-${width}.png`,
      scale: "css",
    });
    await page.goto("/destination/aguadilla");
    await expect(banner.locator(".destination-visual")).toHaveAttribute(
      "data-image-state",
      "fallback",
    );
    await expect(banner).toBeVisible();
    await expect(page.locator(".destination-hero-skeleton")).toHaveCount(0);
    const fallback = (await banner.boundingBox())!;
    expect(fallback.height).toBe(box.height);
    expect(fallback.width).toBe(box.width);
    await page.screenshot({
      path: `test-results/banner-fallback-${width}.png`,
      scale: "css",
    });
  }
});
