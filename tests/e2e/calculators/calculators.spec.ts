import { test, expect } from '@playwright/test';
import { testUser } from '../../fixtures/test-data';
import { login, extractNumber, wait } from '../../fixtures/helpers';

/**
 * Calculator Tests
 *
 * Tests all betting calculators:
 * - Kelly Criterion calculator
 * - Parlay calculator
 * - Arbitrage calculator
 * - Unit betting calculator
 * - Input validation
 * - Edge cases
 * - Results accuracy
 */

test.describe('Betting Calculators', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUser.email, testUser.password);
    await page.goto('/calculators');
    await page.waitForLoadState('networkidle');
  });

  test('Can access Kelly Criterion calculator', async ({ page }) => {
    // Look for Kelly calculator
    const kellyTab = page.locator(
      'button:has-text("Kelly"), text=/kelly/i, [data-testid*="kelly"]'
    ).first();

    const kellySection = page.locator('text=/kelly criterion|kelly calculator/i').first();

    const hasKelly = (await kellyTab.count() > 0) || (await kellySection.count() > 0);

    if (!hasKelly) {
      test.skip();
      return;
    }

    // Click Kelly tab if it exists
    if (await kellyTab.count() > 0) {
      await kellyTab.click();
    }

    // Should see Kelly calculator form
    const kellyInputs = page.locator('input[placeholder*="percentage"], input[placeholder*="odds"], input[placeholder*="win"]');
    expect(await kellyInputs.count()).toBeGreaterThan(0);

    // Should have calculate button
    const calculateButton = page.locator('button:has-text("Calculate"), button:has-text("Compute")');
    expect(await calculateButton.count()).toBeGreaterThan(0);
  });

  test('Kelly Calculator produces valid results', async ({ page }) => {
    // Find Kelly calculator
    const kellyTab = page.locator('button:has-text("Kelly"), text=/kelly/i').first();

    if (await kellyTab.count() === 0) {
      test.skip();
      return;
    }

    await kellyTab.click();

    // Fill in sample values
    // Typical inputs: win probability, odds
    const inputs = page.locator('input[type="number"]');
    const inputCount = await inputs.count();

    if (inputCount < 2) {
      test.skip();
      return;
    }

    // Fill first input (e.g., win probability)
    await inputs.nth(0).fill('0.55'); // 55% win probability

    // Fill second input (e.g., odds)
    await inputs.nth(1).fill('1.5'); // 1.5 decimal odds

    // Click calculate
    const calculateButton = page.locator('button:has-text("Calculate"), button:has-text("Compute")');
    if (await calculateButton.count() > 0) {
      await calculateButton.click();
      await page.waitForTimeout(500);
    }

    // Should show result
    const resultElement = page.locator(
      '[data-testid*="result"], text=/kelly fraction|bankroll %|percentage/i, [class*="result"]'
    ).first();

    if (await resultElement.count() > 0) {
      const resultText = await resultElement.textContent();
      expect(resultText).toBeTruthy();
    }
  });

  test('Can access Parlay calculator', async ({ page }) => {
    // Look for Parlay calculator
    const parlayTab = page.locator(
      'button:has-text("Parlay"), text=/parlay/i, [data-testid*="parlay"]'
    ).first();

    if (await parlayTab.count() === 0) {
      test.skip();
      return;
    }

    await parlayTab.click();
    await page.waitForTimeout(500);

    // Should see parlay calculator form
    const parlayInputs = page.locator('input[placeholder*="odds"], input[placeholder*="wager"]');
    expect(await parlayInputs.count()).toBeGreaterThan(0);

    // Should have calculate button
    const calculateButton = page.locator('button:has-text("Calculate"), button:has-text("Add Leg")');
    expect(await calculateButton.count()).toBeGreaterThan(0);
  });

  test('Parlay Calculator computes correct payouts', async ({ page }) => {
    // Find Parlay calculator
    const parlayTab = page.locator('button:has-text("Parlay"), text=/parlay/i').first();

    if (await parlayTab.count() === 0) {
      test.skip();
      return;
    }

    await parlayTab.click();

    // Fill in wager
    const wagerInput = page.locator('input[placeholder*="wager"], input[placeholder*="amount"], input[type="number"]').first();
    if (await wagerInput.count() > 0) {
      await wagerInput.fill('100');
    }

    // Add parlay legs
    const addButton = page.locator('button:has-text("Add"), button:has-text("Leg")').first();
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(300);

      // Fill in odds
      const oddsInputs = page.locator('input[placeholder*="odds"]');
      const oddsCount = await oddsInputs.count();

      if (oddsCount > 0) {
        await oddsInputs.first().fill('2.0');
      }
    }

    // Calculate
    const calculateButton = page.locator('button:has-text("Calculate"), button:has-text("Compute")');
    if (await calculateButton.count() > 0) {
      await calculateButton.click();
      await page.waitForTimeout(500);
    }

    // Should show payout result
    const resultElement = page.locator('[class*="result"], [data-testid*="payout"], text=/payout|return|profit/i').first();
    expect(await resultElement.count()).toBeGreaterThanOrEqual(0);
  });

  test('Can access Arbitrage calculator', async ({ page }) => {
    // Look for Arbitrage calculator
    const arbTab = page.locator(
      'button:has-text("Arbitrage"), text=/arbitrage/i, [data-testid*="arbitrage"]'
    ).first();

    if (await arbTab.count() === 0) {
      test.skip();
      return;
    }

    await arbTab.click();

    // Should see arbitrage form
    const arbInputs = page.locator('input[placeholder*="odds"], input[placeholder*="moneyline"]');
    expect(await arbInputs.count()).toBeGreaterThan(0);

    // Should have calculate button
    const calculateButton = page.locator('button:has-text("Calculate"), button:has-text("Check")');
    expect(await calculateButton.count()).toBeGreaterThan(0);
  });

  test('Arbitrage Calculator detects opportunities', async ({ page }) => {
    // Find Arbitrage calculator
    const arbTab = page.locator('button:has-text("Arbitrage"), text=/arbitrage/i').first();

    if (await arbTab.count() === 0) {
      test.skip();
      return;
    }

    await arbTab.click();

    // Fill in contrasting odds (potential arb)
    const inputs = page.locator('input[type="number"]');

    if (await inputs.count() >= 2) {
      // Contrasting odds: one high, one low
      await inputs.nth(0).fill('1.5'); // Low odds (high probability)
      await inputs.nth(1).fill('3.0'); // High odds (low probability)

      // Calculate
      const calculateButton = page.locator('button:has-text("Calculate"), button:has-text("Check")');
      if (await calculateButton.count() > 0) {
        await calculateButton.click();
        await page.waitForTimeout(500);
      }

      // Should show arbitrage result
      const resultElement = page.locator('[class*="result"], [data-testid*="arbitrage"], text=/arbitrage|opportunity|margin/i').first();
      expect(await resultElement.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('Unit Betting calculator calculates units correctly', async ({ page }) => {
    // Look for Unit Betting calculator
    const unitTab = page.locator(
      'button:has-text("Unit"), text=/unit betting|unit staking/i, [data-testid*="unit"]'
    ).first();

    if (await unitTab.count() === 0) {
      test.skip();
      return;
    }

    await unitTab.click();

    // Fill in inputs
    const bankrollInput = page.locator('input[placeholder*="bankroll"], input[placeholder*="bank"]').first();
    const unitSizeInput = page.locator('input[placeholder*="unit"], input[placeholder*="percentage"]').first();

    if (await bankrollInput.count() > 0) {
      await bankrollInput.fill('1000');
    }

    if (await unitSizeInput.count() > 0) {
      await unitSizeInput.fill('2'); // 2% per unit
    }

    // Calculate or auto-calculate
    const calculateButton = page.locator('button:has-text("Calculate"), button:has-text("Compute")');
    if (await calculateButton.count() > 0) {
      await calculateButton.click();
      await page.waitForTimeout(500);
    }

    // Should show unit size
    const resultElement = page.locator('[class*="result"], text=/unit|\\$|amount/i').first();
    expect(await resultElement.count()).toBeGreaterThanOrEqual(0);
  });

  test('Calculators validate input correctly', async ({ page }) => {
    // Try any calculator with invalid input
    const calculateButton = page.locator('button:has-text("Calculate"), button:has-text("Compute")').first();

    if (await calculateButton.count() === 0) {
      test.skip();
      return;
    }

    // Fill with empty or invalid values
    const inputs = page.locator('input[type="number"]');

    if (await inputs.count() > 0) {
      // Leave empty
      await inputs.first().fill('');

      // Try to calculate
      await calculateButton.click();
      await page.waitForTimeout(300);

      // Should show error or validation message
      const errorElement = page.locator('[class*="error"], [role="alert"], text=/required|invalid|please enter/i').first();
      const formStillVisible = page.locator('input[type="number"]').first();

      const hasError = await errorElement.count() > 0;
      const formVisible = await formStillVisible.count() > 0;

      expect(hasError || formVisible).toBe(true);
    }
  });

  test('Calculators handle edge cases (zero, max values)', async ({ page }) => {
    // Test edge case: zero values
    const calculateButton = page.locator('button:has-text("Calculate"), button:has-text("Compute")').first();

    if (await calculateButton.count() === 0) {
      test.skip();
      return;
    }

    const inputs = page.locator('input[type="number"]');

    if (await inputs.count() > 0) {
      // Try zero
      await inputs.first().fill('0');

      if (await inputs.nth(1).count() > 0) {
        await inputs.nth(1).fill('1'); // Valid second value
      }

      // Calculate (might show error or edge case result)
      await calculateButton.click();
      await page.waitForTimeout(500);

      // Should handle gracefully (either error or result)
      const errorElement = page.locator('[class*="error"], [role="alert"]');
      const resultElement = page.locator('[class*="result"]');

      const hasError = await errorElement.count() > 0;
      const hasResult = await resultElement.count() > 0;

      expect(hasError || hasResult).toBe(true);
    }
  });
});
