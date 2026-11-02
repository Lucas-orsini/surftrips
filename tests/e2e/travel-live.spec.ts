import { test, expect } from "@playwright/test";
// Live read-only smoke check: real scripts and redirect, no reservation/payment.
test("Travelpayouts réel : préremplissage du widget et recherche complète Kiwi", async ({
  page,
}, info) => {
  test.setTimeout(60000);
  // Isolate this real search from the other browser tests' search quota.
  await page.setExtraHTTPHeaders({
    "x-real-ip":
      info.project.name === "desktop" ? "198.51.100.80" : "198.51.100.81",
  });
  const day = new Date();
  day.setUTCDate(10);
  day.setUTCMonth(day.getUTCMonth() + 1);
  const departure = day.toISOString().slice(0, 10);
  day.setUTCDate(20);
  const returnDate = day.toISOString().slice(0, 10);
  const kiwiStatuses: number[] = [];
  page.on("response", (response) => {
    if (
      new URL(response.url()).hostname === "widgets.kiwi.com" &&
      new URL(response.url()).pathname === "/single"
    )
      kiwiStatuses.push(response.status());
  });
  await page.goto(
    `/recherche?origine=PAR&niveau=intermediaire&region=Portugal&dateDepart=${departure}&dateRetour=${returnDate}`,
  );
  await page
    .locator('.destination-title-row a[href*="/destination/ericeira?"]')
    .click();
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
  await expect(
    page.locator("#reservation details, #reservation summary"),
  ).toHaveCount(0);
  const liveState = (await page
    .locator(".flight-widget")
    .getAttribute("data-state"))!;
  info.annotations.push({
    type: "live-widget-state",
    description: `${liveState}; Kiwi HTTP ${kiwiStatuses.join(", ")}`,
  });
  console.log({ project: info.project.name, liveState, kiwiStatuses });
  if (liveState === "ready") {
    await expect(page.locator(".flight-widget > *")).toHaveCount(1);
    // Exercise the real fallback link even when the live widget succeeds.
    await page.route("https://tpemd.com/**", (route) => route.abort());
    await page.reload();
    await page.locator(".flight-widget").scrollIntoViewIfNeeded();
    await expect(page.locator(".flight-widget")).toHaveAttribute(
      "data-state",
      "fallback",
    );
  }
  const searchUrl = new URL(
    (await page
      .getByRole("link", { name: /Voir les vols disponibles/ })
      .getAttribute("href"))!,
  );
  expect(searchUrl.origin).toBe("https://c111.travelpayouts.com");
  expect(searchUrl.searchParams.get("shmarker")).toBe(
    widgetUrl.searchParams.get("shmarker"),
  );
  const [search] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByRole("link", { name: /Voir les vols disponibles/ }).click(),
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
