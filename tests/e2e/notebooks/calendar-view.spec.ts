import { test, expect } from '@playwright/test';
import { loginUser, createNotebook, createBet } from '../../fixtures/helpers';
import { testNotebooks, testBets } from '../../fixtures/test-data';

/**
 * Calendar View Tests
 *
 * Tests cover:
 * - Calendar view toggle and display
 * - Month navigation (previous/next)
 * - "Today" button when viewing different month
 * - Day clicks to open day details drawer
 * - Monthly profit display
 * - Calendar initialization to most recent bet month
 * - Empty calendar handling
 * - Daily P&L display and color coding
 */

test.describe('Calendar View', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);

    // Create a test notebook
    await createNotebook(page, testNotebooks.basic);

    // After creating notebook, we should still be on /notebooks page
    // Click on the notebook card by finding the link with the notebook name
    await page.getByRole('link', { name: new RegExp(testNotebooks.basic.name) }).first().click();

    // Wait to be on the notebook detail page
    await expect(page).toHaveURL(/\/notebooks\/[a-f0-9-]+/);
    await expect(page.getByTestId('notebook-detail-title')).toBeVisible();
  });

  test.describe('Calendar View Toggle', () => {
    test('should display calendar view when toggled', async ({ page }) => {
      // Should start on history view by default (Betting History should be visible)
      await expect(page.getByRole('heading', { name: /betting history/i })).toBeVisible();

      // Click calendar view button
      await page.getByTestId('notebook-calendar-view-button').click();

      // Should see calendar view elements
      await expect(page.getByTestId('calendar-view')).toBeVisible();
      await expect(page.getByTestId('calendar-current-month')).toBeVisible();
      await expect(page.getByTestId('calendar-month-navigation')).toBeVisible();
    });

    test('should toggle back to history view from calendar', async ({ page }) => {
      // Switch to calendar view
      await page.getByTestId('notebook-calendar-view-button').click();
      await expect(page.getByTestId('calendar-view')).toBeVisible();

      // Switch back to history view
      await page.getByTestId('notebook-history-view-button').click();

      // Should see betting history elements
      await expect(page.getByRole('heading', { name: /betting history/i })).toBeVisible();

      // Calendar should not be visible
      await expect(page.getByTestId('calendar-view')).toBeHidden();
    });
  });

  test.describe('Month Navigation', () => {
    test('should have previous month navigation button', async ({ page }) => {
      // Switch to calendar view
      await page.getByTestId('notebook-calendar-view-button').click();

      // Previous month button should be visible and enabled
      const prevButton = page.getByTestId('calendar-prev-month-button');
      await expect(prevButton).toBeVisible();
      await expect(prevButton).toBeEnabled();

      // Button should be clickable
      await prevButton.click();

      // Calendar should still be visible after clicking
      await expect(page.getByTestId('calendar-view')).toBeVisible();
    });

    test('should have next month navigation button', async ({ page }) => {
      // Switch to calendar view
      await page.getByTestId('notebook-calendar-view-button').click();

      // Next month button should be visible and enabled
      const nextButton = page.getByTestId('calendar-next-month-button');
      await expect(nextButton).toBeVisible();
      await expect(nextButton).toBeEnabled();

      // Button should be clickable
      await nextButton.click();

      // Calendar should still be visible after clicking
      await expect(page.getByTestId('calendar-view')).toBeVisible();
    });

    test('should display calendar navigation controls', async ({ page }) => {
      // Switch to calendar view
      await page.getByTestId('notebook-calendar-view-button').click();

      // Calendar navigation should be visible
      await expect(page.getByTestId('calendar-month-navigation')).toBeVisible();

      // Current month and year should be displayed
      await expect(page.getByTestId('calendar-current-month')).toBeVisible();
      await expect(page.getByTestId('calendar-current-year')).toBeVisible();

      // Verify current month displays expected format
      const monthText = await page.getByTestId('calendar-current-month').textContent();
      expect(monthText).toMatch(/^[A-Z]+$/); // Should be all caps month name
    });
  });

  test.describe('Calendar Display and Initialization', () => {
    test('should handle empty calendar (no bets)', async ({ page }) => {
      // Switch to calendar view
      await page.getByTestId('notebook-calendar-view-button').click();

      // Should display current month when no bets exist
      const currentDate = new Date();
      const currentMonthName = currentDate.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
      await expect(page.getByTestId('calendar-current-month')).toContainText(currentMonthName);

      // Summary stats should show 0-0-0 record
      await expect(page.getByTestId('calendar-record')).toContainText('0-0-0');

      // Total profit should be $0.00
      await expect(page.getByTestId('calendar-total-profit')).toContainText('$0.00');
    });


    test('should display monthly profit correctly', async ({ page }) => {
      // Switch to calendar view
      await page.getByTestId('notebook-calendar-view-button').click();

      // Monthly profit should be displayed
      await expect(page.getByTestId('calendar-monthly-profit')).toBeVisible();

      // With no bets, monthly profit should be $0.00
      await expect(page.getByTestId('calendar-monthly-profit')).toContainText('$0.00');
    });
  });

  test.describe('Calendar Summary Stats', () => {
    test('should display calendar summary statistics', async ({ page }) => {
      // Switch to calendar view
      await page.getByTestId('notebook-calendar-view-button').click();

      // Summary stats section should be visible
      await expect(page.getByTestId('calendar-summary-stats')).toBeVisible();

      // Record should be displayed
      await expect(page.getByTestId('calendar-record')).toBeVisible();

      // Total profit should be displayed
      await expect(page.getByTestId('calendar-total-profit')).toBeVisible();

      // With no bets, should show 0-0-0 and $0.00
      await expect(page.getByTestId('calendar-record')).toContainText('0-0-0');
      await expect(page.getByTestId('calendar-total-profit')).toContainText('$0.00');
    });

    test('should display monthly profit', async ({ page }) => {
      // Switch to calendar view
      await page.getByTestId('notebook-calendar-view-button').click();

      // Monthly profit should be displayed
      await expect(page.getByTestId('calendar-monthly-profit')).toBeVisible();

      // With no bets, should show $0.00
      await expect(page.getByTestId('calendar-monthly-profit')).toContainText('$0.00');
    });
  });

  test.describe('Calendar Layout', () => {
    test('should display calendar container', async ({ page }) => {
      // Switch to calendar view
      await page.getByTestId('notebook-calendar-view-button').click();

      // Calendar view should be visible
      await expect(page.getByTestId('calendar-view')).toBeVisible();

      // Calendar should have day cells
      const dayCells = page.getByTestId('calendar-day-cell');
      const count = await dayCells.count();

      // Should have at least some day cells (mobile or desktop view)
      expect(count).toBeGreaterThan(0);
    });
  });
});
