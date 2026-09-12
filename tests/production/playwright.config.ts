import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";

// Public production only. No local server, deployment, database writes or rate-limit stress test.
export default defineConfig({
  testDir: fileURLToPath(new URL("../e2e", import.meta.url)),
  testMatch: [
    "destination-banner.spec.ts",
    "destination-images-live.spec.ts",
    "destination-performance.spec.ts",
    "travel-live.spec.ts",
    "accommodation-live.spec.ts",
    "accommodation.spec.ts",
    "landing.spec.ts",
  ],
  grep: /bannière :|Storage réel :|mesure locale destination|Travelpayouts réel :|Hotels.com réel :|fiche directe sans recommandation|navigation résultats → destination|blocage Expedia|landing : images|Supabase réel :/,
  workers: 1,
  retries: 0,
  reporter: "list",
  outputDir: "../../.local/production-deployment/test-artifacts",
  use: {
    baseURL: "https://www.surftrips.fr",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: { channel: "chrome" },
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
});
