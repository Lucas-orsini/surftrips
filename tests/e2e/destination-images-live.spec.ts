import { test, expect } from "@playwright/test";
import batch from "../../docs/destination-image-batch.json" with { type: "json" };
import secondBatch from "../../docs/destination-image-batch-02.json" with { type: "json" };

// Real PostgreSQL catalog, public Supabase objects and Next/Image responses.
// Only booking scripts are blocked so image checks do not depend on partners.
test.beforeEach(async ({ page }, info) => {
  await page.setExtraHTTPHeaders({
    "x-real-ip": `198.51.100.${70 + info.workerIndex}`,
  });
  await page.route("https://creator.expediagroup.com/**", (route) =>
    route.abort(),
  );
  await page.route("https://tpemd.com/**", (route) => route.abort());
});

test("Storage réel : photos publiées, refresh, ordre DOM et fallback", async ({
  page,
}, info) => {
  test.setTimeout(120_000);
  const imageFailures: number[] = [];
  page.on("response", (response) => {
    if (
      new URL(response.url()).pathname === "/_next/image" &&
      response.status() >= 400
    )
      imageFailures.push(response.status());
  });
  const hero = page.locator(".detail-photo .destination-visual");
  for (const entry of [...batch.images, ...secondBatch.images]) {
    const response = await page.goto(`/destination/${entry.zone_id}`);
    expect(response?.status()).toBe(200);
    await expect(hero).toHaveAttribute("data-image-state", "ready", {
      timeout: 20_000,
    });
    const img = hero.locator("img");
    await expect(img).toHaveAttribute(
      "alt",
      `Surf à ${entry.destination}, ${entry.country}`,
    );
    const source = new URL(
      new URL((await img.getAttribute("src"))!, page.url()).searchParams.get(
        "url",
      )!,
    );
    expect(source.protocol).toBe("https:");
    expect(source.pathname).toBe(
      `/storage/v1/object/public/destinations/${entry.storage_path}`,
    );
    expect(
      await img.evaluate((node: HTMLImageElement) => node.naturalWidth),
    ).toBeGreaterThan(0);
    await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(
      1,
    );
    expect(
      await page.evaluate(() => {
        const surf = document.querySelector("#surf")!;
        const flight = document.querySelector("#reservation")!;
        const hotel = document.querySelector("#hebergement")!;
        return (
          !!(
            surf.compareDocumentPosition(flight) &
            Node.DOCUMENT_POSITION_FOLLOWING
          ) &&
          !!(
            flight.compareDocumentPosition(hotel) &
            Node.DOCUMENT_POSITION_FOLLOWING
          )
        );
      }),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator(".detail-photo").screenshot({
      path: `test-results/published-${entry.zone_id}-${info.project.name}.png`,
      scale: "css",
    });
  }
  await page.reload();
  await expect(hero).toHaveAttribute("data-image-state", "ready");
  await page.goto("/destination/aguadilla");
  await expect(hero).toHaveAttribute("data-image-state", "fallback");
  await expect(hero.locator("img")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Aguadilla",
  );
  expect(imageFailures).toEqual([]);
});

test("Storage réel : landing, résultats partageables et navigation vers une photo", async ({
  page,
}, info) => {
  test.setTimeout(90_000);
  await page.goto("/");
  // The existing mobile design hides this decorative postcard. Its lazy image
  // should not be forced to download; visible destination cards are checked below.
  if (info.project.name === "mobile") {
    await expect(page.locator(".hero-postcard")).toBeHidden();
  } else {
    await expect(
      page.locator(".hero-postcard .destination-visual"),
    ).toHaveAttribute("data-image-state", "ready", { timeout: 15_000 });
  }
  const cards = page.locator(".destination-card");
  await expect(cards).toHaveCount(3);
  for (const card of await cards.all()) {
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator(".destination-visual")).toHaveAttribute(
      "data-image-state",
      "ready",
    );
    await expect(card.locator("img")).toHaveAttribute("loading", "lazy");
  }
  await page.locator("#destinations").screenshot({
    path: `test-results/published-landing-${info.project.name}.png`,
    scale: "css",
  });
  const day = new Date();
  day.setUTCDate(10);
  day.setUTCMonth(day.getUTCMonth() + 1);
  const dateDepart = day.toISOString().slice(0, 10);
  day.setUTCDate(20);
  const criteria = new URLSearchParams({
    niveau: "intermediaire",
    origine: "PAR",
    dateDepart,
    dateRetour: day.toISOString().slice(0, 10),
    region: "Portugal",
  });
  await page.goto(`/search?${criteria}`);
  const ericeira = page
    .locator(".destination-card")
    .filter({ has: page.locator('a[href^="/destination/ericeira?"]') });
  await ericeira.scrollIntoViewIfNeeded();
  await expect(ericeira.locator(".destination-visual")).toHaveAttribute(
    "data-image-state",
    "ready",
  );
  await ericeira.screenshot({
    path: `test-results/published-result-${info.project.name}.png`,
    scale: "css",
  });
  await ericeira.locator("h3 a").click();
  await expect(page).toHaveURL(/\/destination\/ericeira\?/);
  await expect(
    page.locator(".detail-photo .destination-visual"),
  ).toHaveAttribute("data-image-state", "ready");
  expect(new URL(page.url()).searchParams.get("origine")).toBe("PAR");
  expect(new URL(page.url()).searchParams.get("dateDepart")).toBe(dateDepart);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://surftrips.fr/destination/ericeira",
  );
  await page
    .getByRole("link", { name: "Revenir aux résultats", exact: true })
    .click();
  await expect(ericeira.locator(".destination-visual")).toHaveAttribute(
    "data-image-state",
    "ready",
  );

  // The new lot must also flow through the existing search cards, not only headers.
  criteria.set("region", "Australie");
  criteria.set("niveau", "expert");
  await page.goto(`/search?${criteria}`);
  for (const entry of secondBatch.images.filter(
    (e) => e.country === "Australie",
  )) {
    const card = page.locator(".destination-card").filter({
      has: page.locator(`a[href^="/destination/${entry.zone_id}?"]`),
    });
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator(".destination-visual")).toHaveAttribute(
      "data-image-state",
      "ready",
    );
    const img = card.locator("img");
    await expect(img).toHaveAttribute("loading", "lazy");
    const source = new URL(
      (await img.getAttribute("src"))!,
      page.url(),
    ).searchParams.get("url");
    expect(source).toContain(`/destinations/${entry.storage_path}`);
  }
  const byron = page.locator(
    '.destination-card h3 a[href^="/destination/byron-bay?"]',
  );
  await byron.click();
  await expect(page).toHaveURL(/\/destination\/byron-bay\?/);
  await expect(
    page.locator(".detail-photo .destination-visual"),
  ).toHaveAttribute("data-image-state", "ready");
  expect(new URL(page.url()).searchParams.get("origine")).toBe("PAR");
  expect(new URL(page.url()).searchParams.get("dateDepart")).toBe(dateDepart);
});
