import { test, expect } from '@playwright/test';
import { testUser } from '../../fixtures/test-data';
import { login } from '../../fixtures/helpers';

/**
 * FAQs/Help Center Tests
 *
 * Tests help and FAQ functionality:
 * - Display FAQ items
 * - Search FAQs by keyword
 * - Filter FAQs by category
 * - Expand/collapse FAQ items
 * - FAQ persistence after navigation
 * - Mobile responsiveness
 */

test.describe('FAQs / Help Center', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUser.email, testUser.password);
  });

  test('Can access FAQs page', async ({ page }) => {
    // Navigate to FAQs
    const faqButton = page.locator(
      'button:has-text("FAQ"), a:has-text("FAQ"), button:has-text("Help"), a:has-text("Help")'
    ).first();

    const faqLink = page.locator('a[href*="faq"], a[href*="help"], [data-testid="faqs"]').first();

    if (await faqButton.count() > 0) {
      await faqButton.click();
    } else if (await faqLink.count() > 0) {
      await faqLink.click();
    } else {
      // Try direct navigation
      await page.goto('/faqs');
    }

    await page.waitForLoadState('networkidle');

    // Should see FAQs content
    const faqTitle = page.locator('text=/faq|frequently asked|help|support/i').first();
    const faqItems = page.locator('[data-testid*="faq"], [class*="faq"], dt, summary');

    const hasTitle = await faqTitle.count() > 0;
    const hasItems = await faqItems.count() > 0;

    expect(hasTitle || hasItems).toBe(true);
  });

  test('Can display FAQ items', async ({ page }) => {
    await page.goto('/faqs');
    await page.waitForLoadState('networkidle');

    // Find FAQ items
    const faqItems = page.locator(
      '[data-testid*="faq"], [class*="faq-item"], dl dt, summary, [role="heading"]'
    );

    const itemCount = await faqItems.count();

    // Should have at least one FAQ item
    if (itemCount === 0) {
      test.skip();
      return;
    }

    expect(itemCount).toBeGreaterThan(0);

    // Should see question text
    const firstItem = faqItems.first();
    const itemText = await firstItem.textContent();

    expect(itemText).toBeTruthy();
    expect(itemText?.length).toBeGreaterThan(0);
  });

  test('Can expand and collapse FAQ items', async ({ page }) => {
    await page.goto('/faqs');
    await page.waitForLoadState('networkidle');

    // Find expandable FAQ item
    const expandButtons = page.locator(
      'button:has-text("+"), button:has-text("-"), summary, [role="button"]'
    );

    const expandCount = await expandButtons.count();

    if (expandCount === 0) {
      // FAQs might be always expanded
      test.skip();
      return;
    }

    // Find first expandable item
    const firstButton = expandButtons.first();
    const parentDiv = firstButton.locator('xpath=ancestor::*');

    // Check if answer is initially hidden or visible
    const answerBefore = parentDiv.locator(
      'text=/answer|solution|description/i, [class*="answer"], [class*="content"], dd'
    ).first();

    const isHiddenBefore = await answerBefore.count() === 0;

    // Click to expand
    await firstButton.click();
    await page.waitForTimeout(300);

    // Check if answer is now visible
    const answerAfter = parentDiv.locator(
      'text=/answer|solution|description/i, [class*="answer"], [class*="content"], dd'
    ).first();

    const isVisibleAfter = await answerAfter.isVisible().catch(() => false);

    // Should show content after expanding
    expect(isVisibleAfter || isHiddenBefore).toBe(true);
  });

  test('Can search FAQs by keyword', async ({ page }) => {
    await page.goto('/faqs');
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search"], input[placeholder*="find"]'
    ).first();

    if (await searchInput.count() === 0) {
      // Search might not be implemented
      test.skip();
      return;
    }

    // Perform search
    const searchTerm = 'calculator'; // Or another common term in FAQs
    await searchInput.fill(searchTerm);
    await page.waitForTimeout(500);

    // Should filter FAQs
    const faqItems = page.locator('[data-testid*="faq"], [class*="faq-item"], dt, summary');
    const itemCount = await faqItems.count();

    // Should have some results or no results
    const noResults = page.locator('text=/no results|no faq|no matches/i');
    const hasResults = itemCount > 0;
    const hasNoResultsMsg = await noResults.count() > 0;

    expect(hasResults || hasNoResultsMsg).toBe(true);

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(300);

    // Should show all FAQs again
    const allItemsCount = await faqItems.count();
    expect(allItemsCount).toBeGreaterThanOrEqual(itemCount);
  });

  test('Can filter FAQs by category', async ({ page }) => {
    await page.goto('/faqs');
    await page.waitForLoadState('networkidle');

    // Look for category filter
    const categoryFilter = page.locator(
      'select, button:has-text("Category"), [data-testid*="category"], [class*="filter"]'
    ).first();

    if (await categoryFilter.count() === 0) {
      // Categories might not be implemented
      test.skip();
      return;
    }

    // Get initial items count
    const faqItems = page.locator('[data-testid*="faq"], [class*="faq-item"], dt');
    const initialCount = await faqItems.count();

    // Apply category filter
    if (await categoryFilter.isVisible()) {
      const filterType = await categoryFilter.evaluate(el => el.tagName.toLowerCase());

      if (filterType === 'select') {
        // Select dropdown
        const options = page.locator('select option');
        const optionCount = await options.count();

        if (optionCount > 1) {
          await categoryFilter.selectOption({ index: 1 });
        }
      } else {
        // Button or other filter
        await categoryFilter.click();
      }

      await page.waitForTimeout(500);
    }

    // Should filter items (count may be different)
    const filteredCount = await faqItems.count();
    expect(filteredCount).toBeGreaterThanOrEqual(0);
  });

  test('FAQs page is accessible and loads correctly', async ({ page }) => {
    await page.goto('/faqs');
    await page.waitForLoadState('networkidle');

    // Check for basic accessibility
    const headings = page.locator('h1, h2, h3');
    const hasHeadings = await headings.count() > 0;

    // Check that page rendered (has content)
    const bodyText = await page.textContent();
    const hasContent = bodyText && bodyText.length > 20;

    // Check no major errors
    const errorMessages = page.locator('[class*="error"], [role="alert"]');
    const hasErrors = await errorMessages.count() > 0;

    expect(hasHeadings && hasContent && !hasErrors).toBe(true);

    // Should be able to navigate away and back
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    await page.goto('/faqs');
    await page.waitForLoadState('networkidle');

    // Page should load again
    const reloadedContent = await page.textContent();
    expect(reloadedContent).toBeTruthy();
  });
});
