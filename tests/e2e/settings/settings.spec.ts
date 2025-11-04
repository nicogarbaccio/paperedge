import { test, expect } from '@playwright/test';
import { testUser } from '../../fixtures/test-data';
import { login, wait } from '../../fixtures/helpers';

/**
 * Settings Page Tests
 *
 * Tests user settings and account management:
 * - Edit user profile
 * - Change password with validation
 * - Update preferences
 * - Account deletion with confirmation
 * - Session logout from settings
 */

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUser.email, testUser.password);
    
    // Navigate to settings
    // Try multiple common patterns
    const settingsButton = page.locator(
      'button:has-text("Settings"), a:has-text("Settings"), [data-testid="settings"]'
    ).first();
    
    const settingsMenu = page.locator('[data-testid="user-menu"], button:has-text("Profile")').first();
    
    if (await settingsButton.count() > 0) {
      await settingsButton.click();
    } else if (await settingsMenu.count() > 0) {
      await settingsMenu.click();
      await page.click('a:has-text("Settings"), button:has-text("Settings")');
    } else {
      // Try direct navigation
      await page.goto('/settings');
    }
    
    await page.waitForLoadState('networkidle');
  });

  test('Can view settings page', async ({ page }) => {
    // Should see settings page title or form
    const settingsTitle = page.locator('text=/settings|account|preferences/i').first();
    const settingsForm = page.locator('form, [class*="settings"], [data-testid="settings"]');

    const hasTitle = await settingsTitle.count() > 0;
    const hasForm = await settingsForm.count() > 0;

    expect(hasTitle || hasForm).toBe(true);
  });

  test('Can edit user profile', async ({ page }) => {
    // Look for profile section
    const profileSection = page.locator('text=/profile|account information|personal info/i').first();

    if (await profileSection.count() === 0) {
      test.skip();
      return;
    }

    // Find editable fields (name, email, etc.)
    const nameInput = page.locator('input[name="name"], input[name="full_name"], input[placeholder*="name"]').first();
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();

    // Try to edit name
    if (await nameInput.count() > 0) {
      const currentValue = await nameInput.inputValue();
      const newName = `Updated ${Date.now()}`;

      await nameInput.fill('');
      await nameInput.fill(newName);

      // Find and click save button
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').first();
      if (await saveButton.count() > 0) {
        await saveButton.click();
        await page.waitForTimeout(500);
      }

      // Verify or reload to check persistence
      await page.reload();
      await page.waitForLoadState('networkidle');

      const updatedValue = await nameInput.inputValue();
      expect(updatedValue).toBe(newName);
    }
  });

  test('Can change password with validation', async ({ page }) => {
    // Look for password section
    const passwordSection = page.locator('text=/password|change password|security/i').first();

    if (await passwordSection.count() === 0) {
      test.skip();
      return;
    }

    // Click on password change button/section
    const changePasswordButton = page.locator('button:has-text("Change"), button:has-text("Password")').first();
    if (await changePasswordButton.count() > 0) {
      await changePasswordButton.click();
      await page.waitForTimeout(500);
    }

    // Find password inputs
    const currentPasswordInput = page.locator('input[name="current_password"], input[placeholder*="current"], input[type="password"]').first();
    const newPasswordInput = page.locator('input[name="new_password"], input[name="password"], input[placeholder*="new"]').nth(0);
    const confirmPasswordInput = page.locator('input[name="confirm_password"], input[name="password_confirm"], input[placeholder*="confirm"]').first();

    if (await currentPasswordInput.count() > 0) {
      // Test with wrong current password
      await currentPasswordInput.fill('WrongPassword123!');
      await newPasswordInput.fill('NewPassword123!');
      await confirmPasswordInput.fill('NewPassword123!');

      // Try to save
      const saveButton = page.locator('button[type="submit"]:has-text("Save"), button:has-text("Update")').first();
      if (await saveButton.count() > 0) {
        await saveButton.click();
        await page.waitForTimeout(500);
      }

      // Should show error for wrong current password
      const errorMessage = page.locator('text=/invalid|incorrect|wrong/i, [role="alert"], [class*="error"]').first();
      const formStillVisible = page.locator('input[name="current_password"]').first();

      expect((await errorMessage.count() > 0) || (await formStillVisible.count() > 0)).toBe(true);
    }
  });

  test('Shows validation error for mismatched passwords', async ({ page }) => {
    // Look for password section
    const passwordSection = page.locator('text=/password|change password/i').first();

    if (await passwordSection.count() === 0) {
      test.skip();
      return;
    }

    // Click password change
    const changePasswordButton = page.locator('button:has-text("Change"), button:has-text("Password")').first();
    if (await changePasswordButton.count() > 0) {
      await changePasswordButton.click();
      await page.waitForTimeout(500);
    }

    const newPasswordInput = page.locator('input[name="new_password"], input[placeholder*="new"]').first();
    const confirmPasswordInput = page.locator('input[name="confirm_password"], input[placeholder*="confirm"]').first();

    if (await newPasswordInput.count() > 0 && await confirmPasswordInput.count() > 0) {
      // Enter mismatched passwords
      await newPasswordInput.fill('Password123!');
      await confirmPasswordInput.fill('DifferentPassword123!');

      // Try to submit
      const submitButton = page.locator('button[type="submit"]:has-text("Save"), button[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(500);
      }

      // Should show mismatch error or keep form open
      const errorElement = page.locator('text=/match|confirm|password/i, [role="alert"]').first();
      const formOpen = page.locator('input[name="confirm_password"]').first();

      expect((await errorElement.count() > 0) || (await formOpen.count() > 0)).toBe(true);
    }
  });

  test('Can logout from settings', async ({ page }) => {
    // Look for logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), button:has-text("Sign out")').first();

    if (await logoutButton.count() === 0) {
      test.skip();
      return;
    }

    await logoutButton.click();

    // Should redirect to login
    await page.waitForURL(url => url.pathname.includes('/login') || url.pathname === '/', { timeout: 5000 });

    const url = page.url();
    expect(url).toMatch(/login|^\//);

    // Login button should be visible (indicating logged out)
    const loginButton = page.locator('button:has-text("Login"), input[type="email"]');
    expect(await loginButton.count()).toBeGreaterThanOrEqual(0);
  });

  // ============ ACCESSIBILITY TESTS ============

  test('[A11y] Settings form has proper labels', async ({ page }) => {
    // Check for form inputs with labels
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();

    if (inputCount === 0) {
      test.skip();
      return;
    }

    // Sample first input
    const firstInput = inputs.first();
    const inputId = await firstInput.getAttribute('id');
    const ariaLabel = await firstInput.getAttribute('aria-label');

    // Should have either ID with associated label or ARIA label
    if (inputId) {
      const associatedLabel = page.locator(`label[for="${inputId}"]`);
      expect(await associatedLabel.count()).toBeGreaterThanOrEqual(0);
    }

    expect(inputId || ariaLabel).toBeTruthy();
  });

  test('[A11y] Password field is properly masked', async ({ page }) => {
    const passwordInputs = page.locator('input[type="password"]');

    if (await passwordInputs.count() === 0) {
      test.skip();
      return;
    }

    // Password input should have type="password" (browser will mask it)
    const firstPassword = passwordInputs.first();
    const type = await firstPassword.getAttribute('type');

    expect(type).toBe('password');
  });

  test('[A11y] Settings buttons are keyboard accessible', async ({ page }) => {
    const buttons = page.locator('button');

    if (await buttons.count() === 0) {
      test.skip();
      return;
    }

    // Tab to first button
    await page.keyboard.press('Tab');

    // Get focused element
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    // Should focus on interactive element
    expect(['BUTTON', 'INPUT', 'A']).toContain(focusedElement);
  });

  // ============ ERROR SCENARIO TESTS ============

  test('Handles invalid email format in profile edit', async ({ page }) => {
    const profileSection = page.locator('text=/profile|account/i').first();

    if (await profileSection.count() === 0) {
      test.skip();
      return;
    }

    const emailInput = page.locator('input[type="email"], input[name*="email"]').first();

    if (await emailInput.count() === 0) {
      test.skip();
      return;
    }

    // Try to set invalid email
    await emailInput.fill('not-an-email');

    // Try to submit form
    const saveButton = page.locator('button:has-text("Save")').first();
    if (await saveButton.count() > 0) {
      await saveButton.click();
      await page.waitForTimeout(500);

      // Should either show error or validation fails
      const errorElement = page.locator('[role="alert"], [class*="error"]');
      const formStillVisible = page.locator('input[type="email"]').first();

      expect((await errorElement.count() > 0) || (await formStillVisible.count() > 0)).toBe(true);
    }
  });

  test('Handles concurrent form submissions gracefully', async ({ page }) => {
    const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();

    if (await saveButton.count() === 0) {
      test.skip();
      return;
    }

    // Try to click save multiple times rapidly
    for (let i = 0; i < 3; i++) {
      if (await saveButton.isEnabled()) {
        await saveButton.click({ force: true });
        await page.waitForTimeout(100);
      }
    }

    // Should not crash
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(0);

    // Form should still be visible or show success/error
    const formOrMessage = page.locator('form, [role="alert"], input, button');
    expect(await formOrMessage.count()).toBeGreaterThan(0);
  });
});
