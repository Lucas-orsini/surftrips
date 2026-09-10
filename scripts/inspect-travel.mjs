import nextEnv from "@next/env";
import { writeFileSync } from "node:fs";
nextEnv.loadEnvConfig(process.cwd());
const u = new URL("https://tpemd.com/content");
u.search = new URLSearchParams({
  campaign_id: "111",
  promo_id: "4484",
  currency: "eur",
  locale: "fr",
  powered_by: "true",
  trs: process.env.TRAVELPAYOUTS_MARKER,
  shmarker: process.env.TRAVELPAYOUTS_SHMARKER,
  from_name: "PAR",
  to_name: "LIS",
  departure: "2026-10-10",
  return: "2026-10-20",
}).toString();
try {
  const r = await fetch(u, { signal: AbortSignal.timeout(15000) });
  console.log("Widget HTTP status:", r.status);
  if (r.ok) writeFileSync("/tmp/surftrips-widget.js", await r.text());
} catch {
  console.log("Widget network unavailable");
  process.exitCode = 1;
}
