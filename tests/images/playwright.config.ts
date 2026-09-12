import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
export default defineConfig({
  testDir: ".",
  workers: 2,
  fullyParallel: true,
  reporter: "list",
  outputDir: "../../test-results/images",
  use: {
    baseURL: "http://127.0.0.1:3003",
    launchOptions: { channel: "chrome" },
    screenshot: "only-on-failure",
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
  webServer: {
    command:
      "npm run dev -- tests/fixtures/destination-images --hostname 127.0.0.1 --port 3003",
    cwd: fileURLToPath(new URL("../../", import.meta.url)),
    url: "http://127.0.0.1:3003",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
