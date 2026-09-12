import { test } from "@playwright/test";

test("mesure locale destination : LCP, CLS et latence des interactions", async ({
  page,
}, info) => {
  await page.route("https://creator.expediagroup.com/**", (route) =>
    route.abort(),
  );
  await page.route("https://tpemd.com/**", (route) => route.abort());
  await page.addInitScript(() => {
    const metrics = { lcp: 0, cls: 0, interactionMax: 0 };
    Object.assign(window, { surftripsMetrics: metrics });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) metrics.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        };
        if (!shift.hadRecentInput) metrics.cls += shift.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (
          (entry as PerformanceEntry & { interactionId: number }).interactionId
        )
          metrics.interactionMax = Math.max(
            metrics.interactionMax,
            entry.duration,
          );
      }
    }).observe({
      type: "event",
      buffered: true,
      durationThreshold: 16,
    } as PerformanceObserverInit);
  });
  await page.goto("/destination/ericeira");
  await page.waitForTimeout(1200);
  await page.getByLabel("Date aller", { exact: true }).click();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  const metrics = await page.evaluate(
    () =>
      (window as unknown as { surftripsMetrics: Record<string, number> })
        .surftripsMetrics,
  );
  console.log("DESTINATION_LAB", info.project.name, JSON.stringify(metrics));
});
