import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";

// Laboratory samples only: no network/CPU throttling, no field INP or p75 claim.
for (const scenario of ["accueil", "destination", "voyage"] as const) {
  test(`SEO laboratoire : ${scenario}`, async ({ page }, info) => {
    test.setTimeout(60000);
    await page.addInitScript(() => {
      const metrics = { lcp: 0, cls: 0, interactionMax: 0 };
      Object.assign(window, { seoLab: metrics });
      let sessionStart = 0;
      let previousShift = 0;
      let sessionValue = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) metrics.lcp = e.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          const shift = e as PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          };
          if (shift.hadRecentInput) continue;
          if (
            e.startTime - previousShift >= 1000 ||
            e.startTime - sessionStart >= 5000
          ) {
            sessionStart = e.startTime;
            sessionValue = 0;
          }
          sessionValue += shift.value;
          previousShift = e.startTime;
          metrics.cls = Math.max(metrics.cls, sessionValue);
        }
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries())
          if (
            (e as PerformanceEventTiming & { interactionId: number })
              .interactionId
          )
            metrics.interactionMax = Math.max(
              metrics.interactionMax,
              e.duration,
            );
      }).observe({
        type: "event",
        buffered: true,
        durationThreshold: 16,
      } as PerformanceObserverInit);
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const samples = [];
    for (let run = 0; run < 3; run++) {
      const start = new Date();
      start.setUTCDate(10);
      start.setUTCMonth(start.getUTCMonth() + 1);
      const end = new Date(start);
      end.setUTCDate(20);
      const query = new URLSearchParams({
        origine: "PAR",
        niveau: "intermediaire",
        dateDepart: start.toISOString().slice(0, 10),
        dateRetour: end.toISOString().slice(0, 10),
      });
      const path =
        scenario === "accueil"
          ? "/"
          : `/destination/ericeira${scenario === "voyage" ? `?${query}` : ""}`;
      expect((await page.goto(path))?.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(2000);
      if (scenario === "accueil")
        await page
          .getByRole("button", { name: "Niveau Intermédiaire" })
          .click();
      else if (scenario === "destination")
        await page.getByLabel("Date aller", { exact: true }).click();
      else {
        await page.locator("#reservation").scrollIntoViewIfNeeded();
        await page.waitForTimeout(6000);
        await page.getByRole("link", { name: "Surf", exact: true }).click();
      }
      await page.keyboard.press("Escape");
      await page.waitForTimeout(250);
      const metrics = await page.evaluate(() => {
        const data = (
          window as unknown as {
            seoLab: { lcp: number; cls: number; interactionMax: number };
          }
        ).seoLab;
        const navigation = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        const scripts = (
          performance.getEntriesByType(
            "resource",
          ) as PerformanceResourceTiming[]
        ).filter((e) => e.initiatorType === "script");
        return {
          ...data,
          ttfb: navigation.responseStart - navigation.requestStart,
          jsDecodedBytes: scripts.reduce((n, e) => n + e.decodedBodySize, 0),
          widget:
            document
              .querySelector(".flight-widget")
              ?.getAttribute("data-state") || null,
        };
      });
      expect(metrics.lcp).toBeGreaterThan(0);
      samples.push(metrics);
    }
    expect(errors).toEqual([]);
    const result = {
      profile: info.project.name,
      scenario,
      baseURL: info.project.use.baseURL,
      samples,
      errors,
    };
    await writeFile(
      info.outputPath("metrics.json"),
      JSON.stringify(result, null, 2),
    );
    console.log("SEO_LAB", JSON.stringify(result));
  });
}
