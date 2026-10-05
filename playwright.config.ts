import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  use: {
    baseURL: process.env.TEST_URL || "http://127.0.0.1:4173",
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    launchOptions: { args: ["--enable-unsafe-swiftshader"] },
  },
  reporter: [["list"], ["json", { outputFile: process.env.TEST_REPORT || "reports/tests-local.json" }]],
  webServer: process.env.TEST_URL
    ? undefined
    : {
        command: "npm run preview -- --port 4173",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: true,
      },
});
