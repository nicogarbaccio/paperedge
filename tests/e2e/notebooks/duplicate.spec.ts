import { test, expect } from '@playwright/test';
import { generateRandomString } from '../../fixtures/helpers';

test.describe('Notebook Duplication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notebooks');

    const notebookName = `Dup Source ${generateRandomString()}`;

    // Create a notebook with a bet
    await page.getByTestId('create-notebook-button').first().click();
    await page.getByTestId('notebook-name-input').fill(notebookName);
    await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
    await page.getByTestId('notebook-save-button').click();
    await page.getByRole('link', { name: notebookName }).first().click();

    await page.getByTestId('create-bet-button').click();
    await page.getByTestId('create-bet-description-input').fill('Copied Bet');
    await page.getByTestId('create-bet-odds-input').fill('+150');
    await page.getByTestId('create-bet-wager-input').fill('100');
    await page.getByTestId('create-bet-submit-button').click();
    await expect(page.getByTestId('create-bet-dialog')).toBeHidden();
  });

  test('should duplicate a notebook with its bets', async ({ page }) => {
    const originalTitle = await page.getByTestId('notebook-detail-title').textContent();

    // Open duplicate dialog
    await page.getByTestId('duplicate-notebook-button').click();
    await expect(page.getByTestId('duplicate-notebook-dialog')).toBeVisible();

    // Verify pre-filled name
    const nameInput = page.getByTestId('duplicate-notebook-name-input');
    await expect(nameInput).toHaveValue(`Copy of ${originalTitle}`);

    // Enter a custom name and confirm
    const dupName = `Duplicated ${generateRandomString()}`;
    await nameInput.clear();
    await nameInput.fill(dupName);
    await page.getByTestId('duplicate-notebook-confirm-button').click();

    // Verify dialog closes and navigates to new notebook
    await expect(page.getByTestId('duplicate-notebook-dialog')).toBeHidden();
    await expect(page.getByTestId('notebook-detail-title')).toHaveText(dupName, { timeout: 10000 });

    // Verify success toast
    await expect(page.getByTestId('toast-success')).toBeVisible();

    // Verify the bet was copied
    await expect(page.getByTestId('bet-card-description').filter({ hasText: 'Copied Bet' })).toBeVisible();

    // Verify URL changed to a different notebook
    const newUrl = page.url();
    expect(newUrl).toMatch(/\/notebooks\/.+/);
  });

  test('should cancel notebook duplication', async ({ page }) => {
    const originalTitle = await page.getByTestId('notebook-detail-title').textContent();

    // Open duplicate dialog
    await page.getByTestId('duplicate-notebook-button').click();
    await expect(page.getByTestId('duplicate-notebook-dialog')).toBeVisible();

    // Cancel
    await page.getByTestId('duplicate-notebook-cancel-button').click();
    await expect(page.getByTestId('duplicate-notebook-dialog')).toBeHidden();

    // Still on the original notebook
    await expect(page.getByTestId('notebook-detail-title')).toHaveText(originalTitle!);
  });
});
