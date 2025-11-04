import { Page, expect } from '@playwright/test';
import type { TestNotebook, TestBet } from './test-data';

/**
 * Authentication helpers
 */
export async function login(page: Page, email: string, password: string) {
  // Check if already logged in
  const isLoggedIn = await page.locator('button:has-text("Sign Out")').or(page.locator('text=/notebooks|dashboard/i')).count() > 0;

  if (!isLoggedIn) {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    // Wait for auth page to load with better selectors
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });

    // Fill in credentials with proper typing
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill(email);
    await passwordInput.fill(password);

    // Click the submit button - find it more reliably
    const submitButton = page.locator('button[type="submit"]:has-text("Sign In"), button:has-text("Sign In")').first();
    await submitButton.click();

    // Wait for navigation away from login page (more flexible than specific URL)
    try {
      await page.waitForURL(url => !url.pathname.includes('/login') && !url.pathname.includes('/register'), { timeout: 15000 });
    } catch (error) {
      // Check if there's an error message on the page
      const errorMessage = await page.locator('text=/invalid|error|wrong|failed/i').first().textContent().catch(() => null);
      if (errorMessage) {
        throw new Error(`Login failed: ${errorMessage}. Make sure test user exists (see tests/SETUP.md)`);
      }
      throw error;
    }

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  }
}

export async function logout(page: Page) {
  // Check if already logged out by looking for Sign Out button
  const hasSignOut = await page.locator('button:has-text("Sign Out")').count();

  if (hasSignOut === 0) {
    // Already logged out
    return;
  }

  // Click user menu button (the button with email address containing @)
  const userButton = page.locator('button:has-text("@")').first();
  await userButton.click();

  // Wait a bit for menu animation, then click the visible Sign Out button
  await page.waitForTimeout(500);

  // Find the visible Sign Out button and click it
  const signOutButtons = page.locator('button:has-text("Sign Out")');
  const count = await signOutButtons.count();

  for (let i = 0; i < count; i++) {
    const button = signOutButtons.nth(i);
    if (await button.isVisible()) {
      await button.click();
      break;
    }
  }

  // Wait for the ProtectedRoute to redirect us to /login after auth state updates
  // This might take a moment as Supabase processes the signOut
  await page.waitForURL(url => url.pathname.includes('/login'), { timeout: 10000 });
}

/**
 * Ensures the page is logged out by clearing storage and logging out if needed
 */
export async function ensureLoggedOut(page: Page) {
  // First try to logout if logged in
  await logout(page);

  // Then clear all storage to ensure clean state
  await page.context().clearCookies();
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Wait for page to load
  await page.waitForLoadState('networkidle');
}

/**
 * Navigation helpers
 */
export async function navigateToDashboard(page: Page) {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
}

export async function navigateToNotebooks(page: Page) {
  await page.goto('/notebooks');
  await page.waitForLoadState('networkidle');
}

export async function navigateToNotebook(page: Page, notebookId: string) {
  await page.goto(`/notebooks/${notebookId}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Data creation helpers
 */
export async function createNotebook(
  page: Page,
  notebook: Omit<TestNotebook, 'bets'>
): Promise<string> {
  await navigateToNotebooks(page);

  // Click create notebook button
  await page.click('button:has-text("Create Notebook"), button:has-text("New Notebook")');

  // Fill in notebook details
  await page.fill('input[name="name"]', notebook.name);
  await page.fill('input[name="starting_bankroll"], input[name="startingBankroll"]',
    notebook.starting_bankroll.toString());

  // Handle custom columns if provided
  if (notebook.custom_columns && notebook.custom_columns.length > 0) {
    for (const column of notebook.custom_columns) {
      // Click "Add Custom Column" button
      await page.click('button:has-text("Add Custom Column"), button:has-text("Add Column")');

      // Fill in column details (implementation depends on your UI)
      await page.fill('input[name="columnName"]:last-of-type', column.name);
      await page.selectOption('select[name="columnType"]:last-of-type', column.type);

      // If it's a select type, add options
      if (column.type === 'select' && column.options) {
        for (const option of column.options) {
          await page.fill('input[name="columnOption"]:last-of-type', option);
          await page.click('button:has-text("Add Option")');
        }
      }
    }
  }

  // Submit form
  await page.click('button[type="submit"]:has-text("Create")');

  // Wait for redirect to notebook detail page
  await page.waitForURL(/\/notebooks\/[a-zA-Z0-9-]+/, { timeout: 10000 });

  // Extract notebook ID from URL
  const url = page.url();
  const notebookId = url.split('/notebooks/')[1].split('/')[0];

  return notebookId;
}

export async function createBet(page: Page, notebookId: string, bet: TestBet) {
  await navigateToNotebook(page, notebookId);

  // Click create bet button
  await page.click('button:has-text("Create Bet"), button:has-text("Add Bet")');

  // Wait for dialog to open
  await page.waitForSelector('dialog[open], [role="dialog"]');

  // Fill in basic bet details
  await page.fill('input[name="description"], textarea[name="description"]', bet.description);
  await page.fill('input[name="wager_amount"], input[name="wagerAmount"]',
    bet.wager_amount.toString());
  await page.fill('input[name="odds"]', bet.odds.toString());
  await page.fill('input[name="bet_date"], input[name="betDate"]', bet.bet_date);

  // Select status
  await page.selectOption('select[name="status"]', bet.status);

  // If bet is won, fill in return amount
  if (bet.status === 'won' && bet.return_amount !== undefined) {
    await page.fill('input[name="return_amount"], input[name="returnAmount"]',
      bet.return_amount.toString());
  }

  // Handle custom values if provided
  if (bet.custom_values && Object.keys(bet.custom_values).length > 0) {
    // Click "Show additional fields" if custom fields are collapsed
    const showFieldsButton = page.locator('button:has-text("Show additional fields")');
    if (await showFieldsButton.isVisible()) {
      await showFieldsButton.click();
    }

    // Fill in each custom field
    for (const [fieldName, value] of Object.entries(bet.custom_values)) {
      // Find the field by label
      const field = page.locator(`input[name="${fieldName}"], select[name="${fieldName}"], textarea[name="${fieldName}"]`);

      if (await field.count() > 0) {
        const tagName = await field.evaluate(el => el.tagName.toLowerCase());

        if (tagName === 'select') {
          await field.selectOption(value.toString());
        } else {
          await field.fill(value.toString());
        }
      }
    }
  }

  // Submit form
  await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save")');

  // Wait for dialog to close
  await page.waitForSelector('dialog:not([open]), [role="dialog"]:not([open])', { timeout: 5000 });
}

/**
 * Assertion helpers for P&L calculations
 */
export async function assertDashboardPL(
  page: Page,
  expected: { totalPL: number; winRate: number; roi: number }
) {
  await navigateToDashboard(page);

  // Find and assert Total P&L
  const totalPLElement = page.locator('[data-testid="total-pl"], :text("Total P&L")').first();
  await expect(totalPLElement).toBeVisible();

  const totalPLText = await totalPLElement.textContent();
  const totalPL = parseFloat(totalPLText?.replace(/[^0-9.-]/g, '') || '0');
  expect(Math.abs(totalPL - expected.totalPL)).toBeLessThan(0.1);

  // Find and assert Win Rate
  const winRateElement = page.locator('[data-testid="win-rate"], :text("Win Rate")').first();
  await expect(winRateElement).toBeVisible();

  const winRateText = await winRateElement.textContent();
  const winRate = parseFloat(winRateText?.replace(/[^0-9.]/g, '') || '0');
  expect(Math.abs(winRate - expected.winRate)).toBeLessThan(0.1);

  // Find and assert ROI
  const roiElement = page.locator('[data-testid="roi"], :text("ROI")').first();
  await expect(roiElement).toBeVisible();

  const roiText = await roiElement.textContent();
  const roi = parseFloat(roiText?.replace(/[^0-9.-]/g, '') || '0');
  expect(Math.abs(roi - expected.roi)).toBeLessThan(0.1);
}

export async function assertNotebookPL(
  page: Page,
  notebookName: string,
  expected: { totalPL: number; winRate: number; roi: number }
) {
  await navigateToNotebooks(page);

  // Find the notebook card
  const notebookCard = page.locator(`[data-testid="notebook-card-${notebookName}"], :text("${notebookName}")`).first();
  await expect(notebookCard).toBeVisible();

  // Extract P&L values from the card
  const cardText = await notebookCard.textContent();

  // Assert values (adjust selectors based on your actual UI)
  const totalPLMatch = cardText?.match(/[\+\-]?\$?([0-9,]+\.?[0-9]*)/);
  if (totalPLMatch) {
    const totalPL = parseFloat(totalPLMatch[1].replace(/,/g, ''));
    expect(Math.abs(totalPL - Math.abs(expected.totalPL))).toBeLessThan(0.1);
  }
}

/**
 * Utility to wait for specific time
 */
export async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Utility to extract numeric value from text
 * Handles currency symbols like $, and signs like + or -
 */
export function extractNumber(text: string | null): number {
  if (!text) return 0;
  // Match optional sign, optional currency symbol, then numbers with optional decimals
  const match = text.match(/[\+\-]?\$?([0-9,]+\.?[0-9]*)/);
  return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
}

/**
 * Utility to extract percentage value from text
 */
export function extractPercentage(text: string | null): number {
  if (!text) return 0;
  const match = text.match(/([0-9]+\.?[0-9]*)%/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Console error tracking helper
 */
export function setupConsoleErrorTracking(page: Page): string[] {
  const consoleErrors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    consoleErrors.push(error.message);
  });

  return consoleErrors;
}

/**
 * Check for specific console warnings
 */
export function checkForReactWarnings(consoleErrors: string[]): boolean {
  return consoleErrors.some(error =>
    error.includes('Cannot update unmounted component') ||
    error.includes('Warning: Can\'t perform a React state update')
  );
}

/**
 * Authentication: Register new user
 */
export async function register(page: Page, email: string, password: string) {
  // Make sure we're logged out first
  await ensureLoggedOut(page);

  await page.goto('/register', { waitUntil: 'domcontentloaded' });

  // Wait for page to load
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  // Fill registration fields with proper locators
  const emailInput = page.locator('input[type="email"]').first();
  const passwordInputs = page.locator('input[type="password"]');
  
  await emailInput.fill(email);
  await passwordInputs.nth(0).fill(password);

  // Fill confirm password field
  const passwordCount = await passwordInputs.count();
  if (passwordCount > 1) {
    await passwordInputs.nth(1).fill(password);
  }

  // Submit form - find the Create Account button
  const submitButton = page.locator('button[type="submit"]:has-text("Create Account"), button:has-text("Create Account")').first();
  await submitButton.click();

  // Wait for either success message or redirect to dashboard (depending on Supabase config)
  // In some configs, email confirmation is auto-enabled and user is logged in immediately
  try {
    await Promise.race([
      page.waitForSelector('text="Check your email"', { timeout: 15000 }),
      page.waitForURL(url => url.pathname.includes('/dashboard'), { timeout: 15000 })
    ]);
  } catch (error) {
    // Check for error messages
    const errorMessage = await page.locator('text=/error|invalid|password/i').first().textContent().catch(() => null);
    if (errorMessage) {
      throw new Error(`Registration failed: ${errorMessage}`);
    }
    // Otherwise might have succeeded but with different flow
    await page.waitForLoadState('networkidle');
  }

  await page.waitForLoadState('networkidle');
}

/**
 * Notebook operations: Delete notebook by name
 */
export async function deleteNotebook(page: Page, notebookName: string) {
  await navigateToNotebooks(page);

  // Find notebook card containing the name
  const notebookCard = page.locator(`[data-testid*="notebook-card"], :text("${notebookName}")`).first();
  await expect(notebookCard).toBeVisible();

  // Find menu/delete button for this notebook
  const cardParent = notebookCard.locator('xpath=ancestor::div[@data-testid*="notebook"]');
  const menuButton = cardParent.locator('button[aria-label*="menu"], button:has([class*="icon"]):first-of-type');

  if (await menuButton.isVisible()) {
    await menuButton.click();
  }

  // Click delete option
  await page.click('button:has-text("Delete")');

  // Confirm deletion
  await page.click('button:has-text("Confirm"), button:has-text("Yes")');

  // Wait for notebook to be removed from DOM
  await expect(notebookCard).not.toBeVisible({ timeout: 5000 });
}

/**
 * Notebook operations: Edit notebook name and/or bankroll
 */
export async function editNotebook(
  page: Page,
  originalName: string,
  updates: { name?: string; starting_bankroll?: number }
) {
  await navigateToNotebooks(page);

  // Find the notebook
  const notebookCard = page.locator(`[data-testid*="notebook-card"], :text("${originalName}")`).first();
  await expect(notebookCard).toBeVisible();

  // Find and click edit button
  const cardParent = notebookCard.locator('xpath=ancestor::div[@data-testid*="notebook"]');
  const editButton = cardParent.locator('button[aria-label*="edit"], [data-testid*="edit"]');

  if (await editButton.isVisible()) {
    await editButton.click();
  } else {
    // Fallback: click notebook to enter detail view, then click edit
    await notebookCard.click();
    await page.click('button:has-text("Edit"), button[aria-label*="edit"]');
  }

  // Wait for dialog to appear
  await page.waitForSelector('text="Edit Notebook", dialog[open], [role="dialog"]', { timeout: 5000 });

  // Update fields
  if (updates.name) {
    const nameInput = page.locator('input[name="name"]').first();
    await nameInput.fill('');
    await nameInput.fill(updates.name);
  }

  if (updates.starting_bankroll) {
    const bankrollInput = page.locator('input[name="starting_bankroll"], input[name="startingBankroll"]').first();
    await bankrollInput.fill('');
    await bankrollInput.fill(updates.starting_bankroll.toString());
  }

  // Submit
  await page.click('button[type="submit"]:has-text("Save")');

  // Wait for dialog to close
  await page.waitForSelector('dialog:not([open]), [role="dialog"]:not([open])', { timeout: 5000 }).catch(() => {});
}

/**
 * Bet operations: Delete bet by description
 */
export async function deleteBet(page: Page, betDescription: string) {
  // Find the bet card
  const betCard = page.locator(`[data-testid*="bet"], :text("${betDescription}")`).first();
  await expect(betCard).toBeVisible();

  // Find menu button
  const menuButton = betCard.locator('button[aria-label*="menu"], button:has([class*="icon"]):last-of-type');

  if (await menuButton.isVisible()) {
    await menuButton.click();
  }

  // Click delete
  await page.click('button:has-text("Delete")');

  // Confirm
  await page.click('button:has-text("Confirm"), button:has-text("Yes")');

  // Wait for bet to be removed
  await expect(betCard).not.toBeVisible({ timeout: 5000 });
}

/**
 * Bet operations: Change bet status
 */
export async function changeBetStatus(
  page: Page,
  betDescription: string,
  newStatus: 'won' | 'lost' | 'push' | 'pending'
) {
  // Find and click the bet to open edit dialog
  const betCard = page.locator(`[data-testid*="bet"], :text("${betDescription}")`).first();
  await betCard.click();

  // Wait for edit dialog
  await page.waitForSelector('text="Edit Bet", dialog[open], [role="dialog"]', { timeout: 5000 });

  // Find status select and change it
  const statusSelect = page.locator('select[name="status"]').first();
  await statusSelect.selectOption(newStatus);

  // If changing to won, fill return amount if needed
  if (newStatus === 'won') {
    const returnInput = page.locator('input[name="return_amount"], input[name="returnAmount"]').first();
    if (await returnInput.isVisible()) {
      const currentValue = await returnInput.inputValue();
      if (!currentValue) {
        await returnInput.fill('0');
      }
    }
  }

  // Submit
  await page.click('button[type="submit"]:has-text("Save")');

  // Wait for dialog to close
  await page.waitForSelector('dialog:not([open]), [role="dialog"]:not([open])', { timeout: 5000 }).catch(() => {});
}

/**
 * Bet operations: Edit bet (description, wager, odds)
 */
export async function editBet(
  page: Page,
  originalDescription: string,
  updates: { description?: string; wager_amount?: number; odds?: number }
) {
  // Find and click the bet
  const betCard = page.locator(`[data-testid*="bet"], :text("${originalDescription}")`).first();
  await betCard.click();

  // Wait for edit dialog
  await page.waitForSelector('text="Edit Bet", dialog[open], [role="dialog"]', { timeout: 5000 });

  // Update fields
  if (updates.description) {
    const descInput = page.locator('input[name="description"], textarea[name="description"]').first();
    await descInput.fill('');
    await descInput.fill(updates.description);
  }

  if (updates.wager_amount) {
    const wagerInput = page.locator('input[name="wager_amount"], input[name="wagerAmount"]').first();
    await wagerInput.fill('');
    await wagerInput.fill(updates.wager_amount.toString());
  }

  if (updates.odds) {
    const oddsInput = page.locator('input[name="odds"]').first();
    await oddsInput.fill('');
    await oddsInput.fill(updates.odds.toString());
  }

  // Submit
  await page.click('button[type="submit"]:has-text("Save")');

  // Wait for dialog to close
  await page.waitForSelector('dialog:not([open]), [role="dialog"]:not([open])', { timeout: 5000 }).catch(() => {});
}

/**
 * Assertion helper: Toast message appears
 */
export async function assertToastMessage(page: Page, message: string) {
  const toastElement = page.locator(`[role="alert"], [data-testid*="toast"], :text("${message}")`).first();
  await expect(toastElement).toBeVisible({ timeout: 5000 });
}

/**
 * Assertion helper: Validation error for a field
 */
export async function assertValidationError(page: Page, field: string, errorMessage: string) {
  const fieldLabel = page.locator(`label:has-text("${field}")`);
  await expect(fieldLabel).toBeVisible();

  // Look for error message near the field
  const errorElement = fieldLabel.locator('xpath=following-sibling::*[contains(@class, "error")], following-sibling::*[contains(text(), "required")]');
  await expect(errorElement).toContainText(errorMessage);
}

/**
 * Assertion helper: Element count matches expected
 */
export async function assertElementCount(page: Page, selector: string, expectedCount: number) {
  const elements = page.locator(selector);
  const count = await elements.count();
  expect(count).toBe(expectedCount);
}

/**
 * Navigation: Go to Tracker page
 */
export async function navigateToTracker(page: Page) {
  await page.goto('/tracker');
  await page.waitForLoadState('networkidle');
}

/**
 * Account operations: Create new account
 */
export async function createAccount(page: Page, accountName: string): Promise<string> {
  await navigateToTracker(page);

  // Click create account button
  await page.click('button:has-text("Create Account"), button:has-text("Add Account"), button:has-text("New Account")');

  // Wait for dialog to appear using locator
  await page.locator('dialog[open], [role="dialog"]').first().waitFor({ state: 'visible', timeout: 5000 });

  // Fill account name
  await page.fill('input[name="name"], input[name="account_name"]', accountName);

  // Submit
  await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Add")');

  // Wait for dialog to close
  await page.waitForSelector('dialog:not([open])', { timeout: 5000 }).catch(() => {});

  // Extract account ID from URL if redirected
  const url = page.url();
  const match = url.match(/\/tracker\/accounts\/([a-zA-Z0-9-]+)/);
  const accountId = match ? match[1] : '';

  return accountId;
}

/**
 * Account operations: Edit account
 */
export async function editAccount(
  page: Page,
  accountName: string,
  updates: { name?: string }
) {
  await navigateToTracker(page);

  // Find account card/item
  const accountCard = page.locator(`text="${accountName}"`).first();
  await expect(accountCard).toBeVisible();

  // Find edit button
  const menuButton = accountCard.locator('xpath=ancestor::div').locator('button[aria-label*="menu"], button:has-text("Edit")').first();

  if (await menuButton.isVisible()) {
    await menuButton.click();
  } else {
    // Try clicking account to open detail view
    await accountCard.click();
    await page.click('button:has-text("Edit"), button[aria-label*="edit"]');
  }

  // Wait for edit dialog
  await page.waitForSelector('dialog[open], [role="dialog"]', { timeout: 5000 });

  // Update fields
  if (updates.name) {
    const nameInput = page.locator('input[name="name"], input[name="account_name"]').first();
    await nameInput.fill('');
    await nameInput.fill(updates.name);
  }

  // Submit
  await page.click('button[type="submit"]:has-text("Save")');

  // Wait for dialog to close
  await page.waitForSelector('dialog:not([open]), [role="dialog"]:not([open])', { timeout: 5000 }).catch(() => {});
}

/**
 * Account operations: Delete account
 */
export async function deleteAccount(page: Page, accountName: string) {
  await navigateToTracker(page);

  // Find account
  const accountCard = page.locator(`text="${accountName}"`).first();
  await expect(accountCard).toBeVisible();

  // Find delete button
  const cardParent = accountCard.locator('xpath=ancestor::div');
  const menuButton = cardParent.locator('button[aria-label*="menu"], button:last-of-type').first();

  if (await menuButton.isVisible()) {
    await menuButton.click();
  }

  // Click delete
  await page.click('button:has-text("Delete")');

  // Confirm deletion
  await page.click('button:has-text("Confirm"), button:has-text("Yes")');

  // Wait for account to disappear
  await expect(accountCard).not.toBeVisible({ timeout: 5000 });
}

/**
 * P&L operations: Edit daily P&L entry
 */
export async function editDailyPL(
  page: Page,
  accountName: string,
  date: string,
  plAmount: number
) {
  // Navigate to account if needed
  const currentUrl = page.url();
  if (!currentUrl.includes('/tracker/accounts/')) {
    await navigateToTracker(page);
    // Click account to enter detail view
    const accountCard = page.locator(`text="${accountName}"`).first();
    await accountCard.click();
    await page.waitForLoadState('networkidle');
  }

  // Find the date cell or entry
  const dateCell = page.locator(`text="${date}"`).first();
  await expect(dateCell).toBeVisible();

  // Click on P&L cell for that date
  const plCell = dateCell.locator('xpath=following-sibling::*[contains(@class, "pl")] | following-sibling::input');
  await plCell.click();

  // Wait for edit mode or dialog
  await page.waitForTimeout(500);

  // Fill in P&L value
  const plInput = page.locator('input[type="number"], input[name*="pl"], input[name*="daily"]').last();
  if (await plInput.isVisible()) {
    await plInput.fill(plAmount.toString());
  }

  // Submit or blur to save
  await page.keyboard.press('Tab');
  await page.waitForTimeout(300);
}
