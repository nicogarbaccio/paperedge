import { test as base } from '@playwright/test';

/**
 * Custom fixtures for authentication testing
 * Provides logged out and logged in contexts
 */

export const test = base.extend({
  /**
   * Ensures the page starts logged out (no storage state)
   */
  loggedOutPage: async ({ page, context }, use) => {
    // Clear all cookies and storage before each test
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await use(page);
  },

  /**
   * Ensures the page starts logged in with test user
   */
  loggedInPage: async ({ page, context }, use) => {
    // Clear storage first
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Import login helper
    const { login } = await import('./helpers');
    const { testUser } = await import('./test-data');

    // Log in
    await login(page, testUser.email, testUser.password);

    await use(page);
  }
});

export { expect } from '@playwright/test';
