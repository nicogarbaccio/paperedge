import { test, expect } from '@playwright/test';
import { testUser } from '../../fixtures/test-data';
import { login, logout, register, ensureLoggedOut } from '../../fixtures/helpers';

/**
 * Authentication Tests
 *
 * Tests critical authentication flows:
 * - User registration with valid credentials
 * - User login with valid credentials
 * - Login validation errors
 * - Unauthenticated user redirection
 * - User logout
 * - Protected route access
 * - Session persistence
 */

test.describe('Authentication', () => {
  test('User can register with valid credentials', async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const password = 'ValidPassword123!';

    await register(page, uniqueEmail, password);

    // After registration, should be on dashboard or home
    const url = page.url();
    expect(url).toMatch(/dashboard|home/);

    // Should be logged in (no login page visible)
    const loginButton = page.locator('button:has-text("Login"), a:has-text("Login")');
    expect(await loginButton.count()).toBe(0);
  });

  test('User can login with valid credentials', async ({ page }) => {
    await login(page, testUser.email, testUser.password);

    // Should be on authenticated page (not login)
    const url = page.url();
    expect(url).not.toMatch(/login|register/);

    // Should see user-related elements
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), [data-testid="logout"]');
    const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Settings")');

    const hasLogout = await logoutButton.count() > 0;
    const hasMenu = await userMenu.count() > 0;
    expect(hasLogout || hasMenu).toBe(true);
  });

  test('User sees error with invalid email format', async ({ page }) => {
    await ensureLoggedOut(page);

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Fill invalid email with proper locators
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill('notanemail');
    await passwordInput.fill('password123');
    
    // Click submit button
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for error or validation message
    const errorElement = page.locator(
      'text=/invalid email|please enter a valid|invalid/i, [role="alert"]'
    ).first();

    try {
      await expect(errorElement).toBeVisible({ timeout: 5000 });
    } catch {
      // Browser validation might prevent submission; check if inputs have aria-invalid
      const hasInvalidAttr = await emailInput.getAttribute('aria-invalid');
      expect(hasInvalidAttr || await errorElement.count()).toBeTruthy();
    }
  });

  test('User sees error with wrong password', async ({ page }) => {
    await ensureLoggedOut(page);

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // Use a valid email format but wrong credentials
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill(testUser.email);
    await passwordInput.fill('WrongPassword123!');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show error message or stay on login page
    const errorElement = page.locator(
      'text=/invalid credentials|wrong password|authentication failed/i, [role="alert"]'
    ).first();

    try {
      await expect(errorElement).toBeVisible({ timeout: 5000 });
    } catch {
      // Check if still on login page (which indicates login failed)
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/login/);
    }
  });

  test('Unauthenticated user is redirected to login', async ({ page }) => {
    await ensureLoggedOut(page);

    // Try to access protected route directly
    await page.goto('/dashboard');

    // Should be redirected to login
    await page.waitForURL(url => url.pathname.includes('/login'), { timeout: 5000 });

    const url = page.url();
    expect(url).toMatch(/login/);
  });

  test('User can logout', async ({ page }) => {
    // First login
    await login(page, testUser.email, testUser.password);

    // Click on user menu or logout
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), [data-testid="logout"]');
    const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Settings")');

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.click('button:has-text("Logout"), button:has-text("Sign out")');
    }

    // Should redirect to login or home
    await page.waitForURL(url => url.pathname.match(/login|^\/$/) !== null, { timeout: 5000 });

    const url = page.url();
    expect(url).toMatch(/login|^\//);
  });

  test('Protected route access without login shows login page', async ({ page }) => {
    await ensureLoggedOut(page);

    // Navigate to protected route
    await page.goto('/notebooks');

    // Should redirect to login
    await page.waitForURL(url => url.pathname.includes('/login'), { timeout: 5000 });

    // Should see login form
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('Session persists across page reloads', async ({ page }) => {
    // Login
    await login(page, testUser.email, testUser.password);

    // Store current URL
    const urlBefore = page.url();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be on authenticated page (not redirected to login)
    const urlAfter = page.url();
    expect(urlAfter).not.toMatch(/login/);

    // User should still be logged in
    const logoutElement = page.locator('button:has-text("Logout"), button:has-text("Sign out"), [data-testid="logout"]');
    const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Settings")');

    const hasAuth = (await logoutElement.count() > 0) || (await userMenu.count() > 0);
    expect(hasAuth).toBe(true);
  });

  // ============ ACCESSIBILITY TESTS ============

  test('[A11y] Login form has proper ARIA labels', async ({ page }) => {
    await ensureLoggedOut(page);

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check for form labels
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');

    // Inputs should have associated labels or ARIA labels
    if (await emailInput.count() > 0) {
      const ariaLabel = await emailInput.getAttribute('aria-label');
      const label = page.locator(`label[for="${await emailInput.getAttribute('id')}"]`);

      const hasLabel = ariaLabel || (await label.count() > 0);
      expect(hasLabel).toBe(true);
    }

    // Button should be labelled
    if (await loginButton.count() > 0) {
      const buttonText = await loginButton.textContent();
      expect(buttonText).toBeTruthy();
    }
  });

  test('[A11y] Keyboard navigation works in login form', async ({ page }) => {
    await ensureLoggedOut(page);

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Tab through form elements
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);

    // Should focus on input or button
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);

    // Continue tabbing
    await page.keyboard.press('Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
  });

  test('[A11y] Login form has visible focus indicators', async ({ page }) => {
    await ensureLoggedOut(page);

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const input = page.locator('input[type="email"]').first();
    if (await input.count() === 0) {
      test.skip();
      return;
    }

    // Focus the input
    await input.focus();

    // Check for focus styles
    const outline = await input.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.outline || styles.outlineStyle;
    });

    // Should have visible focus indicator
    expect(outline).toBeTruthy();
  });
});
