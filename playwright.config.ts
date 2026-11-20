import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45000,
  workers: 2,
  use: { headless: true, trace: "retain-on-failure" },
  webServer: [
    {
      command: "npm run preview",
      url: "http://127.0.0.1:4300/domov",
      reuseExistingServer: !process.env["CI"],
    },
    {
      command: "npm run start:demo -- --host 127.0.0.1",
      url: "http://127.0.0.1:4201",
      reuseExistingServer: !process.env["CI"],
      timeout: 120000,
    },
  ],
});
