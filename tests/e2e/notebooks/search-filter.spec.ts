import { test, expect } from '@playwright/test';
import { generateRandomString } from '../../fixtures/helpers';

test.describe('Notebook Search & Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notebooks');

    const notebookName = `Search ${generateRandomString()}`;

    await page.getByTestId('create-notebook-button').first().click();
    await page.getByTestId('notebook-name-input').fill(notebookName);
    await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
    await page.getByTestId('notebook-save-button').click();

    const card = page.getByRole('link', { name: notebookName }).first();
    await expect(card).toBeVisible();
    await card.click();
  });

  test('should search and filter bets', async ({ page }) => {
    // Create a single bet to search for
    await page.getByTestId('create-bet-button').click();
    await page.getByTestId('create-bet-description-input').fill('UniqueSearchTerm');
    await page.getByTestId('create-bet-odds-input').fill('-110');
    await page.getByTestId('create-bet-wager-input').fill('100');
    await page.getByTestId('create-bet-submit-button').click();

    // Wait for bet to appear
    await expect(page.getByText('UniqueSearchTerm').first()).toBeVisible();

    // 1. Search - use assertion-based wait instead of waitForTimeout
    await page.getByTestId('notebook-history-view-button').click();
    await page.getByTestId('bet-search-input').fill('UniqueSearchTerm');
    await expect(page.getByTestId('bet-card')).toHaveCount(1);

    // 2. Search No Results - assertion will auto-retry through debounce
    await page.getByTestId('bet-search-input').fill('NonExistent');
    await expect(page.getByText(/no bets match/i)).toBeVisible();

    // 3. Filter Toggle
    await page.getByTestId('bet-filters-toggle-button').click();
    await expect(page.getByTestId('bet-filters-panel')).toBeVisible();
  });
});
