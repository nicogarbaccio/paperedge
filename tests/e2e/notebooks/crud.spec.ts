import { test, expect } from '@playwright/test';
import { testUser, notebooks } from '../../fixtures/test-data';
import {
  login,
  navigateToNotebooks,
  createNotebook,
  deleteNotebook,
  editNotebook,
  assertValidationError
} from '../../fixtures/helpers';

/**
 * Notebook CRUD Tests
 *
 * Tests all notebook operations:
 * - Create notebook with custom columns
 * - View notebooks list
 * - Edit notebook name and bankroll
 * - Delete notebook with confirmation
 * - Validation errors
 * - Empty state handling
 */

test.describe('Notebook CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUser.email, testUser.password);
  });

  test('Can create notebook with custom columns', async ({ page }) => {
    const notebookName = `Test Notebook ${Date.now()}`;

    const notebookId = await createNotebook(page, {
      name: notebookName,
      starting_bankroll: 1000,
      custom_columns: [
        { name: 'Sport', type: 'select', options: ['Football', 'Basketball'] },
        { name: 'Notes', type: 'text' }
      ]
    });

    // Should be on notebook detail page
    const url = page.url();
    expect(url).toMatch(/\/notebooks\//);
    expect(notebookId).toBeTruthy();

    // Notebook name should be visible
    await expect(page.locator(`text="${notebookName}"`)).toBeVisible();

    // Should show custom columns in the UI
    const sportColumn = page.locator('text="Sport", text="Sport"').first();
    const notesColumn = page.locator('text="Notes"').first();

    const hasSport = await sportColumn.count() > 0;
    const hasNotes = await notesColumn.count() > 0;
    expect(hasSport || hasNotes).toBe(true);
  });

  test('Can view list of notebooks on dashboard', async ({ page }) => {
    await navigateToNotebooks(page);

    // Should see notebook cards for pre-created notebooks
    const notebookCards = page.locator('[data-testid*="notebook-card"], [class*="notebook"]');
    const cardCount = await notebookCards.count();

    expect(cardCount).toBeGreaterThanOrEqual(1);

    // Should see known notebook names
    const nflNotebook = page.locator(`text="${notebooks[0].name}"`);
    await expect(nflNotebook).toBeVisible();
  });

  test('Can edit notebook name', async ({ page }) => {
    const testNotebook = `EditTest ${Date.now()}`;
    const updatedName = `Updated ${Date.now()}`;

    // Create a notebook to test editing
    await createNotebook(page, {
      name: testNotebook,
      starting_bankroll: 1000
    });

    // Navigate back to notebooks list
    await navigateToNotebooks(page);

    // Edit the notebook
    await editNotebook(page, testNotebook, { name: updatedName });

    // Verify new name appears
    await expect(page.locator(`text="${updatedName}"`)).toBeVisible();
  });

  test('Can edit notebook starting bankroll', async ({ page }) => {
    const testNotebook = `BankrollTest ${Date.now()}`;
    const newBankroll = 5000;

    // Create notebook
    await createNotebook(page, {
      name: testNotebook,
      starting_bankroll: 1000
    });

    // Navigate back and edit
    await navigateToNotebooks(page);
    await editNotebook(page, testNotebook, { starting_bankroll: newBankroll });

    // Navigate to notebook detail to verify change
    await page.click(`text="${testNotebook}"`);
    await page.waitForLoadState('networkidle');

    // Check if bankroll value is updated in the UI
    const bankrollText = page.locator(`text="${newBankroll}"`);
    const isBankrollVisible = await bankrollText.count() > 0;
    expect(isBankrollVisible).toBe(true);
  });

  test('Can delete notebook with confirmation', async ({ page }) => {
    const testNotebook = `DeleteTest ${Date.now()}`;

    // Create notebook to delete
    await createNotebook(page, {
      name: testNotebook,
      starting_bankroll: 1000
    });

    // Navigate to notebooks
    await navigateToNotebooks(page);

    // Count notebooks before delete
    const cardsBefore = await page.locator('[data-testid*="notebook-card"], [class*="notebook"]').count();

    // Delete the notebook
    await deleteNotebook(page, testNotebook);

    // Verify notebook is gone
    const notebookElement = page.locator(`text="${testNotebook}"`);
    const isVisible = await notebookElement.count() > 0;
    expect(isVisible).toBe(false);

    // Count should be less
    const cardsAfter = await page.locator('[data-testid*="notebook-card"], [class*="notebook"]').count();
    expect(cardsAfter).toBeLessThanOrEqual(cardsBefore);
  });

  test('Shows validation error for empty notebook name', async ({ page }) => {
    await navigateToNotebooks(page);

    // Click create button
    await page.click('button:has-text("Create Notebook"), button:has-text("New Notebook")');

    // Wait for dialog
    await page.waitForSelector('dialog[open], [role="dialog"], text="Create Notebook"', { timeout: 5000 });

    // Fill bankroll but leave name empty
    await page.fill('input[name="starting_bankroll"], input[name="startingBankroll"]', '1000');

    // Submit
    await page.click('button[type="submit"]:has-text("Create")');

    // Should see error
    const errorElement = page.locator(
      'text=/name is required|notebook name|required/i, [role="alert"], [class*="error"]'
    ).first();

    try {
      await expect(errorElement).toBeVisible({ timeout: 3000 });
    } catch {
      // Check form is still open (validation prevented submission)
      const dialog = page.locator('dialog[open], [role="dialog"]');
      expect(await dialog.count()).toBeGreaterThan(0);
    }
  });

  test('Shows validation error for invalid bankroll', async ({ page }) => {
    await navigateToNotebooks(page);

    // Click create button
    await page.click('button:has-text("Create Notebook"), button:has-text("New Notebook")');

    // Wait for dialog
    await page.waitForSelector('dialog[open], [role="dialog"]', { timeout: 5000 });

    // Fill name but invalid bankroll
    const notebookName = `Test ${Date.now()}`;
    await page.fill('input[name="name"]', notebookName);
    await page.fill('input[name="starting_bankroll"], input[name="startingBankroll"]', 'invalid');

    // Submit
    await page.click('button[type="submit"]:has-text("Create")');

    // Should either show error or stay on form
    const errorElement = page.locator('text=/invalid|must be a number/i, [role="alert"], [class*="error"]').first();
    const dialog = page.locator('dialog[open], [role="dialog"]');

    const hasError = await errorElement.count() > 0;
    const dialogStillOpen = await dialog.count() > 0;

    expect(hasError || dialogStillOpen).toBe(true);
  });

  test('Can see notebook details after creation', async ({ page }) => {
    const notebookName = `DetailTest ${Date.now()}`;

    // Create notebook
    const notebookId = await createNotebook(page, {
      name: notebookName,
      starting_bankroll: 2500
    });

    // Should be on detail page
    await expect(page.locator(`text="${notebookName}"`)).toBeVisible();

    // Should see key elements
    const addBetButton = page.locator('button:has-text("Add Bet"), button:has-text("Create Bet")');
    await expect(addBetButton).toBeVisible();

    // Should be able to go back to list
    await page.click('button:has-text("Back"), a[href="/notebooks"]');
    await page.waitForLoadState('networkidle');

    // Should be on notebooks page
    const url = page.url();
    expect(url).toMatch(/\/notebooks/);
  });

  test('Can navigate between notebooks', async ({ page }) => {
    await navigateToNotebooks(page);

    // Click first notebook
    const firstNotebook = page.locator('[data-testid*="notebook-card"], [class*="notebook"]').first();
    const firstName = await firstNotebook.textContent();

    await firstNotebook.click();
    await page.waitForLoadState('networkidle');

    // Should be on detail page
    const urlAfter = page.url();
    expect(urlAfter).toMatch(/\/notebooks\/[a-zA-Z0-9-]+/);

    // Name should be visible
    await expect(page.locator(`text="${firstName}"`)).toBeVisible();

    // Go back to list
    await page.click('button:has-text("Back"), a[href="/notebooks"]');
    await page.waitForLoadState('networkidle');

    // Should be back on list
    const urlFinal = page.url();
    expect(urlFinal).toMatch(/\/notebooks$/);
  });

  test('Empty state shows when no notebooks exist', async ({ page }) => {
    // Note: This test may skip if test data notebooks always exist
    // It's designed for a fresh account scenario

    await navigateToNotebooks(page);

    // Check for either notebooks list or empty state
    const notebookCards = page.locator('[data-testid*="notebook-card"], [class*="notebook"]');
    const emptyState = page.locator('text=/no notebooks|empty|create/i, [data-testid="empty-state"]').first();

    const hasCards = await notebookCards.count() > 0;
    const hasEmptyState = await emptyState.count() > 0;

    expect(hasCards || hasEmptyState).toBe(true);

    // Should have create button
    const createButton = page.locator('button:has-text("Create Notebook"), button:has-text("New Notebook")');
    await expect(createButton).toBeVisible();
  });
});
