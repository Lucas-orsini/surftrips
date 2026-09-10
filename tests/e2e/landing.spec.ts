import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("landing : images, sémantique, accessibilité et absence de débordement", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Le bon spot.Au bon moment.",
  );
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".hero-image")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".hero-image")
        .evaluate((img) => (img as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.screenshot({
    path: `test-results/hero-${testInfo.project.name}.png`,
    scale: "css",
  });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  for (const section of [
    "#les-spots",
    "#destinations",
    "#comment-ca-marche",
    ".map-section",
    "#a-propos",
    ".inspiration-section",
    ".footer",
  ]) {
    await page.locator(section).scrollIntoViewIfNeeded();
  }
  await expect
    .poll(() =>
      page
        .locator(".inspiration-section img")
        .evaluate((img) => (img as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: `test-results/landing-${testInfo.project.name}.png`,
    fullPage: true,
    scale: "css",
  });
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    accessibility.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => ({
        target: node.target,
        summary: node.failureSummary,
      })),
    })),
  ).toEqual([]);
  expect(errors).toEqual([]);
  if (testInfo.project.name === "desktop") {
    for (const width of [320, 768, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("body *")]
          .filter(
            (element) =>
              element instanceof HTMLElement &&
              element.getBoundingClientRect().right >
                document.documentElement.clientWidth + 1 &&
              !element.closest(".destinations-grid"),
          )
          .map((element) => ({
            className: element.className,
            right: element.getBoundingClientRect().right,
            width: element.getBoundingClientRect().width,
          }))
          .slice(0, 12),
      );
      if (overflow.length) console.log({ viewport: width, overflow });
      await expect
        .poll(
          () =>
            page.evaluate(
              () =>
                document.documentElement.scrollWidth <=
                document.documentElement.clientWidth,
            ),
          { message: `Aucun débordement à ${width}px` },
        )
        .toBe(true);
      await page.getByRole("button", { name: "Niveau Intermédiaire" }).click();
      await expect(page.getByRole("radio", { name: /Expert/ })).toBeVisible();
      await page.keyboard.press("Escape");
    }
  }
});

const tripDates = () => {
  const date = new Date();
  date.setUTCDate(10);
  date.setUTCMonth(date.getUTCMonth() + 1);
  const departure = date.toISOString().slice(0, 10);
  date.setUTCDate(20);
  return { departure, returnDate: date.toISOString().slice(0, 10) };
};
const params = () => {
  const d = tripDates();
  return new URLSearchParams({
    niveau: "intermediaire",
    origine: "PAR",
    dateDepart: d.departure,
    dateRetour: d.returnDate,
  }).toString();
};
test.beforeEach(async ({ page }, info) => {
  await page.setExtraHTTPHeaders({
    "x-real-ip": `198.51.100.${info.workerIndex + 10}`,
  });
});

test("Supabase réel : Intermédiaire Paris Monde entier → destination → fallback", async ({
  page,
}, info) => {
  const dates = tripDates();
  const thirdParty: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("tpemd.com")) thirdParty.push(request.url());
  });
  await page.route("https://tpemd.com/**", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Dates Choisir mes dates" }).click();
  await page
    .getByLabel("Date de départ", { exact: true })
    .fill(dates.departure);
  await page
    .getByLabel("Date de retour", { exact: true })
    .fill(dates.returnDate);
  await page.getByRole("button", { name: "Valider mes dates" }).click();
  await page.getByRole("button", { name: "Trouver où surfer" }).click();
  await expect(page).toHaveURL(/\/recherche\?niveau=intermediaire&origine=PAR/);
  await expect(page.locator(".destination-card")).toHaveCount(12);
  expect(thirdParty).toEqual([]);
  const countries = await page.locator(".country-label").allTextContents();
  for (const country of new Set(countries))
    expect(countries.filter((c) => c === country).length).toBeLessThanOrEqual(
      2,
    );
  await expect(page.locator(".season-badge").first()).toContainText(
    "Bonne période",
  );
  await page.screenshot({
    path: `test-results/results-${info.project.name}.png`,
    fullPage: true,
  });
  const link = page.locator(".destination-title-row h3 a").first();
  const name = await link.innerText();
  await link.click();
  await expect(page.locator("h1")).toContainText(name);
  await expect(page).toHaveURL(
    /\/destination\/[^?]+\?niveau=intermediaire&origine=PAR/,
  );
  await expect(page.locator(".spot-detail")).not.toHaveCount(0);
  expect(
    await page.locator(".spot-heading .level-tag").allTextContents(),
  ).not.toContain("Expert");
  await expect(page.locator(".flight-widget")).toHaveAttribute(
    "data-state",
    "fallback",
    { timeout: 12000 },
  );
  await expect(
    page.getByRole("link", { name: /Essayer aussi sur KAYAK/ }),
  ).toHaveAttribute(
    "href",
    new RegExp(`PAR-[A-Z]{3}/${dates.departure}/${dates.returnDate}`),
  );
  expect(thirdParty.length).toBe(1);
  const url = new URL(thirdParty[0]);
  expect(url.searchParams.get("from_name")).toBe("PAR");
  expect(url.searchParams.get("departure")).toBe(dates.departure);
  expect(url.searchParams.get("return")).toBe(dates.returnDate);
  expect(url.searchParams.has("origin")).toBe(false);
  expect(await page.locator(".booking-frame").count()).toBe(1);
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/destination-${info.project.name}.png`,
    fullPage: true,
  });
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    accessibility.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});

test("arrivée directe indexable, mini formulaire et remontage du widget", async ({
  page,
}) => {
  // Only the third party is simulated. Destinations and spots always come from Supabase.
  const calls: string[] = [];
  await page.route("https://tpemd.com/**", async (route) => {
    calls.push(route.request().url());
    await route.fulfill({
      contentType: "text/javascript",
      body: `const holder=document.createElement('div');holder.id='widget-holder';const form=document.createElement('form');const input=document.createElement('input');input.setAttribute('aria-label','Vol partenaire');form.append(input);holder.append(form);document.body.append(holder);`,
    });
  });
  await page.goto("/destination/ericeira");
  await expect(page).toHaveTitle(/Surf à Ericeira : spots, saison et niveau/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://surftrips.fr/destination/ericeira",
  );
  expect(calls).toEqual([]);
  await expect(page.locator(".booking-frame")).toHaveCount(0);
  await expect(page.locator(".spot-detail")).not.toHaveCount(0);
  const dates = tripDates();
  await page.getByLabel("Date aller", { exact: true }).fill(dates.departure);
  await page.getByLabel("Date retour", { exact: true }).fill(dates.returnDate);
  await page
    .getByRole("button", { name: "Voir les vols", exact: true })
    .click();
  await expect(page.locator(".flight-widget")).toHaveAttribute(
    "data-state",
    "ready",
  );
  await expect(page.locator(".booking-frame")).toHaveCount(1);
  expect(calls.length).toBe(1);
  await page
    .getByRole("combobox", { name: "Aéroport de départ", exact: true })
    .selectOption("GVA");
  await page.getByRole("button", { name: "Actualiser mon vol" }).click();
  await expect(page.locator(".flight-widget")).toHaveAttribute(
    "data-state",
    "ready",
  );
  expect(calls.length).toBe(2);
  expect(new URL(calls[1]).searchParams.get("from_name")).toBe("GVA");
  expect(new URL(calls[1]).searchParams.get("to_name")).toBe("LIS");
  const searchLink = new URL(
    (await page
      .getByRole("link", { name: /Rechercher sur Kiwi.com/ })
      .getAttribute("href"))!,
  );
  const search = new URL(
    searchLink.searchParams.get("custom_url") || searchLink,
  );
  expect(search.searchParams.get("from")).toBe("GVA");
  expect(search.searchParams.get("to")).toBe("LIS");
  expect(search.searchParams.get("departure")).toBe(dates.departure);
  expect(search.searchParams.get("return")).toBe(dates.returnDate);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://surftrips.fr/destination/ericeira",
  );
  await expect(
    page.locator('.related-zones a[href*="/destination/ericeira"]'),
  ).toHaveCount(0);
});

test("validation serveur, pays réel, clavier et absence de faux résultats", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Trouver où surfer" }).click();
  await expect(page.locator(".form-error")).toContainText("Choisis une date");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Dates Choisir mes dates" }),
  ).toBeFocused();
  await page.goto(`/recherche?${params()}&region=Atlantide`);
  await expect(page.locator(".form-error")).toContainText("Choisis un pays");
  await expect(page.locator(".destination-card")).toHaveCount(0);
  await page.goto(
    `/recherche?${params().replace("origine=PAR", "origine=LIS")}`,
  );
  await expect(page.locator(".form-error")).toContainText("aéroport de départ");
  await page.goto(`/search?${params()}&region=Portugal`);
  await expect(page.locator(".destination-card")).not.toHaveCount(0);
  for (const country of await page.locator(".country-label").allTextContents())
    expect(country).toBe("Portugal");
  await page.goto("/destination/inconnue");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Cette vague",
  );
});

test("script silencieux : secours après cinq secondes", async ({ page }) => {
  await page.route("https://tpemd.com/**", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: "/* No rendered widget */",
    }),
  );
  await page.goto(`/destination/ericeira?${params()}`);
  await page.locator(".flight-widget").scrollIntoViewIfNeeded();
  await expect(page.locator(".flight-widget")).toHaveAttribute(
    "data-state",
    "loading",
  );
  await expect(page.locator(".flight-widget")).toHaveAttribute(
    "data-state",
    "fallback",
    { timeout: 8000 },
  );
  await expect(
    page.getByRole("link", { name: /Rechercher sur Kiwi.com/ }),
  ).toBeVisible();
});

test("HTTP 429 au-delà de trente requêtes, quota commun aux deux routes", async ({
  request,
}, info) => {
  const ip =
    info.project.name === "desktop" ? "198.51.100.200" : "198.51.100.201";
  for (let i = 0; i < 30; i++) {
    const response = await request.get(i % 2 ? "/search" : "/recherche", {
      headers: { "x-real-ip": ip, "x-forwarded-for": `192.0.2.${i}` },
    });
    expect(response.status()).toBe(200);
  }
  const limited = await request.get("/search", {
    headers: { "x-real-ip": ip, "x-forwarded-for": "192.0.2.99" },
  });
  expect(limited.status()).toBe(429);
  expect(Number(limited.headers()["retry-after"])).toBeGreaterThan(0);
  expect(await limited.text()).toContain("Réessaie dans une minute");
});

test("iframe partenaire vide : un événement load ne suffit pas", async ({
  page,
}) => {
  await page.route("https://tpemd.com/**", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `const holder=document.createElement('div');holder.id='widget-holder';const frame=document.createElement('iframe');frame.id='single-widget';frame.src='about:blank';frame.height='300';holder.append(frame);document.body.append(holder);`,
    }),
  );
  await page.goto(`/destination/ericeira?${params()}`);
  await page.locator(".flight-widget").scrollIntoViewIfNeeded();
  await expect(page.locator(".flight-widget")).toHaveAttribute(
    "data-state",
    "loading",
  );
  await expect(page.locator(".flight-widget")).toHaveAttribute(
    "data-state",
    "fallback",
    { timeout: 8000 },
  );
});
