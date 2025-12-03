import { test, expect } from '@playwright/test';
import { loginUser } from '../../fixtures/helpers';
import { testUsers, testNotebooks } from '../../fixtures/test-data';

test.describe('Notebook Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, testUsers.validUser);
    await page.goto('/notebooks');
  });

  test('should navigate to details and back', async ({ page }) => {
    // Create temp notebook for navigation
    await page.getByTestId('create-notebook-button').first().click();
    await page.getByTestId('notebook-name-input').fill('Nav Test');
    await page.getByTestId('notebook-starting-bankroll-input').fill('100');
    await page.getByTestId('notebook-save-button').click();

    // Navigate to it
    await page.getByRole('link', { name: /Nav Test/ }).first().click();
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
    // We verify it doesn't crash and shows the notebooks page or a "not found" state
    await expect(page.getByTestId('notebooks-page-title')).toBeVisible({ timeout: 10000 });
  });
});
