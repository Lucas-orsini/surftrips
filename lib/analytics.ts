import type { BeforeSendEvent } from "@vercel/analytics/next";

/** Measure pages, never travel criteria, URL tokens or custom events. */
export function sanitizeAnalyticsEvent(
  event: BeforeSendEvent,
): BeforeSendEvent | null {
  if (event.type !== "pageview") return null;
  try {
    const url = new URL(event.url);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    if (url.username || url.password) return null;
    return { type: "pageview", url: `${url.origin}${url.pathname}` };
  } catch {
    return null;
  }
}
