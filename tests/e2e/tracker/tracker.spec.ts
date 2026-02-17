import { test, expect } from '@playwright/test';
import { generateRandomString } from '../../fixtures/helpers';

test.describe('Bet Tracker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tracker');
  });

  test.afterEach(async ({ page }) => {
    // Dismiss any open dialogs that might block cleanup
    const dailyPlDialog = page.getByTestId('edit-daily-pl-dialog');
    if (await dailyPlDialog.isVisible()) {
      await page.keyboard.press('Escape');
      await expect(dailyPlDialog).toBeHidden();
    }

    // Ensure we're on the tracker page
    if (!page.url().includes('/tracker') || page.url().includes('/tracker/accounts/')) {
      await page.goto('/tracker');
    }

    // Cleanup: Delete all accounts created during this test
    const accountsList = page.getByTestId('tracker-accounts-list');
    if (await accountsList.isVisible()) {
        while (true) {
            const editBtn = page.getByTestId(/tracker-edit-account-button-/).first();
            if (await editBtn.count() === 0) break;

            await editBtn.click();
            await page.getByTestId('edit-account-delete-button').click();
            await page.getByTestId('edit-account-delete-confirm-button').click();
            await expect(page.getByTestId('edit-account-dialog')).toBeHidden();
        }
    }
  });

  test('should manage sportsbook accounts', async ({ page }) => {
    const accountName = `Sportsbook ${generateRandomString()}`;

    // 1. Create Account
    await page.getByTestId('add-account-button').click();
    await expect(page.getByTestId('create-account-dialog')).toBeVisible();

    await page.getByTestId('account-name-input').fill(accountName);
    await page.getByTestId('account-type-select').selectOption('main');
    await page.getByTestId('account-create-button').click();

    await expect(page.getByTestId('create-account-dialog')).toBeHidden();
    await expect(page.getByText(accountName)).toBeVisible();

    // 2. Edit Account
    const accountItem = page.getByTestId('tracker-account-item').filter({ hasText: accountName });
    await accountItem.getByRole('button', { name: 'Edit' }).click();

    await expect(page.getByTestId('edit-account-dialog')).toBeVisible();

    const updatedName = `Updated ${generateRandomString()}`;
    await page.getByTestId('edit-account-name-input').fill(updatedName);
    await page.getByTestId('edit-account-save-button').click();

    await expect(page.getByTestId('edit-account-dialog')).toBeHidden();
    await expect(page.getByText(updatedName)).toBeVisible();
    await expect(page.getByText(accountName)).toBeHidden();
  });

  test('should track daily P/L', async ({ page }) => {
    const accountName = `Bookie ${generateRandomString()}`;

    // Setup: Create account
    await page.getByTestId('add-account-button').click();
    await page.getByTestId('account-name-input').fill(accountName);
    await page.getByTestId('account-create-button').click();
    await expect(page.getByTestId('create-account-dialog')).toBeHidden();
    await expect(page.getByText(accountName)).toBeVisible();

    // Wait for account to be fully rendered in the tracker grid before clicking a day
    await expect(page.getByTestId('tracker-desktop-day-cell').first()).toBeVisible();

    // Select day 15 of current month
    const dayCell = page.getByTestId('tracker-desktop-day-cell').filter({ hasText: '15' }).first();
    await dayCell.click();

    await expect(page.getByTestId('edit-daily-pl-dialog')).toBeVisible();

    const row = page.getByTestId('daily-pl-account-row').filter({ hasText: accountName });
    await expect(row).toBeVisible();
    await row.getByRole('spinbutton').fill('150.50');

    await page.getByTestId('daily-pl-save-button').click();
    await expect(page.getByTestId('edit-daily-pl-dialog')).toBeHidden({ timeout: 15000 });

    // Verify update on calendar cell
    await expect(dayCell).toContainText('+$150.50');

    // Verify monthly total
    await expect(page.getByTestId('tracker-monthly-total')).toContainText('$150.50');
  });

  test('should navigate to account details', async ({ page }) => {
    const accountName = `Detail ${generateRandomString()}`;

    await page.getByTestId('add-account-button').click();
    await page.getByTestId('account-name-input').fill(accountName);
    await page.getByTestId('account-create-button').click();

    await expect(page.getByTestId('create-account-dialog')).toBeHidden();

    // Navigate to details
    await page.getByRole('link', { name: new RegExp(accountName) }).click();

    // Verify Details Page
    await expect(page.getByRole('heading', { name: accountName })).toBeVisible();
    await expect(page.getByText('Sportsbook')).toBeVisible();

    // Verify "Back" link works
    await page.getByRole('link', { name: 'Back' }).click();
    await expect(page.getByTestId('tracker-page-title')).toBeVisible();
  });
});
