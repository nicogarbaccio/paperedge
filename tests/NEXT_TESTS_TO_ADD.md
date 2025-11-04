# Recommended Next Tests to Add

This document shows exactly which tests to add first for maximum impact.

## 🚀 IMMEDIATE PRIORITY (Start This Week)

### 1. Create `tests/e2e/auth/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('User can register with valid credentials', async ({ page }) => {
    await page.goto('/');
    await page.click('a:has-text("Sign up")');
    await page.waitForSelector('text="Create an account"');
    
    const email = `test-${Date.now()}@example.com`;
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'ValidPassword123!');
    await page.fill('input[placeholder*="password"]', 'ValidPassword123!');
    
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard after signup
    await page.waitForURL('/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('User sees error with invalid email', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'notanemail');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=/invalid email/i')).toBeVisible();
  });

  test('User sees error with wrong password', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=/invalid credentials|wrong password/i')).toBeVisible();
  });

  test('Unauthenticated user redirects to login', async ({ page }) => {
    // Try to access protected route directly
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL('/login', { timeout: 10000 });
  });

  test('User can logout', async ({ page }) => {
    await page.goto('/');
    
    // Login first
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Click user menu and logout
    await page.click('[data-testid="user-menu"], button:has-text("Settings")');
    await page.click('button:has-text("Logout"), a:has-text("Logout")');
    
    // Should redirect to login
    await page.waitForURL('/login', { timeout: 10000 });
  });
});
```

**Why first**: All other tests depend on login working. If this fails, nothing else works.

---

### 2. Create `tests/e2e/notebooks/crud.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { testUser, notebooks } from '../../fixtures/test-data';
import { login, navigateToNotebooks } from '../../fixtures/helpers';

test.describe('Notebook CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUser.email, testUser.password);
  });

  test('Can create notebook with custom columns', async ({ page }) => {
    await navigateToNotebooks(page);
    await page.click('button:has-text("Create Notebook")');
    
    // Fill notebook details
    const notebookName = `Test Notebook ${Date.now()}`;
    await page.fill('input[name="name"]', notebookName);
    await page.fill('input[name="starting_bankroll"]', '1000');
    
    // Add a custom column
    await page.click('button:has-text("Add Custom Column")');
    await page.fill('input[placeholder*="column name"]', 'Test Column');
    await page.selectOption('select', 'text');
    
    await page.click('button[type="submit"]:has-text("Create")');
    
    // Should redirect to notebook detail
    await page.waitForURL(/\/notebooks\/[a-z0-9-]+/, { timeout: 10000 });
    
    // Verify notebook name appears
    await expect(page.locator(`text="${notebookName}"`)).toBeVisible();
  });

  test('Can edit notebook name and bankroll', async ({ page }) => {
    await navigateToNotebooks(page);
    
    // Click first notebook's edit button
    await page.click('button[aria-label*="Edit"], [data-testid*="edit"]:first-of-type');
    
    await page.fill('input[name="name"]', 'Updated Notebook Name');
    await page.fill('input[name="starting_bankroll"]', '2000');
    
    await page.click('button[type="submit"]:has-text("Save")');
    
    // Verify changes
    await expect(page.locator('text="Updated Notebook Name"')).toBeVisible();
  });

  test('Can delete notebook with confirmation', async ({ page }) => {
    await navigateToNotebooks(page);
    
    const notebookCount = await page.locator('[data-testid="notebook-card"]').count();
    
    // Click delete button on first notebook
    await page.click('[data-testid="notebook-menu"]:first-of-type');
    await page.click('button:has-text("Delete")');
    
    // Confirm deletion
    await page.click('button:has-text("Confirm")');
    
    // Verify notebook was removed
    const newCount = await page.locator('[data-testid="notebook-card"]').count();
    expect(newCount).toBe(notebookCount - 1);
  });

  test('Shows validation error for empty notebook name', async ({ page }) => {
    await navigateToNotebooks(page);
    await page.click('button:has-text("Create Notebook")');
    
    // Leave name empty
    await page.fill('input[name="starting_bankroll"]', '1000');
    
    await page.click('button[type="submit"]:has-text("Create")');
    
    // Should show error
    await expect(page.locator('text=/name is required/i')).toBeVisible();
  });
});
```

**Why second**: Users need to create notebooks to hold bets. Also tests data creation workflow.

---

### 3. Create `tests/e2e/bets/crud.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { testUser } from '../../fixtures/test-data';
import { login, navigateToNotebooks } from '../../fixtures/helpers';

test.describe('Bet CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUser.email, testUser.password);
  });

  test('Can edit existing bet', async ({ page }) => {
    await navigateToNotebooks(page);
    await page.click('text="NFL 2024"');
    await page.waitForLoadState('networkidle');
    
    // Click first bet to edit
    await page.click('[data-testid="bet-card"]:first-of-type');
    await page.waitForSelector('text="Edit Bet"');
    
    // Change description and wager
    const descriptionInput = page.locator('input[name="description"]').first();
    await descriptionInput.fill('Updated Bet Description');
    
    const wagerInput = page.locator('input[name="wager_amount"]').first();
    await wagerInput.fill('150');
    
    await page.click('button[type="submit"]:has-text("Save")');
    
    // Verify changes
    await expect(page.locator('text="Updated Bet Description"')).toBeVisible();
  });

  test('Can change bet status from pending to won', async ({ page }) => {
    await navigateToNotebooks(page);
    await page.click('text="NFL 2024"');
    await page.waitForLoadState('networkidle');
    
    // Find pending bet
    const pendingBet = page.locator('[data-testid="bet-card"]').filter({ hasText: 'Pending' }).first();
    await pendingBet.click();
    
    // Change status
    await page.selectOption('select[name="status"]', 'won');
    
    // Fill return amount
    await page.fill('input[name="return_amount"]', '50');
    
    await page.click('button[type="submit"]:has-text("Save")');
    
    // Verify status changed
    await expect(page.locator('[data-status="won"]')).toBeVisible();
  });

  test('Can delete bet with confirmation', async ({ page }) => {
    await navigateToNotebooks(page);
    await page.click('text="NFL 2024"');
    await page.waitForLoadState('networkidle');
    
    const initialCount = await page.locator('[data-testid="bet-card"]').count();
    
    // Click bet menu and delete
    await page.click('[data-testid="bet-menu"]:first-of-type');
    await page.click('button:has-text("Delete")');
    
    // Confirm
    await page.click('button:has-text("Confirm")');
    
    // Verify count decreased
    const newCount = await page.locator('[data-testid="bet-card"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('Supports American odds format', async ({ page }) => {
    await navigateToNotebooks(page);
    await page.click('text="NFL 2024"');
    await page.click('button:has-text("Add Bet")');
    
    await page.fill('input[name="description"]', 'Test American Odds');
    await page.fill('input[name="wager_amount"]', '100');
    await page.fill('input[name="odds"]', '+150'); // American format
    
    await page.click('button[type="submit"]:has-text("Add Bet")');
    
    // Verify bet created
    await expect(page.locator('text="Test American Odds"')).toBeVisible();
  });

  test('Shows error for missing required fields', async ({ page }) => {
    await navigateToNotebooks(page);
    await page.click('text="NFL 2024"');
    await page.click('button:has-text("Add Bet")');
    
    // Leave description empty
    await page.fill('input[name="wager_amount"]', '100');
    
    await page.click('button[type="submit"]:has-text("Add Bet")');
    
    // Should show error
    await expect(page.locator('text=/description is required/i')).toBeVisible();
  });
});
```

**Why third**: Tests the core bet functionality. Users interact with bets constantly.

---

## 📋 PHASE 2 (Next Week)

### 4. Create `tests/e2e/tracker/tracker.spec.ts`

Add tests for:
- Create account
- Edit account
- Delete account
- View calendar
- Edit daily P&L
- Navigate to account detail page

### 5. Extend `tests/e2e/calculations/pl-accuracy.spec.ts`

Add tests for:
- ROI accuracy
- Bankroll growth
- Date range filtering
- Bet status breakdown

---

## 🛠️ Helper Functions to Add

Add these to `tests/fixtures/helpers.ts`:

```typescript
// Authentication
export async function register(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.click('a:has-text("Sign up")');
  await page.waitForSelector('text="Create an account"');
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.fill('input[placeholder*="confirm"]', password);
  
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

// Notebook operations
export async function deleteNotebook(page: Page, notebookName: string) {
  await navigateToNotebooks(page);
  const notebook = page.locator(`text="${notebookName}"`);
  const card = notebook.locator('..').locator('..');
  
  await card.locator('button[aria-label*="menu"]').click();
  await page.click('button:has-text("Delete")');
  await page.click('button:has-text("Confirm")');
}

export async function editNotebook(
  page: Page,
  name: string,
  updates: { name?: string; bankroll?: number }
) {
  await navigateToNotebooks(page);
  const notebook = page.locator(`text="${name}"`);
  
  await notebook.locator('button[aria-label*="edit"]').click();
  
  if (updates.name) {
    await page.fill('input[name="name"]', updates.name);
  }
  if (updates.bankroll) {
    await page.fill('input[name="starting_bankroll"]', updates.bankroll.toString());
  }
  
  await page.click('button[type="submit"]:has-text("Save")');
}

// Bet operations
export async function deleteBet(page: Page, betDescription: string) {
  const bet = page.locator(`text="${betDescription}"`);
  const card = bet.locator('..').locator('..');
  
  await card.locator('button[aria-label*="menu"]').click();
  await page.click('button:has-text("Delete")');
  await page.click('button:has-text("Confirm")');
}

export async function changeBetStatus(
  page: Page,
  betDescription: string,
  newStatus: 'won' | 'lost' | 'push' | 'pending'
) {
  const bet = page.locator(`text="${betDescription}"`);
  await bet.click();
  
  await page.selectOption('select[name="status"]', newStatus);
  await page.click('button[type="submit"]:has-text("Save")');
}

// Assertions
export async function assertToastMessage(page: Page, message: string) {
  await expect(page.locator(`text="${message}"`)).toBeVisible();
}

export async function assertValidationError(
  page: Page,
  field: string,
  errorMessage: string
) {
  const fieldElement = page.locator(`label:has-text("${field}")`);
  const errorElement = fieldElement.locator('xpath=following-sibling::*[contains(@class, "error")]');
  await expect(errorElement).toContainText(errorMessage);
}
```

---

## 📊 Test Organization

After adding these tests, your structure will be:

```
tests/e2e/
├── auth/
│   └── auth.spec.ts            [NEW - 5 tests]
├── notebooks/
│   ├── navigation.spec.ts       [EXISTING - 5 tests]
│   └── crud.spec.ts             [NEW - 5 tests]
├── bets/
│   ├── custom-fields.spec.ts    [EXISTING - 4 tests]
│   └── crud.spec.ts             [NEW - 5 tests]
├── calculations/
│   └── pl-accuracy.spec.ts      [EXISTING - 4 tests]
├── support/
│   └── support-page.spec.ts     [EXISTING - 4 tests]
└── tracker/
    └── tracker.spec.ts          [PHASE 2 - ~8 tests]

TOTAL AFTER PHASE 1: ~28-30 tests
```

---

## 🎯 Success Criteria for Phase 1

- ✅ All 5 auth tests passing
- ✅ All 5 notebook CRUD tests passing
- ✅ All 5 bet CRUD tests passing
- ✅ Total: ~40 tests (existing 23 + new 17)
- ✅ All tests pass on CI
- ✅ Test run time < 5 minutes

---

**Start with auth tests** - they're the foundation for everything else!

