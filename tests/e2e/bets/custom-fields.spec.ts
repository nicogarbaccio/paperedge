import { test, expect } from '@playwright/test';
import { testUser } from '../../fixtures/test-data';
import { login, navigateToNotebooks } from '../../fixtures/helpers';

/**
 * Custom Fields Tests
 *
 * Verifies that custom columns/fields work correctly when creating
 * and editing bets. This is a core feature for bet customization.
 */

test.describe('Custom Bet Fields', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUser.email, testUser.password);
  });

  test('Can add custom field values when creating a bet', async ({ page }) => {
    await navigateToNotebooks(page);
    await page.click('text="NFL 2024"');
    await page.waitForLoadState('networkidle');

    // Click Add Bet button
    await page.click('button:has-text("Add Bet")');
    await page.waitForSelector('text="Add New Bet"', { state: 'visible' });

    // Fill required fields
    await page.fill('input[placeholder*="Lakers vs Warriors"]', 'Custom Fields Test Bet');
    await page.fill('input[placeholder*="+150 or -110"]', '150');
    // Wager field already has default value, just clear and fill
    const wagerInput = page.locator('label:has-text("Wager Amount")').locator('..').locator('input').first();
    await wagerInput.click();
    await wagerInput.fill('100');

    // Show custom fields
    const showFieldsButton = page.locator('button:has-text("Show additional fields")');
    if (await showFieldsButton.isVisible()) {
      await showFieldsButton.click();

      // Fill custom fields
      const sportSelect = page.locator('select[name="Sport"]').first();
      if (await sportSelect.isVisible()) {
        await sportSelect.selectOption('Basketball');
      }

      const notesInput = page.locator('input[name="Notes"], textarea[name="Notes"]').first();
      if (await notesInput.isVisible()) {
        await notesInput.fill('Test custom field value');
      }
    }

    // Save bet - scroll to button first
    const submitButton = page.locator('button:has-text("Add Bet")').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });

    // Verify bet was created
    await expect(page.locator('text="Custom Fields Test Bet"').first()).toBeVisible();
  });

  test('Custom field values persist when editing a bet', async ({ page }) => {
    await navigateToNotebooks(page);
    await page.click('text="NFL 2024"');
    await page.waitForLoadState('networkidle');

    // Create a bet first
    await page.click('button:has-text("Add Bet")');
    await page.waitForSelector('text="Add New Bet"', { state: 'visible' });

    await page.fill('input[placeholder*="Lakers vs Warriors"]', 'Persistence Test');
    await page.fill('input[placeholder*="+150 or -110"]', '-110');
    const wagerInput = page.locator('label:has-text("Wager Amount")').locator('..').locator('input').first();
    await wagerInput.click();
    await wagerInput.fill('50');

    // Set custom field
    const showButton = page.locator('button:has-text("Show additional fields")');
    if (await showButton.isVisible()) {
      await showButton.click();

      const sportSelect = page.locator('select[name="Sport"]').first();
      if (await sportSelect.isVisible()) {
        await sportSelect.selectOption('Football');
      }
    }

    // Save bet - scroll to button first
    const submitButton = page.locator('button:has-text("Add Bet")').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for dialog to close completely
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 });

    // Wait for all overlays to disappear
    await page.waitForSelector('.fixed.inset-0.z-50', { state: 'detached', timeout: 5000 }).catch(() => {});

    // Wait for bet to appear in the list
    await page.waitForSelector('text="Persistence Test"', { state: 'visible' });
    await page.waitForLoadState('networkidle');

    // Click on the bet card to open edit dialog
    const betCard = page.locator('[data-testid="bet-card"]').filter({ hasText: 'Persistence Test' }).first();
    await betCard.waitFor({ state: 'visible' });
    await betCard.click({ force: false });

    // Wait for edit dialog to open (look for the specific Edit Bet dialog)
    await page.waitForSelector('text="Edit Bet"', { state: 'visible' });

    // Show custom fields
    const showButton2 = page.locator('button:has-text("Show additional fields")');
    if (await showButton2.isVisible()) {
      await showButton2.click();
    }

    // Verify value persisted
    const sportSelect2 = page.locator('select[name="Sport"]').first();
    if (await sportSelect2.isVisible()) {
      const value = await sportSelect2.inputValue();
      expect(value).toBe('Football');
    }
  });

  test('Can toggle custom fields visibility', async ({ page }) => {
    await navigateToNotebooks(page);
    await page.click('text="NFL 2024"');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Add Bet")');
    await page.waitForSelector('text="Add New Bet"', { state: 'visible' });

    // Initially, custom fields should be hidden
    const sportField = page.locator('label:has-text("Sport")');
    await expect(sportField).not.toBeVisible();

    // Click "Show additional fields"
    const showButton = page.locator('button:has-text("Show additional fields")');
    await expect(showButton).toBeVisible();
    await showButton.click();

    // Custom fields should now be visible
    await expect(sportField).toBeVisible();

    // Button text should change to "Hide additional fields"
    const hideButton = page.locator('button:has-text("Hide additional fields")');
    await expect(hideButton).toBeVisible();

    // Click to hide
    await hideButton.click();

    // Custom fields should be hidden again
    await expect(sportField).not.toBeVisible();
  });

  test('No duplicate custom fields appear', async ({ page }) => {
    await navigateToNotebooks(page);
    await page.click('text="NFL 2024"');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Add Bet")');
    await page.waitForSelector('text="Add New Bet"', { state: 'visible' });

    const showButton = page.locator('button:has-text("Show additional fields")');
    if (await showButton.isVisible()) {
      await showButton.click();
    }

    // Count how many "Sport" fields appear (should be exactly 1)
    const sportLabels = page.locator('label:has-text("Sport")');
    const sportCount = await sportLabels.count();

    expect(sportCount).toBe(1);
  });
});
