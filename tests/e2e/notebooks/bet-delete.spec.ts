import { test, expect } from '@playwright/test';
import { generateRandomString } from '../../fixtures/helpers';

test.describe('Bet Deletion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notebooks');

    const notebookName = `Delete Test ${generateRandomString()}`;

    // Create a notebook
    await page.getByTestId('create-notebook-button').first().click();
    await page.getByTestId('notebook-name-input').fill(notebookName);
    await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
    await page.getByTestId('notebook-save-button').click();
    await page.getByRole('link', { name: notebookName }).first().click();
  });

  test('should delete a bet from history view', async ({ page }) => {
    // Create two bets
    await page.getByTestId('create-bet-button').click();
    await page.getByTestId('create-bet-description-input').fill('Bet To Delete');
    await page.getByTestId('create-bet-odds-input').fill('+150');
    await page.getByTestId('create-bet-wager-input').fill('100');
    await page.getByTestId('create-bet-submit-button').click();
    await expect(page.getByTestId('create-bet-dialog')).toBeHidden();

    await page.getByTestId('create-bet-button').click();
    await page.getByTestId('create-bet-description-input').fill('Bet To Keep');
    await page.getByTestId('create-bet-odds-input').fill('-110');
    await page.getByTestId('create-bet-wager-input').fill('50');
    await page.getByTestId('create-bet-submit-button').click();
    await expect(page.getByTestId('create-bet-dialog')).toBeHidden();

    // Verify both bets are visible
    await expect(page.getByTestId('bet-card-description').filter({ hasText: 'Bet To Delete' })).toBeVisible();
    await expect(page.getByTestId('bet-card-description').filter({ hasText: 'Bet To Keep' })).toBeVisible();

    // Open edit dialog for the bet to delete
    await page.getByTestId('bet-card-description').filter({ hasText: 'Bet To Delete' }).click();
    await expect(page.getByTestId('edit-bet-dialog')).toBeVisible();

    // Click Delete Bet button
    await page.getByTestId('edit-bet-delete-button').click();

    // Verify confirmation panel appears
    await expect(page.getByText('Are you sure you want to delete this bet?')).toBeVisible();
    await expect(page.getByTestId('edit-bet-confirm-delete-button')).toBeVisible();
    await expect(page.getByTestId('edit-bet-cancel-delete-button')).toBeVisible();

    // Confirm deletion
    await page.getByTestId('edit-bet-confirm-delete-button').click();

    // Verify dialog closes and success toast appears
    await expect(page.getByTestId('edit-bet-dialog')).toBeHidden();
    await expect(page.getByTestId('toast-success')).toBeVisible();

    // Verify deleted bet is gone and kept bet remains
    await expect(page.getByTestId('bet-card-description').filter({ hasText: 'Bet To Delete' })).toBeHidden();
    await expect(page.getByTestId('bet-card-description').filter({ hasText: 'Bet To Keep' })).toBeVisible();
  });

  test('should cancel bet deletion', async ({ page }) => {
    // Create a bet
    await page.getByTestId('create-bet-button').click();
    await page.getByTestId('create-bet-description-input').fill('Cancel Delete Bet');
    await page.getByTestId('create-bet-odds-input').fill('+200');
    await page.getByTestId('create-bet-wager-input').fill('75');
    await page.getByTestId('create-bet-submit-button').click();
    await expect(page.getByTestId('create-bet-dialog')).toBeHidden();

    // Open edit dialog
    await page.getByTestId('bet-card-description').filter({ hasText: 'Cancel Delete Bet' }).click();
    await expect(page.getByTestId('edit-bet-dialog')).toBeVisible();

    // Click Delete Bet, then cancel
    await page.getByTestId('edit-bet-delete-button').click();
    await expect(page.getByText('Are you sure you want to delete this bet?')).toBeVisible();

    await page.getByTestId('edit-bet-cancel-delete-button').click();

    // Confirmation should be dismissed, dialog still open with footer buttons
    await expect(page.getByText('Are you sure you want to delete this bet?')).toBeHidden();
    await expect(page.getByTestId('edit-bet-dialog')).toBeVisible();
    await expect(page.getByTestId('edit-bet-save-button')).toBeEnabled();
    await expect(page.getByTestId('edit-bet-delete-button')).toBeEnabled();

    // Close the dialog
    await page.getByTestId('edit-bet-cancel-button').click();
    await expect(page.getByTestId('edit-bet-dialog')).toBeHidden();

    // Bet should still exist
    await expect(page.getByTestId('bet-card-description').filter({ hasText: 'Cancel Delete Bet' })).toBeVisible();
  });
});
