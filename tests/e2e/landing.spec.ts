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

test("recherche complète : niveau, aéroport, dates, pays et destination", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Niveau Intermédiaire" }).click();
  await page.getByRole("radio", { name: /Débutant/ }).click();
  await expect(
    page.getByRole("button", { name: "Niveau Débutant" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Départ Paris — PAR" }).click();
  await page.getByRole("searchbox").fill("bordeaux");
  await page.getByRole("button", { name: /Bordeaux Mérignac BOD/ }).click();
  await page.getByRole("button", { name: "Dates Choisir mes dates" }).click();
  await page.getByLabel("Date de départ", { exact: true }).fill("2027-09-10");
  await page.getByLabel("Date de retour", { exact: true }).fill("2027-09-24");
  await page.getByRole("button", { name: "Valider mes dates" }).click();
  await page.getByRole("button", { name: "Destination Monde entier" }).click();
  await page.getByRole("button", { name: "Portugal", exact: true }).click();
  await page.getByRole("button", { name: "Trouver où surfer" }).click();
  await expect(page).toHaveURL(/\/recherche\?/);
  await expect(
    page.getByRole("heading", { name: "1 destination à explorer" }),
  ).toBeVisible();
  await expect(page.locator(".destination-card")).toHaveCount(1);
  await expect(page.locator(".match-reasons")).toContainText(
    "1 exemple de spot adapté",
  );
  await page.getByRole("link", { name: "Ericeira", exact: true }).click();
  await expect(page).toHaveURL(/\/destination\/ericeira/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Ericeira",
  );
});

test("validation des dates, fermeture au clavier, recherche vide et carte tactile", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Trouver où surfer" }).click();
  await expect(page.locator(".form-error")).toContainText("Choisis une date");
  await expect(
    page.getByRole("button", { name: "Valider mes dates" }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Dates Choisir mes dates" }),
  ).toBeFocused();
  await page
    .getByRole("group", { name: "Choisir une escale sur la carte" })
    .getByRole("button", { name: "Canggu" })
    .click();
  await expect(page.locator(".itinerary")).toContainText("Denpasar");
  await expect(page.getByRole("link", { name: "Voir Canggu" })).toBeVisible();
  await page.goto(
    "/recherche?level=Expert&airport=PAR&departure=2027-09-10&returnDate=2027-09-24&destination=Atlantide",
  );
  await expect(
    page.getByRole("heading", { name: "Un horizon un peu plus large ?" }),
  ).toBeVisible();
});

test("navigation mobile et métadonnées des pages destination", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await expect(
      page.getByRole("navigation", { name: "Navigation mobile" }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Navigation mobile" })
      .getByRole("link", { name: "Destinations", exact: true })
      .click();
  } else {
    await page
      .getByRole("navigation", { name: "Navigation principale" })
      .getByRole("link", { name: "Destinations", exact: true })
      .click();
  }
  await expect(page).toHaveURL(/\/destinations$/);
  await page.goto("/destination/canggu");
  await expect(page).toHaveTitle(/Surfer à Canggu/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://surftrips.fr/destination/canggu",
  );
  await expect(page.locator("h1")).toHaveCount(1);
  const response = await page.goto("/destination/inconnue");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Cette vague",
  );
});
