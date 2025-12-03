import { test, expect } from '@playwright/test';
import { loginUser } from '../../fixtures/helpers';
import { testUsers } from '../../fixtures/test-data';

test.describe('Custom Columns', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, testUsers.validUser);
    await page.goto('/notebooks');
    
    await page.getByTestId('create-notebook-button').first().click();
    await page.getByTestId('notebook-name-input').fill('Custom Cols Notebook');
    await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
    await page.getByTestId('notebook-save-button').click();
    await page.getByRole('link', { name: /Custom Cols Notebook/ }).first().click();
  });

  test('should manage custom fields in bet dialog', async ({ page }) => {
    await page.getByTestId('create-bet-button').click();

    // Toggle panel
    await page.getByTestId('custom-fields-toggle-button').click();
    await expect(page.getByTestId('custom-fields-panel')).toBeVisible();

    // Test creation with custom fields collapsed (optional nature)
    await page.getByTestId('custom-fields-toggle-button').click(); // collapse
    await expect(page.getByTestId('custom-fields-panel')).toBeHidden();

    await page.getByTestId('create-bet-description-input').fill('Custom Fields Bet');
    await page.getByTestId('create-bet-odds-input').fill('-110');
    await page.getByTestId('create-bet-wager-input').fill('50');
    await page.getByTestId('create-bet-submit-button').click();

    await expect(page.getByText('Custom Fields Bet').first()).toBeVisible();
  });
});
