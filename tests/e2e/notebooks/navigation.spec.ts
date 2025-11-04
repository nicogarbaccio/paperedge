import { test, expect } from '@playwright/test';
import { testUser } from '../../fixtures/test-data';
import {
  login,
  navigateToNotebooks,
  navigateToDashboard,
  wait,
} from '../../fixtures/helpers';

/**
 * Navigation Tests
 *
 * Verifies that navigating between notebooks and views works correctly
 * and doesn't cause crashes or show incorrect data.
 */

test.describe('Notebook Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUser.email, testUser.password);
  });

  test('Can navigate between different notebooks', async ({ page }) => {
    await navigateToNotebooks(page);

    // Click on NFL notebook
    const nflNotebook = page.locator('text="NFL 2024"').first();
    if (await nflNotebook.isVisible()) {
      await nflNotebook.click();
      await page.waitForLoadState('networkidle');

      // Wait for notebook content to load and verify we're on NFL 2024
      await page.waitForSelector('text="NFL 2024"', { timeout: 10000 });
      const pageText = await page.locator('body').textContent();
      expect(pageText).toContain('NFL 2024');
    }

    // Go back and click on NBA notebook
    await page.goBack();
    await page.waitForLoadState('networkidle');

    const nbaNotebook = page.locator('text="NBA 2024"').first();
    if (await nbaNotebook.isVisible()) {
      await nbaNotebook.click();
      await page.waitForLoadState('networkidle');

      // Wait for notebook content to load and verify we're on NBA 2024
      await page.waitForSelector('text="NBA 2024"', { timeout: 10000 });
      const pageText = await page.locator('body').textContent();
      expect(pageText).toContain('NBA 2024');
    }
  });

  test('Switching notebooks shows correct data', async ({ page }) => {
    await navigateToNotebooks(page);

    const nflNotebook = page.locator('text="NFL 2024"').first();
    const nbaNotebook = page.locator('text="NBA 2024"').first();

    if ((await nflNotebook.isVisible()) && (await nbaNotebook.isVisible())) {
      // Click NFL notebook
      await nflNotebook.click();
      await page.waitForLoadState('networkidle');

      // Wait for notebook page to load
      await page.waitForSelector('text="Betting History"', { timeout: 10000 });

      // Verify NFL notebook loaded
      const nflPageContent = await page.locator('body').textContent();
      expect(nflPageContent).toContain('NFL 2024');

      // Switch to NBA notebook
      await page.goBack();
      await page.waitForLoadState('networkidle');
      await nbaNotebook.click();
      await page.waitForLoadState('networkidle');

      // Wait for NBA notebook page to load
      await page.waitForSelector('text="Betting History"', { timeout: 10000 });

      // Verify NBA notebook loaded (title should change)
      const nbaPageContent = await page.locator('body').textContent();
      expect(nbaPageContent).toContain('NBA 2024');
      expect(nbaPageContent).not.toContain('NFL 2024'); // NFL title should not appear
    } else {
      test.skip();
    }
  });

  test('Can navigate away from notebook without errors', async ({ page }) => {
    // Setup console error tracking
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to a notebook
    await navigateToNotebooks(page);
    const firstNotebook = page.locator('[data-testid^="notebook-link"], a[href*="/notebooks/"]').first();
    await firstNotebook.click();

    // Wait a moment for data to start loading
    await wait(100);

    // Navigate away before data fully loads
    await navigateToDashboard(page);
    await page.waitForLoadState('networkidle');

    // Verify Dashboard loaded correctly
    const dashboardTitle = page.locator('h1:has-text("Dashboard"), [data-testid="dashboard"]');
    await expect(dashboardTitle).toBeVisible();

    // Wait for any delayed errors
    await wait(500);

    // Should have no critical console errors
    const criticalErrors = consoleErrors.filter(error =>
      error.includes('Cannot update unmounted component') ||
      error.includes('Warning: Can\'t perform a React state update')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('Notebooks list shows all created notebooks', async ({ page }) => {
    await navigateToNotebooks(page);

    // Should see at least our test notebooks
    await expect(page.locator('text="NFL 2024"')).toBeVisible();
    await expect(page.locator('text="NBA 2024"')).toBeVisible();
    await expect(page.locator('text="MLB 2024"')).toBeVisible();
  });
});
