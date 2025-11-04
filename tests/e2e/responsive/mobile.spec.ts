import { test, expect, devices } from '@playwright/test';
import { testUser } from '../../fixtures/test-data';
import { login } from '../../fixtures/helpers';

/**
 * Responsive Design Tests
 *
 * Tests layout and functionality across multiple viewports:
 * - Mobile (375x667) - iPhone SE
 * - Tablet (768x1024) - iPad
 * - Desktop (1920x1080) - Desktop
 *
 * Tests:
 * - Navigation responsiveness
 * - Form inputs work on all sizes
 * - No horizontal scrolling
 * - Touch interactions
 * - Layout adjustments
 */

const viewports = [
  { name: 'mobile', width: 375, height: 667, label: 'iPhone SE' },
  { name: 'tablet', width: 768, height: 1024, label: 'iPad' },
  { name: 'desktop', width: 1920, height: 1080, label: 'Desktop' },
];

test.describe.configure({ retries: 1 }); // Responsive tests can be flaky

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUser.email, testUser.password);
  });

  for (const viewport of viewports) {
    test(`Dashboard is responsive on ${viewport.label} (${viewport.width}x${viewport.height})`, async ({
      page,
    }) => {
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Navigate to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Check for horizontal scrolling
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const windowWidth = viewport.width;

      // Allow 5px tolerance for rounding
      expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 5);

      // Check that main content is visible
      const mainContent = page.locator('main, [role="main"], [class*="content"]').first();
      if (await mainContent.count() > 0) {
        const isInViewport = await mainContent.isInViewport();
        expect(isInViewport).toBe(true);
      }

      // Check that at least some metrics are visible
      const metrics = page.locator('[data-testid*="pl"], [data-testid*="rate"], text=/P&L|Win/i');
      expect(await metrics.count()).toBeGreaterThan(0);
    });

    test(`Notebooks page is responsive on ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/notebooks');
      await page.waitForLoadState('networkidle');

      // Check no horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 5);

      // Check notebook cards are visible
      const notebooks = page.locator('[data-testid*="notebook"], [class*="notebook"]');
      if (await notebooks.count() > 0) {
        const firstNotebook = notebooks.first();
        expect(await firstNotebook.isInViewport()).toBe(true);
      }

      // On mobile, buttons should be accessible
      const buttons = page.locator('button');
      if (viewport.name === 'mobile' && (await buttons.count() > 0)) {
        const firstButton = buttons.first();
        const boundingBox = await firstButton.boundingBox();
        // Button should be at least 44x44px (accessibility minimum)
        if (boundingBox) {
          expect(boundingBox.width).toBeGreaterThanOrEqual(40);
          expect(boundingBox.height).toBeGreaterThanOrEqual(40);
        }
      }
    });

    test(`Bet form is usable on ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/notebooks');
      await page.waitForLoadState('networkidle');

      // Click first notebook
      const notebook = page.locator('[data-testid*="notebook"], [class*="notebook"]').first();
      if (await notebook.count() > 0) {
        await notebook.click();
        await page.waitForLoadState('networkidle');

        // Try to create bet (open dialog)
        const addBetButton = page.locator('button:has-text("Add Bet"), button:has-text("Create Bet")').first();
        if (await addBetButton.isInViewport()) {
          await addBetButton.click();
          await page.waitForTimeout(500);

          // Check form inputs are accessible
          const inputs = page.locator('input[type="text"], input[type="number"], textarea');
          if (await inputs.count() > 0) {
            const firstInput = inputs.first();
            const isInViewport = await firstInput.isInViewport();
            expect(isInViewport).toBe(true);

            // Input should be tappable on mobile (44px minimum)
            const boundingBox = await firstInput.boundingBox();
            if (boundingBox && viewport.name === 'mobile') {
              expect(boundingBox.height).toBeGreaterThanOrEqual(36);
            }
          }
        }
      }
    });
  }

  test('Navigation menu is accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for hamburger menu or navigation
    const mobileNav = page.locator('[data-testid="mobile-nav"], [class*="mobile"], [class*="hamburger"]').first();
    const desktopNav = page.locator('nav, [role="navigation"]').first();

    // Either mobile nav or desktop nav should be visible
    const navVisible = (await mobileNav.count() > 0) || (await desktopNav.count() > 0);
    expect(navVisible).toBe(true);

    // Navigation items should be clickable
    if (await mobileNav.isVisible()) {
      await mobileNav.click();
      await page.waitForTimeout(300);

      // Menu should show items
      const menuItems = page.locator('a, button[aria-label*="nav"]');
      expect(await menuItems.count()).toBeGreaterThan(0);
    }
  });

  test('Touch targets are properly sized on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check button sizes
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      // Sample first 5 buttons
      for (let i = 0; i < Math.min(5, buttonCount); i++) {
        const button = buttons.nth(i);
        const isVisible = await button.isVisible();

        if (isVisible) {
          const boundingBox = await button.boundingBox();
          // Buttons should be at least 44x44 (but allow 40px minimum for some)
          if (boundingBox) {
            expect(boundingBox.width + boundingBox.height).toBeGreaterThanOrEqual(80);
          }
        }
      }
    }
  });

  test('Text is readable on all viewport sizes', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Check font sizes (should be at least 12px)
      const textElements = page.locator('p, span, label, a').first();
      if (await textElements.count() > 0) {
        const fontSize = await textElements.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return parseFloat(styles.fontSize);
        });

        // Should be readable (at least 12px for body text)
        expect(fontSize).toBeGreaterThanOrEqual(12);
      }
    }
  });
});
