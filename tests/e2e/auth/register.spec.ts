import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { generateTestEmail } from '../../fixtures/helpers';

// Auth tests must NOT use the shared authenticated state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should register successfully and redirect', async ({ page }) => {
    const email = generateTestEmail();
    const password = 'TestPassword123!';

    await page.getByTestId('register-email-input').fill(email);
    await page.getByTestId('register-password-input').fill(password);
    await page.getByTestId('register-confirm-password-input').fill(password);
    await page.getByTestId('register-submit-button').click();

    await expect(page).toHaveURL(/\/(dashboard|login)/);
  });

  test('should handle validation errors', async ({ page }) => {
    // 1. Existing User
    await page.getByTestId('register-email-input').fill(testUsers.validUser.email);
    await page.getByTestId('register-password-input').fill('Pass123!');
    await page.getByTestId('register-confirm-password-input').fill('Pass123!');
    await page.getByTestId('register-submit-button').click();
    await expect(page.getByTestId('register-error-message')).toContainText(/already|exists/i);

    // 2. Password Mismatch (reload to clear state)
    await page.reload();
    await page.getByTestId('register-email-input').fill(generateTestEmail());
    await page.getByTestId('register-password-input').fill('Pass123!');
    await page.getByTestId('register-confirm-password-input').fill('Mismatch!');
    await page.getByTestId('register-submit-button').click();
    await expect(page.getByTestId('register-error-message')).toContainText(/match/i);

    // 3. Required Fields - verify form doesn't submit (stays on register page)
    await page.reload();
    await page.getByTestId('register-submit-button').click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('should allow navigation to login', async ({ page }) => {
    await page.getByTestId('register-login-link').click();
    await expect(page).toHaveURL(/\/login/);
  });
});
