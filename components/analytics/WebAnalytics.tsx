"use client";

import { Analytics } from "@vercel/analytics/next";
import { sanitizeAnalyticsEvent } from "@/lib/analytics";

export function WebAnalytics() {
  // Keep Vercel's automatic environment and Next.js navigation handling.
  // Do not log unsanitized URLs in development's before/after debug output.
  return <Analytics beforeSend={sanitizeAnalyticsEvent} debug={false} />;
}
