import { test, expect } from '@playwright/test';
import { generateRandomString } from '../../fixtures/helpers';

test.describe('Dashboard', () => {
  test('should display dashboard page with stats cards', async ({ page }) => {
    await page.goto('/dashboard');

    // Verify page renders
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('dashboard-page-title')).toHaveText('Dashboard');

    // Verify all 6 stat cards are present
    await expect(page.getByTestId('dashboard-total-bets-card')).toBeVisible();
    await expect(page.getByTestId('dashboard-win-rate-card')).toBeVisible();
    await expect(page.getByTestId('dashboard-total-pl-card')).toBeVisible();
    await expect(page.getByTestId('dashboard-roi-card')).toBeVisible();
    await expect(page.getByTestId('dashboard-active-notebooks-card')).toBeVisible();
    await expect(page.getByTestId('dashboard-pending-bets-card')).toBeVisible();

    // Verify recent bets and top notebooks sections
    await expect(page.getByTestId('dashboard-recent-bets-card')).toBeVisible();
    await expect(page.getByTestId('dashboard-top-notebooks-card')).toBeVisible();
  });

  test('should reflect stats after creating a notebook with bets', async ({ page }) => {
    const notebookName = `Dashboard Test ${generateRandomString()}`;

    // 1. Create a notebook
    await page.goto('/notebooks');
    await page.getByTestId('create-notebook-button').first().click();
    await page.getByTestId('notebook-name-input').fill(notebookName);
    await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
    await page.getByTestId('notebook-save-button').click();
    await page.getByRole('link', { name: notebookName }).first().click();

    // 2. Create a pending bet
    await page.getByTestId('create-bet-button').click();
    await page.getByTestId('create-bet-description-input').fill('Dashboard Test Bet');
    await page.getByTestId('create-bet-odds-input').fill('+150');
    await page.getByTestId('create-bet-wager-input').fill('100');
    await page.getByTestId('create-bet-submit-button').click();
    await expect(page.getByTestId('create-bet-dialog')).toBeHidden();

    // 3. Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    // 4. Verify stats reflect at least 1 bet and 1 notebook
    const totalBets = page.getByTestId('dashboard-total-bets-value');
    await expect(totalBets).toBeVisible();
    const totalBetsText = await totalBets.textContent();
    expect(Number(totalBetsText)).toBeGreaterThanOrEqual(1);

    const activeNotebooks = page.getByTestId('dashboard-active-notebooks-value');
    await expect(activeNotebooks).toBeVisible();
    const activeNotebooksText = await activeNotebooks.textContent();
    expect(Number(activeNotebooksText)).toBeGreaterThanOrEqual(1);

    const pendingBets = page.getByTestId('dashboard-pending-bets-value');
    await expect(pendingBets).toBeVisible();
    const pendingBetsText = await pendingBets.textContent();
    expect(Number(pendingBetsText)).toBeGreaterThanOrEqual(1);

    // 5. Verify the bet shows up in recent bets
    await expect(page.getByTestId('dashboard-recent-bets-list')).toBeVisible();
    await expect(page.getByTestId('dashboard-recent-bet-item').filter({ hasText: 'Dashboard Test Bet' })).toBeVisible();

    // 6. Verify top notebooks section has content (our notebook may not be in
    // the top 3 if other tests created notebooks with higher P&L in parallel)
    await expect(page.getByTestId('dashboard-top-notebooks-list')).toBeVisible();
    const topNotebookItems = page.getByTestId('dashboard-top-notebook-item');
    const count = await topNotebookItems.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should update stats when a bet is settled', async ({ page }) => {
    const notebookName = `Dashboard Settle ${generateRandomString()}`;

    // 1. Create notebook and a bet
    await page.goto('/notebooks');
    await page.getByTestId('create-notebook-button').first().click();
    await page.getByTestId('notebook-name-input').fill(notebookName);
    await page.getByTestId('notebook-starting-bankroll-input').fill('500');
    await page.getByTestId('notebook-save-button').click();
    await page.getByRole('link', { name: notebookName }).first().click();

    await page.getByTestId('create-bet-button').click();
    await page.getByTestId('create-bet-description-input').fill('Settle Test Bet');
    await page.getByTestId('create-bet-odds-input').fill('+200');
    await page.getByTestId('create-bet-wager-input').fill('50');
    await page.getByTestId('create-bet-submit-button').click();
    await expect(page.getByTestId('create-bet-dialog')).toBeHidden();

    // 2. Edit bet to mark as won — use test ID to avoid matching toast text
    await page.getByTestId('bet-card-description').filter({ hasText: 'Settle Test Bet' }).click();
    await expect(page.getByTestId('edit-bet-dialog')).toBeVisible();
    await page.getByTestId('bet-status-won-button').click();
    await page.getByTestId('edit-bet-save-button').click();
    await expect(page.getByTestId('edit-bet-dialog')).toBeHidden();

    // 3. Navigate to dashboard and verify stats
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    // Win rate should be > 0 since we won a bet
    const winRate = page.getByTestId('dashboard-win-rate-value');
    await expect(winRate).toBeVisible();
    const winRateText = await winRate.textContent();
    // Win rate should not be "0.0%" — at least some percentage
    expect(winRateText).not.toBe('0.0%');

    // Total P&L should reflect winnings (positive or at least show a value)
    const totalPL = page.getByTestId('dashboard-total-pl-value');
    await expect(totalPL).toBeVisible();

    // Recent bet should show "Won" status
    await expect(page.getByTestId('dashboard-recent-bet-item').filter({ hasText: 'Settle Test Bet' })).toBeVisible();
    await expect(page.getByTestId('dashboard-recent-bet-item').filter({ hasText: 'Won' })).toBeVisible();
  });

  test('should navigate from top notebook to notebook detail', async ({ page }) => {
    const notebookName = `Dashboard Nav ${generateRandomString()}`;

    // 1. Create a notebook with a bet so it appears in top notebooks
    await page.goto('/notebooks');
    await page.getByTestId('create-notebook-button').first().click();
    await page.getByTestId('notebook-name-input').fill(notebookName);
    await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
    await page.getByTestId('notebook-save-button').click();
    await page.getByRole('link', { name: notebookName }).first().click();

    await page.getByTestId('create-bet-button').click();
    await page.getByTestId('create-bet-description-input').fill('Nav Test Bet');
    await page.getByTestId('create-bet-odds-input').fill('+100');
    await page.getByTestId('create-bet-wager-input').fill('50');
    await page.getByTestId('create-bet-submit-button').click();
    await expect(page.getByTestId('create-bet-dialog')).toBeHidden();

    // 2. Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    // Wait for top notebooks to load
    await expect(page.getByTestId('dashboard-top-notebooks-list')).toBeVisible();

    // Get the name from the first top notebook item, then click it
    const firstNotebook = page.getByTestId('dashboard-top-notebook-item').first();
    await expect(firstNotebook).toBeVisible();
    const firstNotebookName = await firstNotebook.locator('p').first().textContent();
    await firstNotebook.click();

    // Should navigate to notebook detail with the correct title
    await expect(page).toHaveURL(/\/notebooks\//);
    await expect(page.getByTestId('notebook-detail-title')).toHaveText(firstNotebookName!);
  });
});
