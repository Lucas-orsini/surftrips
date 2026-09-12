import { test, expect } from "@playwright/test";

test("Hotels.com réel : widget utilisable à 575 et 375 px", async ({
  page,
}, info) => {
  test.setTimeout(60000);
  await page.goto("/destination/ericeira");
  await page.locator(".hotels-widget").scrollIntoViewIfNeeded();
  await expect(page.locator(".hotels-widget")).toHaveAttribute(
    "data-state",
    "ready",
    { timeout: 20000 },
  );
  // Geometry only. Do not read or extract business data from Expedia's widget.
  const frame = page.frameLocator(".hotels-widget-frame");
  await expect(frame.locator(".eg-widget-frame")).toBeVisible();
  expect(
    (await page.locator(".hotels-widget-frame").boundingBox())!.width,
  ).toBeLessThanOrEqual(575);
  for (const width of [575, 375, 320]) {
    await page.setViewportSize({ width, height: 950 });
    await page.locator(".hotels-widget").scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    await expect(frame.locator(".eg-widget-frame")).toBeVisible();
    await expect
      .poll(async () => {
        const outer = await page.locator(".hotels-widget-frame").boundingBox();
        const inner = await frame.locator(".eg-widget-frame").boundingBox();
        return (
          !!outer &&
          !!inner &&
          outer.height >= inner.height &&
          outer.width >= inner.width
        );
      })
      .toBe(true);
    // Allow the provider's debounced viewport resize to settle for screenshots.
    await page.waitForTimeout(600);
    await page.locator(".hotels-search-panel").screenshot({
      path: `test-results/hotels-${info.project.name}-${width}.png`,
    });
  }
});
