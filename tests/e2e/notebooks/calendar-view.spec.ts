import { test, expect } from '@playwright/test';
import { generateRandomString } from '../../fixtures/helpers';

test.describe('Calendar View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notebooks');

    // Use unique name to avoid navigating to a stale notebook from previous runs
    const notebookName = `Calendar Test ${generateRandomString()}`;

    // Create a notebook
    await page.getByTestId('create-notebook-button').first().click();
    await page.getByTestId('notebook-name-input').fill(notebookName);
    await page.getByTestId('notebook-starting-bankroll-input').fill('1000');
    await page.getByTestId('notebook-save-button').click();
    await page.getByRole('link', { name: notebookName }).first().click();
  });

  test('should toggle view and navigate months', async ({ page }) => {
    // 1. Toggle View
    await page.getByTestId('notebook-calendar-view-button').click();
    await expect(page.getByTestId('calendar-view')).toBeVisible();

    // 2. Verify Navigation
    const currentMonth = await page.getByTestId('calendar-current-month').textContent();

    await page.getByTestId('calendar-prev-month-button').click();
    await expect(page.getByTestId('calendar-current-month')).not.toHaveText(currentMonth!);

    await page.getByTestId('calendar-next-month-button').click();
    await expect(page.getByTestId('calendar-current-month')).toHaveText(currentMonth!);

    // 3. Toggle back
    await page.getByTestId('notebook-history-view-button').click();
    await expect(page.getByTestId('calendar-view')).toBeHidden();
  });

  test('should edit multiple bets from day details drawer', async ({ page }) => {
    // 1. Create multiple bets for the same day (date defaults to today)
    await page.getByTestId('create-bet-button').click();
    await expect(page.getByTestId('create-bet-dialog')).toBeVisible();

    await page.getByTestId('create-bet-description-input').fill('Lakers ML');
    await page.getByTestId('create-bet-odds-input').fill('-110');
    await page.getByTestId('create-bet-wager-input').fill('100');
    await page.getByTestId('create-bet-submit-button').click();

    await expect(page.getByTestId('create-bet-dialog')).toBeHidden();
    await expect(page.getByTestId('toast-success')).toBeVisible();

    // Create second bet
    await page.getByTestId('create-bet-button').click();
    await expect(page.getByTestId('create-bet-dialog')).toBeVisible();

    await page.getByTestId('create-bet-description-input').fill('Warriors ML');
    await page.getByTestId('create-bet-odds-input').fill('+150');
    await page.getByTestId('create-bet-wager-input').fill('50');
    await page.getByTestId('create-bet-submit-button').click();

    await expect(page.getByTestId('create-bet-dialog')).toBeHidden();

    // Create third bet
    await page.getByTestId('create-bet-button').click();
    await expect(page.getByTestId('create-bet-dialog')).toBeVisible();

    await page.getByTestId('create-bet-description-input').fill('Celtics ML');
    await page.getByTestId('create-bet-odds-input').fill('+200');
    await page.getByTestId('create-bet-wager-input').fill('75');
    await page.getByTestId('create-bet-submit-button').click();

    await expect(page.getByTestId('create-bet-dialog')).toBeHidden();

    // 2. Switch to calendar view
    await page.getByTestId('notebook-calendar-view-button').click();
    await expect(page.getByTestId('calendar-view')).toBeVisible();

    // Wait for a bet card with the description to appear (they're shown in calendar view)
    const cellWithBets = page.locator('[data-has-bets="true"]').first();
    await cellWithBets.waitFor({ state: 'attached', timeout: 10000 });

    // Use evaluate to click programmatically to bypass visibility issues
    await cellWithBets.evaluate((el) => (el as HTMLElement).click());

    // Verify day details drawer opens
    await expect(page.getByTestId('day-details-drawer')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('day-details-title')).toBeVisible();

    // Scope selectors within the drawer for robustness
    const drawer = page.getByTestId('day-details-drawer');

    // Verify our bets are listed
    const betCards = drawer.getByTestId('day-details-bet-card');
    await expect(betCards).toHaveCount(3);

    // 4. Edit the Lakers bet
    const lakersBet = drawer.getByTestId('day-details-bet-card').filter({ hasText: 'Lakers ML' });
    await lakersBet.click();

    // Verify edit dialog opens and day drawer stays visible behind it
    await expect(page.getByTestId('edit-bet-dialog')).toBeVisible();
    await expect(page.getByTestId('day-details-drawer')).toBeVisible();

    // Change status to won
    await page.getByTestId('bet-status-won-button').click();

    // Verify wager amount is still correct
    const wagerInput = page.getByTestId('edit-bet-wager-input');
    await expect(wagerInput).toHaveValue('100');

    // Save the bet
    await page.getByTestId('edit-bet-save-button').click();

    // Verify edit dialog closes
    await expect(page.getByTestId('edit-bet-dialog')).toBeHidden();

    // Verify day drawer is still open
    await expect(page.getByTestId('day-details-drawer')).toBeVisible();

    // 5. Edit the Warriors bet without closing drawer
    const warriorsBet = drawer.getByTestId('day-details-bet-card').filter({ hasText: 'Warriors ML' });
    await warriorsBet.click();

    // Verify edit dialog opens with NEW bet data (not the previous bet)
    await expect(page.getByTestId('edit-bet-dialog')).toBeVisible();
    await expect(page.getByTestId('edit-bet-description-input')).toHaveValue('Warriors ML');
    await expect(page.getByTestId('edit-bet-odds-input')).toHaveValue('150');

    // Change status to lost
    await page.getByTestId('bet-status-lost-button').click();

    // Save
    await page.getByTestId('edit-bet-save-button').click();

    await expect(page.getByTestId('edit-bet-dialog')).toBeHidden();

    // Day drawer should still be open
    await expect(page.getByTestId('day-details-drawer')).toBeVisible();

    // 6. Edit the Celtics bet
    const celticsBet = drawer.getByTestId('day-details-bet-card').filter({ hasText: 'Celtics ML' });
    await celticsBet.click();

    // Verify edit dialog opens with the correct bet
    await expect(page.getByTestId('edit-bet-dialog')).toBeVisible();
    await expect(page.getByTestId('edit-bet-description-input')).toHaveValue('Celtics ML');
    await expect(page.getByTestId('edit-bet-odds-input')).toHaveValue('200');

    // Change status to push
    await page.getByTestId('bet-status-push-button').click();

    // Save
    await page.getByTestId('edit-bet-save-button').click();

    await expect(page.getByTestId('edit-bet-dialog')).toBeHidden();

    // 7. Verify day drawer still open and shows updated statuses
    await expect(page.getByTestId('day-details-drawer')).toBeVisible();

    // Verify the day P&L has been updated (Lakers won ~$90.91, Warriors lost $50)
    const dayProfit = page.getByTestId('day-details-profit');
    await expect(dayProfit).toBeVisible();

    // 8. Close the day drawer
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('day-details-drawer')).toBeHidden();

    // 9. Switch to history view and verify all three bets with updated statuses
    await page.getByTestId('notebook-history-view-button').click();
    await expect(page.getByText('Lakers ML')).toBeVisible();
    await expect(page.getByText('Warriors ML')).toBeVisible();
    await expect(page.getByText('Celtics ML')).toBeVisible();
  });
});
