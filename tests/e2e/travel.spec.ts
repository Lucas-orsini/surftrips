import { test, expect } from "@playwright/test";

function tripQuery(origin = "PAR") {
  const day = new Date();
  day.setUTCDate(10);
  day.setUTCMonth(day.getUTCMonth() + 1);
  const dateDepart = day.toISOString().slice(0, 10);
  day.setUTCDate(20);
  return new URLSearchParams({
    origine: origin,
    niveau: "intermediaire",
    dateDepart,
    dateRetour: day.toISOString().slice(0, 10),
  });
}

test("widget chargé sans offre : la recherche Kiwi complète conserve le voyage", async ({
  page,
}) => {
  // Reproduces the actual partner no-offers screen and its homepage link.
  // Only third-party responses are simulated; the zone comes from Supabase.
  await page.route("https://tpemd.com/**", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `const holder=document.createElement('div');holder.id='widget-holder';const frame=document.createElement('iframe');frame.id='single-widget';frame.src='https://widgets.kiwi.com/single';frame.height='300';holder.append(frame);document.body.append(holder);`,
    }),
  );
  await page.route("https://widgets.kiwi.com/single", (route) =>
    route.fulfill({
      contentType: "text/html; charset=utf-8",
      body: `<!doctype html><html lang="fr"><body><p>Aucun voyage trouvé.</p><a href="https://kiwi.com/">Kiwi.com</a><script>parent.postMessage({loaded:true,iframeId:'single-widget'},'*')</script></body></html>`,
    }),
  );
  const query = tripQuery();
  await page.goto(`/destination/ericeira?${query}`);
  await page.locator(".flight-widget").scrollIntoViewIfNeeded();
  await expect(page.locator(".flight-widget")).toHaveAttribute(
    "data-state",
    "ready",
  );
  await expect(page.locator(".booking-frame")).toHaveCount(1);
  await expect(
    page
      .frameLocator(".booking-frame")
      .frameLocator("iframe")
      .getByText("Aucun voyage trouvé."),
  ).toBeVisible();
  const searchLink = page.getByRole("link", {
    name: /Rechercher sur Kiwi.com/,
  });
  await expect(searchLink).toBeVisible();
  const href = new URL((await searchLink.getAttribute("href"))!);
  const search = new URL(href.searchParams.get("custom_url") || href);
  expect(search.origin).toBe("https://www.kiwi.com");
  expect(search.pathname).toBe("/deep");
  expect(search.searchParams.get("from")).toBe("PAR");
  expect(search.searchParams.get("to")).toBe("LIS");
  expect(search.searchParams.get("departure")).toBe(query.get("dateDepart"));
  expect(search.searchParams.get("return")).toBe(query.get("dateRetour"));
  await expect(
    page.getByRole("link", { name: /Essayer aussi sur KAYAK/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("même aéroport : ne pas envoyer une recherche impossible à Kiwi", async ({
  page,
}) => {
  const widgetCalls: string[] = [];
  page.on("request", (request) => {
    if (request.url().startsWith("https://tpemd.com/"))
      widgetCalls.push(request.url());
  });
  await page.goto(`/destination/biarritz?${tripQuery("BIQ")}`);
  await expect(page.locator("#reservation")).toContainText(
    "Ton aéroport de départ est aussi celui de cette destination.",
  );
  await expect(page.locator(".booking-frame")).toHaveCount(0);
  expect(widgetCalls).toEqual([]);
});
