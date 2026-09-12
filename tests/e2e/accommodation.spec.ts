import { test, expect, type Page } from "@playwright/test";
import {
  HOTELS_WIDGET_SCRIPT,
  HOTELS_WIDGET_ATTRIBUTES,
} from "../../lib/accommodation/widget";

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

async function simulateWidget(page: Page) {
  const calls: string[] = [];
  await page.route(HOTELS_WIDGET_SCRIPT, (route) => {
    calls.push(route.request().url());
    return route.fulfill({
      contentType: "text/javascript",
      body: `window.addEventListener('DOMContentLoaded',()=>{ const root=document.querySelector('.eg-widget'); const form=document.createElement('form'); form.style.height='400px'; const label=document.createElement('label'); label.textContent='Destination Hotels.com'; const input=document.createElement('input'); label.append(input); form.append(label); root.append(form); });`,
    });
  });
  await page.route("https://tpemd.com/**", (route) => route.abort());
  return calls;
}

async function expectWidget(page: Page, zoneId: string) {
  await page.locator(".hotels-widget").scrollIntoViewIfNeeded();
  await expect(page.locator(".hotels-widget")).toHaveAttribute(
    "data-state",
    "ready",
    { timeout: 12000 },
  );
  const widgetDocument = page.frameLocator(".hotels-widget-frame");
  await expect(widgetDocument.locator(".eg-widget")).toHaveCount(1);
  await expect(widgetDocument.locator("script.eg-widgets-script")).toHaveCount(
    1,
  );
  for (const [key, value] of Object.entries(HOTELS_WIDGET_ATTRIBUTES))
    await expect(widgetDocument.locator(".eg-widget")).toHaveAttribute(
      key,
      value,
    );
  await expect(widgetDocument.locator(".eg-widget")).toHaveAttribute(
    "data-pubref",
    `surftrips-${zoneId}`,
  );
  for (const key of ["data-destination", "data-checkin", "data-checkout"])
    await expect(widgetDocument.locator(".eg-widget")).not.toHaveAttribute(key);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

test("fiche directe sans recommandation : contenu serveur, ordre du parcours, chargement différé", async ({
  page,
  request,
}) => {
  const calls = await simulateWidget(page);
  const response = await request.get("/destination/ericeira");
  const html = await response.text();
  expect(html).toContain("Où dormir à");
  expect(html).not.toContain(HOTELS_WIDGET_SCRIPT);
  await page.goto("/destination/ericeira");
  await expect(page.locator("#hebergement")).toBeVisible();
  await expect(page.locator("#hebergement")).toContainText(
    "Trouve ton logement à Ericeira",
  );
  await expect(page.locator(".accommodation-card")).toHaveCount(0);
  await expect(page.locator("#hebergement")).not.toContainText(
    "Aucun hôtel disponible",
  );
  expect(calls).toHaveLength(0);
  expect(
    await page
      .locator("#surf")
      .evaluate(
        (el) =>
          !!(
            el.compareDocumentPosition(
              document.getElementById("reservation")!,
            ) & Node.DOCUMENT_POSITION_FOLLOWING
          ),
      ),
  ).toBe(true);
  expect(
    await page
      .locator("#reservation")
      .evaluate(
        (el) =>
          !!(
            el.compareDocumentPosition(
              document.getElementById("hebergement")!,
            ) & Node.DOCUMENT_POSITION_FOLLOWING
          ),
      ),
  ).toBe(true);
  await expectWidget(page, "ericeira");
  expect(calls).toHaveLength(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://surftrips.fr/destination/ericeira",
  );
});

test("navigation résultats → destination → autre destination : une instance et le bon Pubref", async ({
  page,
}) => {
  const calls = await simulateWidget(page);
  await page.goto("/");
  expect(calls).toHaveLength(0);
  await page.goto(`/search?${searchParams()}`);
  await expect(page.locator(".destination-card")).not.toHaveCount(0);
  expect(calls).toHaveLength(0);
  await page
    .locator('.destination-title-row a[href*="/destination/ericeira?"]')
    .click();
  await expectWidget(page, "ericeira");
  await expect(page.locator(".hotels-trip")).toContainText("Ton voyage");
  await expect(page.locator(".booking-route")).toContainText("PAR");
  await expect(page.locator(".booking-route")).toContainText("LIS");
  const flight = await page.locator("#reservation").boundingBox();
  const route = await page.locator(".booking-route").boundingBox();
  expect(route!.y).toBeGreaterThan(flight!.y);
  expect(route!.y + route!.height).toBeLessThan(flight!.y + flight!.height);
  expect(calls).toHaveLength(1);
  await page.getByRole("link", { name: "Revenir aux résultats" }).click();
  const other = page
    .locator('.destination-title-row a:not([href*="/destination/ericeira?"])')
    .first();
  const href = (await other.getAttribute("href"))!;
  const zoneId = new URL(href, page.url()).pathname.split("/").pop()!;
  await other.click();
  await expectWidget(page, zoneId);
  await expect(page.locator(".hotels-widget-frame")).toHaveCount(1);
  expect(calls).toHaveLength(2);
});

test("blocage Expedia : erreur lisible, nouvelle tentative et fiche utilisable", async ({
  page,
}) => {
  await page.route(HOTELS_WIDGET_SCRIPT, (route) => route.abort());
  await page.goto("/destination/ericeira");
  await page.locator(".hotels-widget").scrollIntoViewIfNeeded();
  await expect(page.locator(".hotels-widget")).toHaveAttribute(
    "data-state",
    "fallback",
    { timeout: 12000 },
  );
  await expect(page.locator("#hebergement")).toContainText(
    "Hotels.com n’a pas pu être chargé.",
  );
  await expect(page.locator(".spot-detail")).not.toHaveCount(0);
  await expect(page.locator("#reservation form")).toBeVisible();
  await simulateWidget(page);
  await page
    .getByRole("button", { name: "Réessayer le module Hotels.com" })
    .click();
  await expectWidget(page, "ericeira");
});

test("document du widget : entrée validée et exclusion SEO", async ({
  request,
}) => {
  const response = await request.get(
    "/widgets/hotels?pubref=surftrips-ericeira",
  );
  expect(response.status()).toBe(200);
  expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  for (const query of [
    "",
    "?pubref=surftrips-ericeira&pubref=surftrips-taghazout",
    "?pubref=%3Cscript%3E",
  ])
    expect((await request.get(`/widgets/hotels${query}`)).status()).toBe(400);
});
