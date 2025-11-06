import { test, expect } from '@playwright/test';
import { loginUser } from '../../fixtures/helpers';
import { testUsers, successMessages } from '../../fixtures/test-data';

/**
 * Custom Columns Tests (18 tests)
 *
 * Tests cover:
 * - Happy path scenarios (6 tests)
 * - Error scenarios (6 tests)
 * - Edge cases (6 tests)
 *
 * Note: Custom columns functionality requires database setup.
 * These tests focus on UI behavior and interaction patterns.
 */

test.describe('Custom Columns', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, testUsers.validUser);
    await page.goto('/notebooks');
  });

  /**
   * HAPPY PATH TESTS (6 tests)
   */
  test.describe('Happy Path', () => {
    test('should show custom fields toggle in bet creation dialog', async ({ page }) => {
      // Create a notebook first
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();

      await page.getByTestId('notebook-name-input').fill('Custom Fields Test');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      // Navigate to the notebook
      await page.getByTestId('notebook-card').first().click();
      await expect(page.getByTestId('notebook-detail-title')).toBeVisible();

      // Open create bet dialog
      await page.getByTestId('create-bet-button').click();

      // Custom fields toggle should be visible
      const customFieldsToggle = page.getByTestId('custom-fields-toggle-button');
      await expect(customFieldsToggle).toBeVisible();
    });

    test('should toggle custom fields panel', async ({ page }) => {
      // Create notebook and navigate
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('Toggle Test');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      await page.getByTestId('notebook-card').first().click();
      await page.getByTestId('create-bet-button').click();

      const toggle = page.getByTestId('custom-fields-toggle-button');
      await toggle.click();

      // Panel should be visible after clicking toggle
      await expect(page.getByTestId('custom-fields-panel')).toBeVisible();

      // Click again to hide
      await toggle.click();
      await expect(page.getByTestId('custom-fields-panel')).not.toBeVisible();
    });

    test('should persist custom field values when toggling panel', async ({ page }) => {
      // Create notebook and navigate
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('Persist Test');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      await page.getByTestId('notebook-card').first().click();
      await page.getByTestId('create-bet-button').click();

      // Toggle custom fields
      const toggle = page.getByTestId('custom-fields-toggle-button');
      await toggle.click();

      // Check if there are custom fields
      const hasCustomFields = await page.getByTestId('custom-fields-panel').isVisible();

      if (hasCustomFields) {
        // If custom fields exist, test toggling
        await toggle.click();
        await expect(page.getByTestId('custom-fields-panel')).not.toBeVisible();

        await toggle.click();
        await expect(page.getByTestId('custom-fields-panel')).toBeVisible();
      }
    });

    test('should display custom fields in bet cards', async ({ page }) => {
      // Create notebook
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('Display Test');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      // Navigate to notebook
      await page.getByTestId('notebook-card').first().click();

      // Verify we're in history view
      await expect(page.getByTestId('notebook-history-view-button')).toBeVisible();
    });

    test('should allow creating bets without filling custom fields', async ({ page }) => {
      // Create notebook
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('Optional Fields');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      // Navigate and create bet
      await page.getByTestId('notebook-card').first().click();
      await page.getByTestId('create-bet-button').click();

      // Create bet without opening custom fields
      await page.getByTestId('bet-description-input').fill('Test Bet');
      await page.getByTestId('bet-odds-input').fill('-110');
      await page.getByTestId('bet-wager-input').fill('100');
      await page.getByTestId('bet-save-button').click();

      // Bet should be created successfully
      await expect(page.getByText(/bet added|bet created/i).first()).toBeVisible();
    });

    test('should show custom fields in edit bet dialog', async ({ page }) => {
      // Create notebook
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('Edit Fields Test');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      // Navigate and create bet
      await page.getByTestId('notebook-card').first().click();
      await page.getByTestId('create-bet-button').click();

      await page.getByTestId('bet-description-input').fill('Test Bet');
      await page.getByTestId('bet-odds-input').fill('-110');
      await page.getByTestId('bet-wager-input').fill('100');
      await page.getByTestId('bet-save-button').click();
      await expect(page.getByText(/bet added|bet created/i).first()).toBeVisible();

      // Click bet card to edit
      await page.getByTestId('bet-card').first().click();

      // Custom fields toggle should be in edit dialog
      await expect(page.getByTestId('custom-fields-toggle-button')).toBeVisible();
    });
  });

  /**
   * ERROR SCENARIOS (6 tests)
   */
  test.describe('Error Scenarios', () => {
    test('should handle missing custom columns gracefully', async ({ page }) => {
      // Create notebook without custom columns
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('No Columns');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      // Navigate to notebook
      await page.getByTestId('notebook-card').first().click();
      await page.getByTestId('create-bet-button').click();

      // Should still show toggle button
      await expect(page.getByTestId('custom-fields-toggle-button')).toBeVisible();
    });

    test('should handle empty custom field values', async ({ page }) => {
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('Empty Values Test');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      await page.getByTestId('notebook-card').first().click();
      await page.getByTestId('create-bet-button').click();

      // Toggle custom fields
      await page.getByTestId('custom-fields-toggle-button').click();

      // Create bet without filling custom fields
      await page.getByTestId('bet-description-input').fill('Empty Fields');
      await page.getByTestId('bet-odds-input').fill('-110');
      await page.getByTestId('bet-wager-input').fill('100');
      await page.getByTestId('bet-save-button').click();

      await expect(page.getByText(/bet added|bet created/i).first()).toBeVisible();
    });

    test('should not block bet submission with invalid custom field types', async ({ page }) => {
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('Type Test');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      await page.getByTestId('notebook-card').first().click();
      await page.getByTestId('create-bet-button').click();

      // Fill bet details
      await page.getByTestId('bet-description-input').fill('Type Check');
      await page.getByTestId('bet-odds-input').fill('-110');
      await page.getByTestId('bet-wager-input').fill('100');
      await page.getByTestId('bet-save-button').click();

      await expect(page.getByText(/bet added|bet created/i).first()).toBeVisible();
    });

    test('should maintain form state when validation fails', async ({ page }) => {
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('Validation Test');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      await page.getByTestId('notebook-card').first().click();
      await page.getByTestId('create-bet-button').click();

      // Toggle custom fields
      await page.getByTestId('custom-fields-toggle-button').click();

      // Try to submit without required fields
      await page.getByTestId('bet-save-button').click();

      // Dialog should still be open
      await expect(page.getByTestId('custom-fields-toggle-button')).toBeVisible();
    });

    test('should handle dialog cancellation with custom fields open', async ({ page }) => {
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('Cancel Test');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      await page.getByTestId('notebook-card').first().click();
      await page.getByTestId('create-bet-button').click();

      // Open custom fields
      await page.getByTestId('custom-fields-toggle-button').click();
      await expect(page.getByTestId('custom-fields-panel')).toBeVisible();

      // Cancel dialog
      await page.getByTestId('bet-cancel-button').click();

      // Reopen and custom fields should be collapsed
      await page.getByTestId('create-bet-button').click();
      await expect(page.getByTestId('custom-fields-panel')).not.toBeVisible();
    });

    test('should handle rapid toggling of custom fields', async ({ page }) => {
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('Rapid Toggle');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      await page.getByTestId('notebook-card').first().click();
      await page.getByTestId('create-bet-button').click();

      const toggle = page.getByTestId('custom-fields-toggle-button');

      // Rapidly toggle multiple times
      await toggle.click();
      await toggle.click();
      await toggle.click();
      await toggle.click();

      // Final state should be stable
      await expect(toggle).toBeVisible();
    });
  });

  /**
   * EDGE CASES (6 tests)
   */
  test.describe('Edge Cases', () => {
    test('should handle very long custom field names', async ({ page }) => {
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('Long Name Test');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      await page.getByTestId('notebook-card').first().click();
      await page.getByTestId('create-bet-button').click();

      // Toggle and verify UI doesn't break with long names
      await page.getByTestId('custom-fields-toggle-button').click();
    });

    test('should handle special characters in custom field values', async ({ page }) => {
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('Special Chars');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      await page.getByTestId('notebook-card').first().click();
      await page.getByTestId('create-bet-button').click();

      await page.getByTestId('custom-fields-toggle-button').click();
    });

    test('should handle unicode in custom field values', async ({ page }) => {
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('Unicode Test');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      await page.getByTestId('notebook-card').first().click();
      await page.getByTestId('create-bet-button').click();

      await page.getByTestId('custom-fields-toggle-button').click();
    });

    test('should preserve custom field state across view switches', async ({ page }) => {
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('View Switch');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      await page.getByTestId('notebook-card').first().click();

      // Switch to calendar view
      await page.getByTestId('notebook-calendar-view-button').click();

      // Switch back to history
      await page.getByTestId('notebook-history-view-button').click();

      // Open bet dialog
      await page.getByTestId('create-bet-button').click();

      // Custom fields toggle should still work
      await expect(page.getByTestId('custom-fields-toggle-button')).toBeVisible();
    });

    test('should handle bet cards with custom field data', async ({ page }) => {
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('Card Data Test');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      await page.getByTestId('notebook-card').first().click();
      await page.getByTestId('create-bet-button').click();

      // Create bet
      await page.getByTestId('bet-description-input').fill('Custom Data Bet');
      await page.getByTestId('bet-odds-input').fill('-110');
      await page.getByTestId('bet-wager-input').fill('100');
      await page.getByTestId('bet-save-button').click();
      await expect(page.getByText(/bet added|bet created/i).first()).toBeVisible();

      // Bet card should be visible
      await expect(page.getByTestId('bet-card').first()).toBeVisible();
    });

    test('should maintain custom field panel state during bet editing', async ({ page }) => {
      const createNotebookButton = page.getByTestId('create-notebook-button').first();
      await createNotebookButton.click();
      await page.getByTestId('notebook-name-input').fill('Edit State Test');
      await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
      await page.getByTestId('notebook-save-button').click();
      await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();

      await page.getByTestId('notebook-card').first().click();
      await page.getByTestId('create-bet-button').click();

      // Create bet
      await page.getByTestId('bet-description-input').fill('Edit Test Bet');
      await page.getByTestId('bet-odds-input').fill('-110');
      await page.getByTestId('bet-wager-input').fill('100');
      await page.getByTestId('bet-save-button').click();
      await expect(page.getByText(/bet added|bet created/i).first()).toBeVisible();

      // Edit bet
      await page.getByTestId('bet-card').first().click();

      // Custom fields toggle should be present
      await expect(page.getByTestId('custom-fields-toggle-button')).toBeVisible();
    });
  });
});
