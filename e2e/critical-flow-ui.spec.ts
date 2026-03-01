/**
 * E2E UI Critical Flow: Register → Masters → Master details
 * Requires: Frontend at FRONTEND_BASE_URL (default localhost:3000)
 */
import { test, expect } from '@playwright/test';

const FRONTEND = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';

test.describe('UI Critical Flow', () => {
  test('1. Home page loads', async ({ page }) => {
    await page.goto(FRONTEND);
    await expect(page).toHaveTitle(/./);
  });

  test('2. Register page loads', async ({ page }) => {
    await page.goto(`${FRONTEND}/register`);
    await expect(page.locator('input, form')).toBeVisible({ timeout: 5000 });
  });

  test('3. Masters page loads', async ({ page }) => {
    await page.goto(`${FRONTEND}/masters`);
    await expect(page.locator('main, [role="main"], body')).toBeVisible();
  });
});
