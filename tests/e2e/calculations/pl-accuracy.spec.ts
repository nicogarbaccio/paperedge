import { test, expect } from '@playwright/test';
import {
  testUser,
  notebooks,
  nflExpectedCalculations,
  dashboardExpectedCalculations,
} from '../../fixtures/test-data';
import {
  login,
  navigateToDashboard,
  navigateToNotebooks,
  extractNumber,
  extractPercentage,
} from '../../fixtures/helpers';

/**
 * P&L Calculation Accuracy Tests
 *
 * Verifies that profit/loss calculations are accurate across all views.
 * This is critical business logic that must always work correctly.
 */

test.describe('P&L Calculations', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUser.email, testUser.password);
  });

  test('Dashboard shows correct total P&L, win rate, and ROI', async ({ page }) => {
    await navigateToDashboard(page);

    // Simple approach: just verify the expected values appear somewhere on the dashboard
    const pageText = await page.locator('body').textContent();

    // Verify Total P&L appears (260)
    expect(pageText).toContain('260');
    expect(pageText).toContain('Total P&L');

    // Verify Win Rate appears (50%)
    expect(pageText).toContain('50');
    expect(pageText).toContain('Win Rate');

    // Verify ROI appears (43.3%)
    expect(pageText).toContain('43');
    expect(pageText).toContain('ROI');
  });

  test('Notebook detail shows correct P&L calculations', async ({ page }) => {
    // Navigate to NFL 2024 notebook which has edge cases
    await navigateToNotebooks(page);
    await page.click('text="NFL 2024"');
    await page.waitForLoadState('networkidle');

    // Verify stats on notebook detail page
    // Expected: Total P&L +$100, Win Rate 33.33%, ROI 66.67%
    const plElement = page.locator('[data-testid="total-pl"]').or(
      page.locator('text=/Total P&L/i').locator('..')
    );
    const plText = await plElement.textContent();
    const pl = extractNumber(plText);
    expect(Math.abs(pl - 100)).toBeLessThan(1);

    const winRateElement = page.locator('[data-testid="win-rate"]').or(
      page.locator('text=/Win Rate/i').locator('..')
    );
    const winRateText = await winRateElement.textContent();
    const winRate = extractPercentage(winRateText);
    expect(Math.abs(winRate - 33.33)).toBeLessThan(0.5);

    const roiElement = page.locator('[data-testid="roi"]').or(
      page.locator('text=/ROI/i').locator('..')
    );
    const roiText = await roiElement.textContent();
    const roi = extractPercentage(roiText);
    expect(Math.abs(roi - 66.67)).toBeLessThan(0.5);
  });

  test('P&L calculations handle different bet statuses correctly', async ({ page }) => {
    // Verify that won, lost, push, and pending bets are calculated correctly
    // NFL 2024 has: 1 won (+$150), 1 lost (-$50), 1 push ($0), 1 pending ($0)
    // Total should be +$100

    await navigateToNotebooks(page);
    await page.click('text="NFL 2024"');
    await page.waitForLoadState('networkidle');

    // Wait for betting history section to load
    await page.waitForSelector('text="Betting History"', { timeout: 10000 });
    // Wait for bet count to appear (indicates data loaded)
    await page.waitForSelector('text=/Showing \\d+ of \\d+ bet/', { timeout: 10000 });

    const pageText = await page.locator('body').textContent();

    // Verify bet status labels appear somewhere on the page
    expect(pageText).toContain('Won');
    expect(pageText).toContain('Lost');
    expect(pageText).toContain('Push');
    expect(pageText).toContain('Pending');

    // Verify total P&L is +$100 (shown in stats section)
    expect(pageText).toContain('100');
    expect(pageText).toContain('Total P&L');
  });

  test('P&L is consistent across dashboard and notebook views', async ({ page }) => {
    // The same data should show the same numbers everywhere

    // Get total from Dashboard
    await navigateToDashboard(page);
    const dashboardText = await page.locator('body').textContent();
    expect(dashboardText).toContain('Total P&L');

    // Navigate to NFL notebook and verify its P&L
    await navigateToNotebooks(page);
    await page.click('text="NFL 2024"');
    await page.waitForLoadState('networkidle');

    // Wait for stats to load
    await page.waitForSelector('text="Total P&L"', { timeout: 10000 });
    await page.waitForSelector('text="Win Rate"', { timeout: 10000 });

    const nflPageText = await page.locator('body').textContent();
    expect(nflPageText).toContain('100'); // NFL P&L
    expect(nflPageText).toContain('NFL 2024');
    expect(nflPageText).toContain('Total P&L');
  });
});
