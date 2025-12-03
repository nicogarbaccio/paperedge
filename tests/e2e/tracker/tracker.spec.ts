import { test, expect } from '@playwright/test';
import { loginUser } from '../../fixtures/helpers';
import { testUsers } from '../../fixtures/test-data';

test.describe('Bet Tracker', () => {
  // Run tests serially to prevent conflicts with shared test user account/data
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await loginUser(page, testUsers.validUser);
    await page.goto('/tracker');
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Delete all accounts
    // We need to be careful not to fail if no accounts exist
    const accountsList = page.getByTestId('tracker-accounts-list');
    if (await accountsList.isVisible()) {
        // Get all edit buttons. Note: .all() returns a snapshot, so we iterate carefully
        // Because deleting one might refresh the list, we should delete one by one
        while (true) {
            const editBtn = page.getByTestId(/tracker-edit-account-button-/).first();
            if (await editBtn.count() === 0) break;
            
            await editBtn.click();
            await page.getByTestId('edit-account-delete-button').click();
            await page.getByTestId('edit-account-delete-confirm-button').click();
            await expect(page.getByTestId('edit-account-dialog')).toBeHidden();
            // Small wait to ensure list updates
            await page.waitForTimeout(500);
        }
    }
  });

  test('should manage sportsbook accounts', async ({ page }) => {
    // 1. Create Account
    await page.getByTestId('add-account-button').click();
    await expect(page.getByTestId('create-account-dialog')).toBeVisible();
    
    await page.getByTestId('account-name-input').fill('Test Sportsbook');
    await page.getByTestId('account-type-select').selectOption('main');
    await page.getByTestId('account-create-button').click();
    
    await expect(page.getByTestId('create-account-dialog')).toBeHidden();
    await expect(page.getByText('Test Sportsbook')).toBeVisible();

    // 2. Edit Account
    // Find the edit button for the created account. We can find it by sibling text or generic since we cleared all.
    // Let's assume it's the only one or find strictly.
    const accountItem = page.getByTestId('tracker-account-item').filter({ hasText: 'Test Sportsbook' });
    await accountItem.getByRole('button', { name: 'Edit' }).click();
    
    await expect(page.getByTestId('edit-account-dialog')).toBeVisible();
    await page.getByTestId('edit-account-name-input').fill('Updated Sportsbook');
    await page.getByTestId('edit-account-save-button').click();
    
    await expect(page.getByTestId('edit-account-dialog')).toBeHidden();
    await expect(page.getByText('Updated Sportsbook')).toBeVisible();
    await expect(page.getByText('Test Sportsbook')).toBeHidden();
  });

  test('should track daily P/L', async ({ page }) => {
    // Setup: Create account
    await page.getByTestId('add-account-button').click();
    await page.getByTestId('account-name-input').fill('My Bookie');
    await page.getByTestId('account-create-button').click();

    // Select a day (e.g., 15th of current month to avoid edge cases)
    // We look for a cell that contains text "15" and is not faded (current month)
    // The class logic for current month is "text-text-primary" vs "text-text-secondary opacity-50"
    // We can just click the cell with text "15" and ensure we pick the one that looks "active" or just the first one if we trust the grid
    // A safer way is to pick the first cell that has valid day text.
    const dayCell = page.getByTestId('tracker-desktop-day-cell').filter({ hasText: '15' }).first();
    await dayCell.click();

    await expect(page.getByTestId('edit-daily-pl-dialog')).toBeVisible();
    
    // Enter P/L for the account
    // We need to find the input for "My Bookie". 
    // The input ID is `daily-pl-amount-input-${id}`. We don't know the ID easily.
    // But we can find the row by text "My Bookie".
    const row = page.getByTestId('daily-pl-account-row').filter({ hasText: 'My Bookie' });
    await row.getByRole('spinbutton').fill('150.50');
    
    await page.getByTestId('daily-pl-save-button').click();
    await expect(page.getByTestId('edit-daily-pl-dialog')).toBeHidden();

    // Verify update on calendar cell
    // The cell should now show "+$150.50"
    await expect(dayCell).toContainText('+$150.50');
    
    // Verify monthly total
    await expect(page.getByTestId('tracker-monthly-total')).toContainText('$150.50');
  });

  test('should navigate to account details', async ({ page }) => {
    await page.getByTestId('add-account-button').click();
    await page.getByTestId('account-name-input').fill('Detail Test');
    await page.getByTestId('account-create-button').click();
    
    await expect(page.getByTestId('create-account-dialog')).toBeHidden();
    
    // Navigate to details
    // Use regex because link text includes "(Sportsbook)"
    await page.getByRole('link', { name: /Detail Test/ }).click();
    
    // Verify Details Page
    await expect(page.getByRole('heading', { name: 'Detail Test' })).toBeVisible();
    await expect(page.getByText('Sportsbook')).toBeVisible();
    
    // Verify "Back" link works
    await page.getByRole('link', { name: 'Back' }).click();
    await expect(page.getByTestId('tracker-page-title')).toBeVisible();
  });
});
