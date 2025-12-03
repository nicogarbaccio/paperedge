import { test, expect } from '@playwright/test';
import { testUsers } from '../../fixtures/test-data';
import { generateTestEmail } from '../../fixtures/helpers';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should successfully login and redirect to dashboard', async ({ page }) => {
    await page.getByTestId('login-email-input').fill(testUsers.validUser.email);
    await page.getByTestId('login-password-input').fill(testUsers.validUser.password);
    await page.getByTestId('login-submit-button').click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId('dashboard-page-title')).toBeVisible();
  });

  test('should navigate to related auth pages', async ({ page }) => {
    // Check Register link
    await page.getByTestId('login-register-link').click();
    await expect(page).toHaveURL(/\/register/);
    await page.goBack();

    // Check Forgot Password (inline flow)
    await page.getByTestId('login-email-input').fill(generateTestEmail());
    await page.getByTestId('login-forgot-password-link').click();
    await expect(page.getByTestId('login-reset-sent-message')).toBeVisible({ timeout: 10000 });
  });

  test('should handle validation and errors', async ({ page }) => {
    // Empty fields
    await page.getByTestId('login-submit-button').click();
    const emailInput = page.getByTestId('login-email-input');
    expect(await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage)).toBeTruthy();

    // Invalid credentials
    await page.getByTestId('login-email-input').fill(testUsers.validUser.email);
    await page.getByTestId('login-password-input').fill('WrongPass!');
    await page.getByTestId('login-submit-button').click();
    await expect(page.getByTestId('login-error-message')).toContainText(/invalid|incorrect|wrong/i);
  });
});
