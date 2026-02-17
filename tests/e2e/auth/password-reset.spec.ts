import { test, expect } from '@playwright/test';

// Auth tests must NOT use the shared authenticated state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Reset Password Page', () => {
  test('should handle invalid link state correctly', async ({ page }) => {
    await page.goto('/reset-password');

    // Should show invalid link message since we have no token
    await expect(page.getByTestId('reset-password-invalid-link-message')).toContainText(/invalid or expired/i);
    
    // Form should be visible but disabled
    await expect(page.getByTestId('new-password-input')).toBeVisible();
    await expect(page.getByTestId('new-password-submit-button')).toBeDisabled();

    // Should be able to navigate back
    await page.getByTestId('reset-password-back-to-login-link').click();
    await expect(page).toHaveURL(/\/login/);
  });
});
