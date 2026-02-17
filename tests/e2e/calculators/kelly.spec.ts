import { test, expect } from '@playwright/test';

test.describe('Kelly Criterion Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators');

    // Navigate to Kelly Calculator tab
    await page.getByTestId('calculator-tab-kelly').click();

    // Verify calculator is visible
    await expect(page.getByText('Kelly Criterion Calculator')).toBeVisible();
  });

  test('should calculate positive expected value correctly', async ({ page }) => {
    await page.getByTestId('kelly-betting-book-line').fill('Test Bet');
    await page.getByTestId('kelly-betting-book-odds').fill('+110');

    await page.getByTestId('kelly-sharp-book-line').fill('Sharp Ref');
    await page.getByTestId('kelly-sharp-book-odds').fill('-120');

    await page.getByTestId('kelly-bankroll').fill('1000');
    await page.getByTestId('kelly-max-bet').fill('5');
    await page.getByTestId('kelly-fraction').fill('1');

    await expect(page.getByTestId('kelly-result-edge')).toContainText('+');
    await expect(page.getByTestId('kelly-result-status')).toContainText('Positive Edge');
    await expect(page.getByTestId('kelly-result-bet-amount')).toBeVisible();
    await expect(page.getByTestId('kelly-result-ev')).toContainText('$');
  });

  test('should handle negative expected value (no bet)', async ({ page }) => {
    await page.getByTestId('kelly-betting-book-line').fill('Loser Bet');
    await page.getByTestId('kelly-betting-book-odds').fill('-110');

    await page.getByTestId('kelly-sharp-book-line').fill('Sharp Ref');
    await page.getByTestId('kelly-sharp-book-odds').fill('+100');

    await page.getByTestId('kelly-bankroll').fill('1000');

    await expect(page.getByTestId('kelly-result-status')).toContainText('Negative Edge');
    await expect(page.getByTestId('kelly-result-bet-amount')).toContainText('$0.00');
  });

  test('should validate input fields', async ({ page }) => {
    await page.getByTestId('kelly-betting-book-line').fill('Test');
    await page.getByTestId('kelly-sharp-book-line').fill('Ref');
    await page.getByTestId('kelly-betting-book-odds').fill('+100');
    await page.getByTestId('kelly-sharp-book-odds').fill('-110');

    // Test Negative Bankroll
    await page.getByTestId('kelly-bankroll').fill('-100');

    await expect(page.getByText(/valid positive bankroll/i)).toBeVisible();
    await expect(page.getByTestId('kelly-result-status')).toBeHidden();
  });

  test('should clear all fields', async ({ page }) => {
    await page.getByTestId('kelly-betting-book-line').fill('Clear Me');
    await page.getByTestId('kelly-betting-book-odds').fill('+100');
    await page.getByTestId('kelly-bankroll').fill('5000');

    await page.getByTestId('kelly-clear-button').click();

    await expect(page.getByTestId('kelly-betting-book-line')).toHaveValue('');
    await expect(page.getByTestId('kelly-betting-book-odds')).toHaveValue('');
    await expect(page.getByTestId('kelly-bankroll')).toHaveValue('1000'); // Defaults to 1000
    await expect(page.getByTestId('kelly-result-status')).toBeHidden();
  });
});
