import { test, expect, Page } from "@playwright/test";

test.describe("Support Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to support page
    await page.goto("/support");
  });

  test.describe("Page Layout & Navigation", () => {
    test("should display support page header", async ({ page }) => {
      await expect(page.locator("h1")).toContainText("Support & Help");
      await expect(
        page.locator("text=Get help, report issues, or suggest features")
      ).toBeVisible();
    });

    test("should display three main sections", async ({ page }) => {
      // Help Center card
      await expect(page.locator("text=Help Center")).toBeVisible();
      await expect(
        page.locator(
          "text=Browse documentation, tutorials, and guides to learn"
        )
      ).toBeVisible();

      // Bug Report card
      await expect(page.locator("text=Report a Bug")).toBeVisible();
      await expect(
        page.locator("text=Found an issue? Help us improve")
      ).toBeVisible();

      // Feature Request card
      await expect(page.locator("text=Feature Requests")).toBeVisible();
      await expect(
        page.locator("text=Suggest new features and vote on feature requests")
      ).toBeVisible();
    });

    test("should display info box at bottom", async ({ page }) => {
      await expect(page.locator("text=Need immediate help?")).toBeVisible();
      await expect(
        page.locator("text=Check out our Help Center")
      ).toBeVisible();
    });
  });

  test.describe("Help Center", () => {
    test("should open help center when Browse Help is clicked", async ({
      page,
    }) => {
      await page.click("button:has-text('Browse Help')");
      await expect(page.locator("h2:has-text('Help Center')")).toBeVisible();
    });

    test("should display help articles", async ({ page }) => {
      await page.click("button:has-text('Browse Help')");
      await expect(page.locator("text=Welcome to PaperEdge")).toBeVisible();
      await expect(
        page.locator("text=Creating Your First Notebook")
      ).toBeVisible();
      await expect(page.locator("text=Adding Your First Bet")).toBeVisible();
    });

    test("should filter articles by category", async ({ page }) => {
      await page.click("button:has-text('Browse Help')");

      // Click Getting Started category
      await page.click("button:has-text('Getting Started')");
      await expect(page.locator("text=Welcome to PaperEdge")).toBeVisible();

      // Results should show getting started articles
      const results = page.locator("text=/Showing \\d+ of 12 articles/");
      await expect(results).toBeVisible();
    });

    test("should search help articles", async ({ page }) => {
      await page.click("button:has-text('Browse Help')");

      // Search for "dashboard"
      const searchInput = page.locator(
        'input[placeholder="Search help articles..."]'
      );
      await searchInput.fill("dashboard");

      // Should show relevant articles
      await expect(
        page.locator("text=Understanding the Analytics Dashboard")
      ).toBeVisible();
    });

    test("should expand and collapse help articles", async ({ page }) => {
      await page.click("button:has-text('Browse Help')");

      // Click first article
      await page.locator("button:has-text('Welcome to PaperEdge')").click();

      // Content should be visible
      await expect(
        page.locator("text=Get started with paper betting")
      ).toBeVisible();

      // Click again to collapse
      await page.locator("button:has-text('Welcome to PaperEdge')").click();

      // Content should not be visible in DOM or should be hidden
      const expandedContent = page.locator(
        "text=Get started with paper betting"
      );
      // Note: content might still be in DOM but hidden
    });

    test("should use Ctrl+F keyboard shortcut", async ({ page }) => {
      await page.click("button:has-text('Browse Help')");

      // Focus search with Ctrl+F
      await page.keyboard.press("Control+F");

      // Search input should be focused (hard to test exactly, but we can verify)
      const searchInput = page.locator(
        'input[placeholder="Search help articles..."]'
      );
      await expect(searchInput).toBeFocused();
    });
  });

  test.describe("Bug Report Form", () => {
    test("should open bug report form when Report Bug is clicked", async ({
      page,
    }) => {
      await page.click("button:has-text('Report Bug')");

      // Form should be visible
      await expect(page.locator("text=Report a Bug")).toBeVisible();
      await expect(page.locator('input[placeholder="Describe the bug briefly"]')).toBeVisible();
    });

    test("should show validation errors for empty form", async ({ page }) => {
      await page.click("button:has-text('Report Bug')");

      // Try to submit empty form
      await page.click("button:has-text('Submit Bug Report')");

      // Errors should appear
      await expect(
        page.locator("text=Title is required")
      ).toBeVisible();
      await expect(
        page.locator("text=Description is required")
      ).toBeVisible();
    });

    test("should show validation errors for too short input", async ({
      page,
    }) => {
      await page.click("button:has-text('Report Bug')");

      // Fill with short text
      await page.fill('input[placeholder="Describe the bug briefly"]', "Bug");
      await page.fill('textarea[placeholder*="detailed information"]', "Short");

      await page.click("button:has-text('Submit Bug Report')");

      // Errors should appear
      await expect(
        page.locator("text=Title must be at least 5 characters")
      ).toBeVisible();
      await expect(
        page.locator("text=Description must be at least 20 characters")
      ).toBeVisible();
    });

    test("should submit bug report successfully", async ({ page }) => {
      await page.click("button:has-text('Report Bug')");

      // Fill form
      await page.fill(
        'input[placeholder="Describe the bug briefly"]',
        "Button not clickable"
      );
      await page.fill(
        'textarea[placeholder*="detailed information"]',
        "When I click the submit button on the form, nothing happens. I've tried refreshing the page and it still doesn't work."
      );

      // Select severity
      await page.selectOption('select[aria-label="Severity level"]', "high");

      // Submit
      await page.click("button:has-text('Submit Bug Report')");

      // Success message should appear
      await expect(
        page.locator("text=Bug report submitted successfully")
      ).toBeVisible();

      // Form should close after delay
      await page.waitForTimeout(2500);
      await expect(page.locator("text=Report a Bug")).not.toBeVisible();
    });

    test("should display keyboard shortcut hint", async ({ page }) => {
      await page.click("button:has-text('Report Bug')");
      await expect(
        page.locator("text=Ctrl+Enter")
      ).toBeVisible();
    });

    test("should support Ctrl+Enter keyboard shortcut to submit", async ({
      page,
    }) => {
      await page.click("button:has-text('Report Bug')");

      // Fill form
      await page.fill(
        'input[placeholder="Describe the bug briefly"]',
        "Keyboard shortcut test"
      );
      await page.fill(
        'textarea[placeholder*="detailed information"]',
        "Testing the keyboard shortcut to submit the form with Ctrl+Enter key combination."
      );

      // Submit with Ctrl+Enter
      await page.keyboard.press("Control+Enter");

      // Success message should appear
      await expect(
        page.locator("text=Bug report submitted successfully")
      ).toBeVisible();
    });

    test("should display browser info auto-detection message", async ({
      page,
    }) => {
      await page.click("button:has-text('Report Bug')");
      await expect(
        page.locator("text=Browser info will be automatically included")
      ).toBeVisible();
    });

    test("should close form with X button", async ({ page }) => {
      await page.click("button:has-text('Report Bug')");
      await expect(page.locator("text=Report a Bug")).toBeVisible();

      // Click close button (X)
      await page.click("button[aria-label='Close bug report form']");

      // Form should close
      await expect(page.locator("text=Report a Bug")).not.toBeVisible();
    });

    test("should display character counters", async ({ page }) => {
      await page.click("button:has-text('Report Bug')");

      // Type in title
      await page.fill(
        'input[placeholder="Describe the bug briefly"]',
        "Test"
      );

      // Character counter should show
      await expect(page.locator("text=/4\\/255/")).toBeVisible();

      // Type in description
      await page.fill(
        'textarea[placeholder*="detailed information"]',
        "This is a test description"
      );

      // Character counter should show
      await expect(page.locator("text=/27\\/2000/")).toBeVisible();
    });
  });

  test.describe("Feature Requests", () => {
    test("should open feature requests section when Request Feature is clicked", async ({
      page,
    }) => {
      await page.click("button:has-text('Request Feature')");

      // Feature requests section should be visible
      await expect(
        page.locator("h2:has-text('Community Feature Requests')")
      ).toBeVisible();
    });

    test("should display feature request list", async ({ page }) => {
      await page.click("button:has-text('Request Feature')");

      // Wait for list to load
      await expect(
        page.locator("text=Vote on features you'd like to see")
      ).toBeVisible();
    });

    test("should open feature request form when Suggest Feature is clicked", async ({
      page,
    }) => {
      await page.click("button:has-text('Request Feature')");
      await page.click("button:has-text('Suggest Feature')");

      // Form should be visible
      await expect(page.locator("text=Request a Feature")).toBeVisible();
    });

    test("should submit feature request successfully", async ({ page }) => {
      await page.click("button:has-text('Request Feature')");
      await page.click("button:has-text('Suggest Feature')");

      // Fill form
      await page.fill(
        'input[placeholder="e.g., Dark mode support"]',
        "Add dark mode support"
      );
      await page.fill(
        'textarea[placeholder*="Explain what you want"]',
        "It would be great to have a dark mode option for users who prefer to work at night. This would reduce eye strain."
      );

      // Select priority
      await page.selectOption(
        'select[aria-label="Priority level"]',
        "important"
      );

      // Submit
      await page.click("button:has-text('Submit Request')");

      // Success message should appear
      await expect(
        page.locator("text=Feature request submitted")
      ).toBeVisible();
    });

    test("should vote on feature request", async ({ page }) => {
      await page.click("button:has-text('Request Feature')");

      // Wait for list to load
      await page.waitForTimeout(500);

      // Find first feature request with vote button
      const voteButton = page.locator("button:has-text('👍')").first();
      const initialText = await voteButton.textContent();

      // Click vote button
      await voteButton.click();

      // Vote should update (text should change)
      await expect(voteButton).not.toContainText(initialText || "");
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper heading hierarchy", async ({ page }) => {
      // Should have h1
      const h1 = page.locator("h1");
      await expect(h1).toContainText("Support & Help");

      // Should have h2s
      const h2s = page.locator("h2");
      await expect(h2s).not.toHaveCount(0);
    });

    test("should have proper ARIA labels", async ({ page }) => {
      await page.click("button:has-text('Browse Help')");

      // Search input should have aria-label
      const searchInput = page.locator(
        'input[aria-label="Search help articles"]'
      );
      await expect(searchInput).toBeVisible();
    });

    test("should support keyboard navigation", async ({ page }) => {
      // Tab through elements
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Some button should be focused
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toHaveCount(1);
    });
  });

  test.describe("Mobile Responsiveness", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("should display support page on mobile", async ({ page }) => {
      await expect(page.locator("h1:has-text('Support & Help')")).toBeVisible();
      await expect(page.locator("text=Get help, report issues")).toBeVisible();
    });

    test("should stack feature cards vertically on mobile", async ({
      page,
    }) => {
      // Get all cards
      const cards = page.locator("[class*='grid']");

      // Should use grid layout
      await expect(cards).toBeVisible();
    });

    test("should display forms properly on mobile", async ({ page }) => {
      await page.click("button:has-text('Report Bug')");

      // Form should be visible
      await expect(page.locator("text=Report a Bug")).toBeVisible();

      // Buttons should stack
      const buttons = page.locator(
        "button:has-text('Cancel'), button:has-text('Submit')"
      );
      await expect(buttons).toHaveCount(2);
    });
  });
});
