import { defineConfig, devices } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL || 'http://localhost:4000';
const FRONTEND_BASE = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: API_BASE,
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  },
  projects: [
    {
      name: 'api-critical-flow',
      testMatch: /critical-flow\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ui-critical-flow',
      testMatch: /critical-flow-ui\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: FRONTEND_BASE,
      },
    },
  ],
});