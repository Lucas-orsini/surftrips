import { test, expect, type Page } from "@playwright/test";

function tripUrl() {
  const day = new Date();
  day.setUTCDate(10);
  day.setUTCMonth(day.getUTCMonth() + 1);
  const departure = day.toISOString().slice(0, 10);
  day.setUTCDate(20);
  return `/destination/ericeira?origine=PAR&niveau=intermediaire&dateDepart=${departure}&dateRetour=${day.toISOString().slice(0, 10)}`;
}

// Only partner responses are simulated. The simulated partner, like Kiwi,
// sizes its own iframe via postMessage. Surftrips must follow it both ways.
async function partner(page: Page) {
  await page.route("https://tpemd.com/**", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `
        const holder = document.createElement('div');
        holder.id = 'widget-holder';
        const child = document.createElement('iframe');
        child.id = 'single-widget';
        child.src = 'https://widgets.kiwi.com/single';
        child.style = 'width:100%;height:200px;border:0';
        holder.append(child);
        document.currentScript.after(holder);
        window.addEventListener('message', event => {
          if (event.source === child.contentWindow && event.origin === 'https://widgets.kiwi.com' && Number.isFinite(event.data.height)) {
            child.style.height = event.data.height + 'px';
          }
        });`,
    }),
  );
  await page.route("https://widgets.kiwi.com/single", (route) =>
    route.fulfill({
      contentType: "text/html; charset=utf-8",
      body: `<!doctype html><html lang="fr"><style>body{margin:0}main{height:200px}</style><body><main>
        <p>Réponse tierce simulée</p>
        <button onclick="resize(680)">Développer</button>
        <button onclick="resize(180)">Réduire</button>
        </main><script>
          function resize(height) {
            document.querySelector('main').style.height = height + 'px';
            parent.postMessage({iframeId:'single-widget', height}, '*');
          }
          parent.postMessage({iframeId:'single-widget',loaded:true}, '*');
        </script></body></html>`,
    }),
  );
}

for (const width of [1440, 1280, 768, 390]) {
  test(`Vol compact à ${width}px : hauteur réelle, croissance et réduction`, async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== "desktop",
      "Les quatre largeurs sont testées explicitement.",
    );
    await page.setViewportSize({ width, height: 1000 });
    await partner(page);
    await page.goto(tripUrl());
    const widget = page.locator(".flight-widget");
    const frame = page.locator(".booking-frame");
    await widget.scrollIntoViewIfNeeded();
    await expect(widget).toHaveAttribute("data-state", "ready");
    await expect(page.locator(".booking-status, .booking-form")).toHaveCount(0);
    await expect(frame).toHaveCSS("height", "200px");
    const kiwi = page.frameLocator(".booking-frame").frameLocator("iframe");
    await kiwi.getByRole("button", { name: "Développer" }).click();
    await expect(frame).toHaveCSS("height", "680px");
    await kiwi.getByRole("button", { name: "Réduire" }).click();
    await expect(frame).toHaveCSS("height", "180px");
    const layout = await page.evaluate(() => {
      const iframe =
        document.querySelector<HTMLIFrameElement>(".booking-frame")!;
      const root = iframe.contentDocument!.querySelector("#booking-root")!;
      const next = document.querySelector("#hebergement")!;
      return {
        gap:
          next.getBoundingClientRect().top -
          iframe.getBoundingClientRect().bottom,
        measuredHeight: root.getBoundingClientRect().height,
        overflow: document.documentElement.scrollWidth > innerWidth,
        innerOverflow:
          iframe.contentDocument!.documentElement.scrollWidth >
          iframe.clientWidth,
        order: document.querySelector("#reservation")!.nextElementSibling?.id,
      };
    });
    expect(layout).toEqual({
      gap: 32,
      measuredHeight: 180,
      overflow: false,
      innerOverflow: false,
      order: "hebergement",
    });
    await expect(widget.locator(":scope > *")).toHaveCount(1);
    await expect(
      page.locator(
        "#reservation details, #reservation summary, #reservation a",
      ),
    ).toHaveCount(0);
    await page.locator("#reservation").screenshot({
      path: `test-results/flight-ready-${width}.png`,
    });
  });
}

test("resize : messages étrangers ignorés, hauteur invalide ignorée et bornes de sécurité", async ({
  page,
}) => {
  await partner(page);
  await page.goto(tripUrl());
  const frame = page.locator(".booking-frame");
  await expect(frame).toHaveCSS("height", "200px");
  // Correct channel, wrong source: a sibling/top window must have no effect.
  await page.evaluate(() => {
    const iframe = document.querySelector<HTMLIFrameElement>(".booking-frame")!;
    const channel = iframe.srcdoc.match(/const channel = ("[^"]+")/)![1];
    window.postMessage(
      { channel: JSON.parse(channel), type: "resize", height: 900 },
      "*",
    );
  });
  await expect(frame).toHaveCSS("height", "200px");
  const isolated = page.frames().find((f) => f.url() === "about:srcdoc")!;
  const send = (height: number) =>
    isolated.evaluate((height) => {
      const script = document.querySelector(
        "#booking-root > script",
      )!.textContent!;
      const channel = JSON.parse(script.match(/const channel = ("[^"]+")/)![1]);
      parent.postMessage({ channel, type: "resize", height }, "*");
    }, height);
  for (const invalid of [-1, 0, NaN, Infinity]) await send(invalid);
  await expect(frame).toHaveCSS("height", "200px");
  await send(20);
  await expect(frame).toHaveCSS("height", "64px");
  await send(100000);
  await expect(frame).toHaveCSS("height", "2400px");
});

test("bloqueur : skeleton démonté et fallback sans hauteur de widget", async ({
  page,
}, info) => {
  await page.route("https://tpemd.com/**", (route) => route.abort());
  await page.goto(tripUrl());
  const widget = page.locator(".flight-widget");
  await widget.scrollIntoViewIfNeeded();
  await expect(widget).toHaveAttribute("data-state", "fallback");
  await expect(page.locator(".booking-status")).toHaveCount(0);
  await expect(page.locator(".booking-frame")).toBeHidden();
  await expect(widget).toContainText("Impossible d’afficher les vols ici.");
  const link = widget.getByRole("link", { name: /Voir les vols disponibles/ });
  await expect(link).toBeVisible();
  await expect(widget.getByRole("link")).toHaveCount(1);
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "sponsored noopener noreferrer");
  await expect(
    page.locator("#reservation details, #reservation summary"),
  ).toHaveCount(0);
  await expect(widget).not.toContainText(
    /autres? (options?|solutions?|plateformes?|moyens?)|réservation alternative|comparer ailleurs|KAYAK/i,
  );
  const affiliate = new URL((await link.getAttribute("href"))!);
  expect(affiliate.origin).toBe("https://c111.travelpayouts.com");
  const search = new URL(affiliate.searchParams.get("custom_url")!);
  const query = new URL(tripUrl(), "http://localhost").searchParams;
  expect(search.origin).toBe("https://www.kiwi.com");
  expect(search.pathname).toBe("/deep");
  expect(search.searchParams.get("from")).toBe("PAR");
  expect(search.searchParams.get("to")).toBe("LIS");
  expect(search.searchParams.get("departure")).toBe(query.get("dateDepart"));
  expect(search.searchParams.get("return")).toBe(query.get("dateRetour"));
  expect((await widget.boundingBox())!.height).toBeLessThan(240);
  const gap = await page.evaluate(
    () =>
      document.querySelector("#hebergement")!.getBoundingClientRect().top -
      document.querySelector(".flight-widget")!.getBoundingClientRect().bottom,
  );
  expect(gap).toBe(32);
  await page.locator("#reservation").screenshot({
    path: `test-results/flight-fallback-${info.project.name}.png`,
  });
});
