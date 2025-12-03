import { test, expect } from '@playwright/test';
import { loginUser } from '../../fixtures/helpers';
import { testUsers, testNotebooks, successMessages } from '../../fixtures/test-data';

test.describe('Notebook CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page, testUsers.validUser);
    await page.goto('/notebooks');
  });

  test('should manage notebook lifecycle (Create, Edit, Delete)', async ({ page }) => {
    // 1. CREATE
    await page.getByTestId('create-notebook-button').first().click();
    await page.getByTestId('notebook-name-input').fill(testNotebooks.basic.name);
    await page.getByTestId('notebook-starting-bankroll-input').fill(testNotebooks.basic.starting_bankroll.toString());
    await page.getByTestId(`notebook-color-${testNotebooks.basic.color}`).click();
    await page.getByTestId('notebook-save-button').click();
    
    await expect(page.getByText(successMessages.notebook.created).first()).toBeVisible();
    await expect(page.getByTestId('notebook-card-title').filter({ hasText: testNotebooks.basic.name }).first()).toBeVisible();

    // 2. EDIT
    // Navigate to detail to edit
    await page.getByRole('link', { name: new RegExp(testNotebooks.basic.name) }).first().click();
    await page.getByTestId('edit-notebook-button').click();
    
    const updatedName = `${testNotebooks.basic.name} Updated`;
    await page.getByTestId('edit-notebook-name-input').fill(updatedName);
    await page.getByTestId('edit-notebook-save-button').click();
    
    await expect(page.getByTestId('notebook-detail-title')).toHaveText(updatedName);

    // 3. DELETE
    await page.getByTestId('delete-notebook-button').click();
    // Confirm deletion dialog
    await page.getByRole('button', { name: /delete/i }).last().click();
    
    // Should be back on list and notebook should be gone (or toast visible)
    await expect(page).toHaveURL(/\/notebooks/);
    await expect(page.getByText(successMessages.notebook.deleted).first()).toBeVisible();
  });

  test('should validate notebook creation', async ({ page }) => {
    await page.getByTestId('create-notebook-button').first().click();
    
    // Try submit empty
    await page.getByTestId('notebook-save-button').click();
    
    // Browser validation check for required field
    const nameInput = page.getByTestId('notebook-name-input');
    const validationMessage = await nameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
    
    // Cancel should work
    await page.getByTestId('notebook-cancel-button').click();
    await expect(page.getByTestId('create-notebook-dialog')).not.toBeVisible();
  });
});
