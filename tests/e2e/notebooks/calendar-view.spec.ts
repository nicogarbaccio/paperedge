import { test, expect } from '@playwright/test';
import { loginUser } from '../../fixtures/helpers';
import { testUsers } from '../../fixtures/test-data';

test.describe('Calendar View', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, testUsers.validUser);
    await page.goto('/notebooks');
    
    // Create a notebook
    await page.getByTestId('create-notebook-button').first().click();
    await page.getByTestId('notebook-name-input').fill('Calendar Notebook');
    await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
    await page.getByTestId('notebook-save-button').click();
    await page.getByRole('link', { name: /Calendar Notebook/ }).first().click();
  });

  test('should toggle view and navigate months', async ({ page }) => {
    // 1. Toggle View
    await page.getByTestId('notebook-calendar-view-button').click();
    await expect(page.getByTestId('calendar-view')).toBeVisible();
    
    // 2. Verify Navigation
    const currentMonth = await page.getByTestId('calendar-current-month').textContent();
    
    await page.getByTestId('calendar-prev-month-button').click();
    await expect(page.getByTestId('calendar-current-month')).not.toHaveText(currentMonth!);
    
    await page.getByTestId('calendar-next-month-button').click();
    await expect(page.getByTestId('calendar-current-month')).toHaveText(currentMonth!);

    // 3. Toggle back
    await page.getByTestId('notebook-history-view-button').click();
    await expect(page.getByTestId('calendar-view')).toBeHidden();
  });
});
