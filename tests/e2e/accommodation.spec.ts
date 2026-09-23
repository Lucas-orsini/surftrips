import { test, expect } from "@playwright/test";

function searchParams() {
  const day = new Date();
  day.setUTCDate(10);
  day.setUTCMonth(day.getUTCMonth() + 1);
  const dateDepart = day.toISOString().slice(0, 10);
  day.setUTCDate(20);
  return new URLSearchParams({
    niveau: "intermediaire",
    origine: "PAR",
    dateDepart,
    dateRetour: day.toISOString().slice(0, 10),
    region: "Portugal",
  });
}

test("Booking : fiche directe, contenu serveur, ordre surf → vol → logement, aucun Expedia", async ({
  page,
  request,
}) => {
  const expedia: string[] = [];
  page.on("request", (req) => {
    if (/expedia|hotels\.com|hotels-widget/i.test(req.url()))
      expedia.push(req.url());
  });
  const response = await request.get("/destination/ericeira");
  expect(await response.text()).not.toMatch(
    /Hotels\.com|eg-widgets\.js|data-pubref|BOOKING_CJ_EVERGREEN_URL/,
  );
  await page.goto("/destination/ericeira");
  await expect(page.locator("#hebergement")).toContainText("Ericeira");
  await expect(
    page.locator("#hebergement iframe, #hebergement script"),
  ).toHaveCount(0);
  for (const [before, after] of [
    ["surf", "reservation"],
    ["reservation", "hebergement"],
  ]) {
    expect(
      await page
        .locator(`#${before}`)
        .evaluate(
          (el, next) =>
            Boolean(
              el.compareDocumentPosition(document.getElementById(next)!) &
              Node.DOCUMENT_POSITION_FOLLOWING,
            ),
          after,
        ),
    ).toBe(true);
  }
  await page.locator("#hebergement").scrollIntoViewIfNeeded();
  expect(expedia).toEqual([]);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://surftrips.fr/destination/ericeira",
  );
});

test("Booking : navigation résultats → destination → autre destination, dates et vol conservés", async ({
  page,
}) => {
  await page.route("https://tpemd.com/**", (route) => route.abort());
  await page.goto(`/search?${searchParams()}`);
  await expect(page.locator(".destination-card")).not.toHaveCount(0);
  await page
    .locator('.destination-title-row a[href*="/destination/ericeira?"]')
    .click();
  await expect(page.locator(".accommodation-trip")).toContainText("Ton voyage");
  await expect(page.locator(".booking-route")).toContainText("PAR");
  await expect(page.locator(".booking-route")).toContainText("LIS");
  await expect(page.locator("#hebergement")).not.toContainText("Hotels.com");
  await page.getByRole("link", { name: "Revenir aux résultats" }).click();
  await page
    .locator('.destination-title-row a:not([href*="/destination/ericeira?"])')
    .first()
    .click();
  await expect(page.locator("#hebergement")).toBeVisible();
  await expect(page.locator(".accommodation-trip")).toContainText("Ton voyage");
  await expect(page.locator("#hebergement iframe")).toHaveCount(0);
});

test("Booking : routes sans URL arbitraire, erreur lisible et document Expedia retiré", async ({
  request,
}) => {
  for (const path of [
    "/go/booking/accommodation/not-a-uuid?url=https://evil.example&sid=private",
    "/go/booking/destination/not-a-zone?url=https://evil.example&sid=private",
  ]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect([400, 404]).toContain(response.status());
    expect(response.headers().location).toBeUndefined();
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow");
    expect(await response.text()).not.toMatch(
      /SELECT|postgres|stack|evil\.example/,
    );
  }
  expect(
    (await request.get("/widgets/hotels?pubref=surftrips-ericeira")).status(),
  ).toBe(404);
  expect((await request.get("/hotels-widget-bridge.js")).status()).toBe(404);
});

test("Booking : section responsive à 1440, 1280, 768 et 390 px", async ({
  page,
}, info) => {
  await page.goto("/destination/ericeira");
  for (const width of [1440, 1280, 768, 390]) {
    await page.setViewportSize({ width, height: 950 });
    await page.locator("#hebergement").scrollIntoViewIfNeeded();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    await expect(page.locator("#hebergement")).toBeVisible();
    if (width === 1440 || width === 390)
      await page
        .locator("#hebergement")
        .screenshot({
          path: `test-results/booking-${info.project.name}-${width}.png`,
        });
  }
});
