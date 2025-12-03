import { test, expect } from '@playwright/test';
import { loginUser } from '../../fixtures/helpers';
import { testUsers } from '../../fixtures/test-data';

test.describe('Notebook Search & Filter', () => {
  let notebookName: string;

  test.beforeEach(async ({ page }) => {
    await loginUser(page, testUsers.validUser);
    await page.goto('/notebooks');
    
    // Create a unique notebook for search testing
    const timestamp = Date.now();
    notebookName = `Search Notebook ${timestamp}`;

    await page.getByTestId('create-notebook-button').first().click();
    await page.getByTestId('notebook-name-input').fill(notebookName);
    await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
    await page.getByTestId('notebook-save-button').click();
    
    // Wait for creation and click the specific new notebook
    // Use filter to match exact text on the card title to avoid toast messages
    const card = page.getByRole('link', { name: notebookName }).first();
    await expect(card).toBeVisible();
    await card.click();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Delete the notebook
    await page.goto('/notebooks');
    const notebookCard = page.locator('div').filter({ hasText: notebookName }).last();
    if (await notebookCard.isVisible()) {
        // We need to find the delete button/menu for this specific notebook
        // Assuming standard notebook card layout with menu
        // For now, we just leave it or try to delete if we know how
        // Given the unique name, leaving it is "safe" for other tests, but pollutes DB.
        // Let's rely on unique names for isolation.
    }
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

    // 1. Search
    // Switch to history view to ensure search bar is visible
    await page.getByTestId('notebook-history-view-button').click();
    await page.getByTestId('bet-search-input').fill('UniqueSearchTerm');
    await page.waitForTimeout(500); // Debounce
    await expect(page.getByTestId('bet-card')).toHaveCount(1);

    // 2. Search No Results
    await page.getByTestId('bet-search-input').fill('NonExistent');
    await page.waitForTimeout(500);
    await expect(page.getByText(/no bets match/i)).toBeVisible();

    // 3. Filter Toggle
    await page.getByTestId('bet-filters-toggle-button').click();
    await expect(page.getByTestId('bet-filters-panel')).toBeVisible();
  });
});
