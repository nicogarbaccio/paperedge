import { test, expect } from '@playwright/test';
import { generateRandomString } from '../../fixtures/helpers';

test.describe('Notebook CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notebooks');
  });

  test('should manage notebook lifecycle (Create, Edit, Delete)', async ({ page }) => {
    const notebookName = `CRUD Test ${generateRandomString()}`;

    // 1. CREATE
    await page.getByTestId('create-notebook-button').first().click();
    await page.getByTestId('notebook-name-input').fill(notebookName);
    await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
    await page.getByTestId('notebook-color-blue').click();
    await page.getByTestId('notebook-save-button').click();

    await expect(page.getByTestId('notebook-card-title').filter({ hasText: notebookName })).toBeVisible();

    // 2. EDIT
    await page.getByRole('link', { name: notebookName }).first().click();
    await page.getByTestId('edit-notebook-button').click();

    const updatedName = `${notebookName} Updated`;
    await page.getByTestId('edit-notebook-name-input').fill(updatedName);
    await page.getByTestId('edit-notebook-save-button').click();

    await expect(page.getByTestId('notebook-detail-title')).toHaveText(updatedName);

    // 3. DELETE
    await page.getByTestId('delete-notebook-button').click();
    await page.getByTestId('confirm-dialog-confirm-button').click();

    await expect(page).toHaveURL(/\/notebooks/);
  });

  test('should validate notebook creation', async ({ page }) => {
    await page.getByTestId('create-notebook-button').first().click();

    // Try submit empty - dialog should stay open (form didn't submit)
    await page.getByTestId('notebook-save-button').click();
    await expect(page.getByTestId('create-notebook-dialog')).toBeVisible();

    // Cancel should work
    await page.getByTestId('notebook-cancel-button').click();
    await expect(page.getByTestId('create-notebook-dialog')).not.toBeVisible();
  });
});
