// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  /* Run tests sequentially */
  fullyParallel: false,
  workers: 1,

  /* Reporting */
  reporter: [['list'], ['html']],

  use: {
    baseURL: 'https://test.cbexams.com',

    /* 🔥 IMPORTANT FIX */
    headless: true,   // ✅ Must be true for GitHub Actions

    /* Optional: keep slowMo only for local (not needed in CI) */
    // slowMo: 300,

    ignoreHTTPSErrors: true,

    /* Debugging */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',

    navigationTimeout: 60000,
    actionTimeout: 30000,

    /* Remove maximize (not needed in CI) */
    launchOptions: {
      args: ['--no-sandbox'],
    },

    /* Set fixed viewport for CI */
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  timeout: 120000,
  expect: { timeout: 10000 },
});