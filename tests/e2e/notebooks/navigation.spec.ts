import { test, expect } from '@playwright/test';
import { generateRandomString } from '../../fixtures/helpers';

test.describe('Notebook Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notebooks');
  });

  test('should navigate to details and back', async ({ page }) => {
    const notebookName = `Nav Test ${generateRandomString()}`;

    // Create temp notebook for navigation
    await page.getByTestId('create-notebook-button').first().click();
    await page.getByTestId('notebook-name-input').fill(notebookName);
    await page.getByTestId('notebook-starting-bankroll-input').fill('100');
    await page.getByTestId('notebook-save-button').click();

    // Navigate to it
    await page.getByRole('link', { name: notebookName }).first().click();
    await expect(page).toHaveURL(/\/notebooks\/[a-f0-9-]+/);
    await expect(page.getByTestId('notebook-detail-title')).toBeVisible();

    // Navigate back
    await page.getByTestId('back-to-notebooks-link').click();
    await expect(page).toHaveURL(/\/notebooks$/);
  });

  test('should handle direct URL navigation', async ({ page }) => {
    // Navigate to non-existent ID
    await page.goto('/notebooks/00000000-0000-0000-0000-000000000000');

    // Should gracefully handle it (redirect or show error/empty)
    await expect(page.getByTestId('notebooks-page-title')).toBeVisible({ timeout: 10000 });
  });
});
