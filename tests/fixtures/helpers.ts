/**
 * Test helper functions for PaperEdge E2E tests
 *
 * These helpers provide reusable functionality across test suites.
 */

import { Page, expect } from '@playwright/test';
import { testUsers } from './test-data';

/**
 * Login helper - logs in a user and waits for successful navigation
 */
export async function loginUser(
  page: Page,
  credentials: { email: string; password: string } = testUsers.validUser
) {
  await page.goto('/login');

  await page.getByTestId('login-email-input').fill(credentials.email);
  await page.getByTestId('login-password-input').fill(credentials.password);
  await page.getByTestId('login-submit-button').click();

  // Wait for successful login by checking URL change to dashboard
  // Increased timeout to handle slow dashboard loads with accumulated test data
  await page.waitForURL('**/dashboard', { timeout: 30000 });

  // Verify we're on the dashboard
  await expect(page).toHaveURL(/\/dashboard/);
}

/**
 * Logout helper - logs out the current user
 */
export async function logoutUser(page: Page) {
  // Click user menu
  await page.getByTestId('header-user-menu-button').click();

  // Wait for menu to be visible
  await expect(page.getByTestId('header-user-menu')).toBeVisible();

  // Click logout
  await page.getByTestId('header-logout-button').click();

  // Wait for redirect to login page
  await page.waitForURL('**/login', { timeout: 5000 });
  await expect(page).toHaveURL(/\/login/);
}

/**
 * Register a new user and return to login page
 */
export async function registerUser(
  page: Page,
  credentials: { email: string; password: string } = testUsers.validUser
) {
  await page.goto('/register');

  await page.getByTestId('register-email-input').fill(credentials.email);
  await page.getByTestId('register-password-input').fill(credentials.password);
  await page.getByTestId('register-confirm-password-input').fill(credentials.password);
  await page.getByTestId('register-submit-button').click();

  // Wait for successful registration (either redirect or success message)
  await expect(page).toHaveURL(/\/(dashboard|login)/, { timeout: 10000 });
}

/**
 * Clear all test data for a clean slate
 * This should be called in beforeEach or afterEach hooks
 */
export async function clearTestData(page: Page) {
  // For now, this is a no-op to avoid page navigation issues in beforeEach
  // Each test will start fresh due to Playwright's isolated browser contexts
  // TODO: Implement proper cleanup via Supabase API if needed
}

/**
 * Wait for toast notification and verify its content
 */
export async function waitForToast(
  page: Page,
  expectedText: string,
  variant: 'success' | 'error' = 'success'
) {
  const toastSelector = variant === 'success' ? 'toast-success' : 'toast-error';
  const toast = page.getByTestId(toastSelector);

  await expect(toast).toBeVisible({ timeout: 5000 });
  await expect(toast).toContainText(expectedText);

  // Optionally wait for toast to disappear
  await expect(toast).toBeHidden({ timeout: 10000 });
}

/**
 * Fill out a form and submit it
 */
export async function fillForm(
  page: Page,
  fields: Record<string, string>,
  submitButtonTestId: string
) {
  for (const [testId, value] of Object.entries(fields)) {
    await page.getByTestId(testId).fill(value);
  }

  await page.getByTestId(submitButtonTestId).click();
}

/**
 * Check if user is authenticated by verifying dashboard access
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  await page.goto('/dashboard');

  try {
    // If we're redirected to login, user is not authenticated
    await page.waitForURL('**/login', { timeout: 2000 });
    return false;
  } catch {
    // If we stay on dashboard, user is authenticated
    return page.url().includes('/dashboard');
  }
}

/**
 * Wait for element to be visible with custom timeout
 */
export async function waitForElement(
  page: Page,
  testId: string,
  timeout: number = 5000
) {
  const element = page.getByTestId(testId);
  await expect(element).toBeVisible({ timeout });
  return element;
}

/**
 * Create a notebook with given data
 */
export async function createNotebook(
  page: Page,
  notebookData: {
    name: string;
    description?: string;
    color?: string;
    starting_bankroll?: number;
  }
) {
  await page.goto('/notebooks');

  await page.getByTestId('create-notebook-button').click();

  // Wait for dialog to be visible
  await expect(page.getByTestId('create-notebook-dialog')).toBeVisible();

  // Fill in notebook details
  await page.getByTestId('notebook-name-input').fill(notebookData.name);

  if (notebookData.description) {
    await page.getByTestId('notebook-description-input').fill(notebookData.description);
  }

  if (notebookData.starting_bankroll) {
    await page.getByTestId('notebook-starting-bankroll-input').fill(
      notebookData.starting_bankroll.toString()
    );
  }

  if (notebookData.color) {
    await page.getByTestId(`notebook-color-${notebookData.color}`).click();
  }

  // Submit
  await page.getByTestId('notebook-save-button').click();

  // Wait for dialog to close
  await expect(page.getByTestId('create-notebook-dialog')).toBeHidden({ timeout: 5000 });
}

/**
 * Create a bet within a notebook
 */
export async function createBet(
  page: Page,
  notebookId: string,
  betData: {
    description: string;
    odds: number;
    wager_amount: number;
    date?: string;
  }
) {
  await page.goto(`/notebooks/${notebookId}`);

  await page.getByTestId('create-bet-button').click();

  // Wait for dialog
  await expect(page.getByTestId('create-bet-dialog')).toBeVisible();

  // Fill in bet details
  await page.getByTestId('bet-description-input').fill(betData.description);
  await page.getByTestId('bet-odds-input').fill(betData.odds.toString());
  await page.getByTestId('bet-wager-input').fill(betData.wager_amount.toString());

  if (betData.date) {
    await page.getByTestId('bet-date-input').fill(betData.date);
  }

  // Submit
  await page.getByTestId('bet-save-button').click();

  // Wait for dialog to close
  await expect(page.getByTestId('create-bet-dialog')).toBeHidden({ timeout: 5000 });
}

/**
 * Generate random email for testing
 */
export function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test-${timestamp}-${random}@paperedge.test`;
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 10): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Wait for specified milliseconds
 */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
