// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  /* Run tests sequentially to avoid session/database conflicts on the portal */
  fullyParallel: false,
  workers: 1,

  /* Standard reporting for easy debugging */
  reporter: [['list'], ['html']],

  use: {
    baseURL: 'https://test.cbexams.com',
    headless: false,   // Browser is visible
    slowMo: 300,       // Human-like speed
    
    ignoreHTTPSErrors: true, // Fixes SSL "Not Secure" warnings

    /* Debugging assets */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',

    navigationTimeout: 60000,
    actionTimeout: 30000,

    launchOptions: {
      args: ['--start-maximized'],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: null,               // 🚀 Important: Overrides default size to maximize
        deviceScaleFactor: undefined, // 🚀 Important: Fixes the viewport error
      },
    },
  ],

  /* Overall time limit for the registration process */
  timeout: 120000,
  expect: { timeout: 10000 },
});