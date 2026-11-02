import { test, expect } from "@playwright/test";
// Live read-only smoke check: no reservation, no payment, no mocked partner response.
test("Travelpayouts réel : préremplissage du widget et recherche complète Kiwi", async ({
  page,
}, info) => {
  test.setTimeout(60000);
  const day = new Date();
  day.setUTCDate(10);
  day.setUTCMonth(day.getUTCMonth() + 1);
  const departure = day.toISOString().slice(0, 10);
  day.setUTCDate(20);
  const returnDate = day.toISOString().slice(0, 10);
  await page.goto(
    `/destination/ericeira?origine=PAR&niveau=intermediaire&dateDepart=${departure}&dateRetour=${returnDate}`,
  );
  const frame = page.frameLocator(".booking-frame");
  const script = frame.locator("script[data-from]");
  await expect(script).toHaveAttribute("data-from", "PAR", { timeout: 15000 });
  await expect(script).toHaveAttribute("data-to", "LIS");
  await expect(script).toHaveAttribute("data-departure", departure);
  await expect(script).toHaveAttribute("data-return", returnDate);
  await expect(script).toHaveAttribute("data-lang", "fr");
  await expect(script).toHaveAttribute("data-currency", "eur");
  await expect(script).toHaveAttribute("data-affilid", "travelpayoutswidget");
  const widgetUrl = new URL(
    (await frame
      .locator('script[src^="https://tpemd.com/content"]')
      .getAttribute("src"))!,
  );
  expect(widgetUrl.searchParams.get("powered_by")).toBe("false");
  expect(widgetUrl.searchParams.get("trs")).toBeTruthy();
  expect(widgetUrl.searchParams.get("shmarker")).toBeTruthy();
  expect(await script.getAttribute("data-sub1")).toContain(
    `-${widgetUrl.searchParams.get("shmarker")!.split(".")[0]}`,
  );
  // The official script itself disables its referral link. Inspect its own
  // display property, even when the outer frame is hidden by the fallback.
  await expect(frame.locator(".tp_powered_by")).toHaveCSS("display", "none");
  await expect(frame.locator("#widget-holder")).toHaveCount(1);
  await page.locator(".flight-widget").scrollIntoViewIfNeeded();
  await expect(page.locator(".flight-widget")).toHaveAttribute(
    "data-state",
    /ready|fallback/,
    { timeout: 10000 },
  );
  await page.locator("#reservation").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `test-results/live-travel-${info.project.name}.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  const options = page.getByText("Autres options de réservation", {
    exact: true,
  });
  if (await options.isVisible()) await options.click();
  const searchUrl = new URL(
    (await page
      .getByRole("link", { name: /Rechercher sur Kiwi.com/ })
      .getAttribute("href"))!,
  );
  expect(searchUrl.origin).toBe("https://c111.travelpayouts.com");
  expect(searchUrl.searchParams.get("shmarker")).toBe(
    widgetUrl.searchParams.get("shmarker"),
  );
  info.annotations.push({
    type: "live-widget-state",
    description: (await page
      .locator(".flight-widget")
      .getAttribute("data-state"))!,
  });
  const [search] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByRole("link", { name: /Rechercher sur Kiwi.com/ }).click(),
  ]);
  // Follow the real affiliate redirect, not just the URL we constructed.
  // Inventory and prices change: assert the trip on Kiwi, never a quoted fare.
  await expect(search).toHaveURL(
    (url) =>
      url.hostname === "www.kiwi.com" &&
      url.pathname.includes("/search/results/") &&
      url.pathname.includes("paris") &&
      url.pathname.includes("lisbonne") &&
      url.pathname.includes(departure) &&
      url.pathname.includes(returnDate),
    { timeout: 30000 },
  );
  await search.close();
});
