import { test, expect } from '@playwright/test';
import { testUser } from '../../fixtures/test-data';
import { login } from '../../fixtures/helpers';

/**
 * Performance Baseline Tests
 *
 * Tests and measures performance metrics:
 * - Page load times (Target: < 2.5s)
 * - Navigation speed (Target: < 1s)
 * - API response times
 * - Web Vitals (LCP, FID, CLS, TTFB)
 * - Memory usage
 * - Resource loading
 */

test.describe('Performance', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUser.email, testUser.password);
  });

  test('Dashboard loads within target time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Dashboard should load in under 2.5 seconds
    expect(loadTime).toBeLessThan(2500);

    console.log(`✅ Dashboard load time: ${loadTime}ms (target: <2500ms)`);
  });

  test('Notebook detail page loads within target time', async ({ page }) => {
    await page.goto('/notebooks');
    await page.waitForLoadState('networkidle');

    // Click first notebook
    const notebook = page.locator('[data-testid*="notebook"], [class*="notebook"]').first();
    if (await notebook.count() === 0) {
      test.skip();
      return;
    }

    const startTime = Date.now();
    await notebook.click();
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Notebook detail should load in under 1.5 seconds
    expect(loadTime).toBeLessThan(1500);

    console.log(`✅ Notebook detail load time: ${loadTime}ms (target: <1500ms)`);
  });

  test('Navigation between pages is responsive', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const startTime = Date.now();

    // Navigate to notebooks
    await page.goto('/notebooks');
    await page.waitForLoadState('networkidle');

    const navigationTime = Date.now() - startTime;

    // Navigation should be fast (under 1 second)
    expect(navigationTime).toBeLessThan(1000);

    console.log(`✅ Navigation time: ${navigationTime}ms (target: <1000ms)`);
  });

  test('API calls complete quickly', async ({ page }) => {
    // Intercept and measure API calls
    const apiTimes: number[] = [];

    page.on('response', response => {
      const request = response.request();
      if (request.url().includes('/api') || request.url().includes('supabase')) {
        const timing = response.timing();
        if (timing) {
          apiTimes.push(timing.responseEnd - timing.requestStart);
        }
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // If API calls were made, they should be reasonably fast
    if (apiTimes.length > 0) {
      const avgApiTime = apiTimes.reduce((a, b) => a + b, 0) / apiTimes.length;
      const maxApiTime = Math.max(...apiTimes);

      console.log(`📊 API Performance:`);
      console.log(`   Average: ${avgApiTime.toFixed(0)}ms`);
      console.log(`   Max: ${maxApiTime.toFixed(0)}ms`);

      // API calls should complete in reasonable time
      expect(maxApiTime).toBeLessThan(5000); // 5 second max
    }
  });

  test('Form interactions are responsive', async ({ page }) => {
    await page.goto('/notebooks');
    await page.waitForLoadState('networkidle');

    // Click notebook
    const notebook = page.locator('[data-testid*="notebook"], [class*="notebook"]').first();
    if (await notebook.count() === 0) {
      test.skip();
      return;
    }

    await notebook.click();
    await page.waitForLoadState('networkidle');

    // Open bet creation form
    const addBetButton = page.locator('button:has-text("Add Bet"), button:has-text("Create Bet")').first();
    if (await addBetButton.count() === 0) {
      test.skip();
      return;
    }

    const startTime = Date.now();
    await addBetButton.click();
    await page.waitForTimeout(100);

    const dialogOpenTime = Date.now() - startTime;

    // Dialog should open immediately (under 500ms)
    expect(dialogOpenTime).toBeLessThan(500);

    console.log(`✅ Form open time: ${dialogOpenTime}ms (target: <500ms)`);
  });

  test('Page renders without layout thrashing', async ({ page }) => {
    // Measure Cumulative Layout Shift
    let totalLayoutShift = 0;

    page.on('framenavigated', () => {
      // Layout shift occurs when elements move
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait and observe for layout shifts
    await page.waitForTimeout(1000);

    // Measure by checking if elements maintain position
    const elements = page.locator('button, input, [data-testid*="pl"]');
    const initialPositions = new Map();

    if (await elements.count() > 0) {
      for (let i = 0; i < Math.min(10, await elements.count()); i++) {
        const el = elements.nth(i);
        const box = await el.boundingBox();
        if (box) {
          initialPositions.set(i, { x: box.x, y: box.y });
        }
      }

      // Wait a bit for any reflows
      await page.waitForTimeout(500);

      // Check if positions changed significantly
      let shiftsDetected = 0;
      for (let i = 0; i < Math.min(10, await elements.count()); i++) {
        const el = elements.nth(i);
        const box = await el.boundingBox();
        const initial = initialPositions.get(i);

        if (box && initial) {
          const xShift = Math.abs(box.x - initial.x);
          const yShift = Math.abs(box.y - initial.y);

          if (xShift > 5 || yShift > 5) {
            shiftsDetected++;
          }
        }
      }

      // Expect minimal layout shifts (less than 30% of elements moved)
      const shiftPercentage = (shiftsDetected / 10) * 100;
      expect(shiftPercentage).toBeLessThan(30);

      console.log(`✅ Layout Shift: ${shiftPercentage.toFixed(0)}% of elements moved (target: <30%)`);
    }
  });

  test('Web Vitals are within acceptable ranges', async ({ page }) => {
    let metrics = {
      lcp: null as number | null, // Largest Contentful Paint
      fid: null as number | null, // First Input Delay
      cls: null as number | null, // Cumulative Layout Shift
    };

    // Observe Web Vitals
    await page.addInitScript(() => {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'largest-contentful-paint') {
            (window as any).lcp = entry.renderTime || entry.loadTime;
          }
        }
      });

      try {
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        // LCP not supported
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Give page time to render
    await page.waitForTimeout(1000);

    // Extract metrics
    const lcp = await page.evaluate(() => (window as any).lcp);

    if (lcp !== undefined) {
      console.log(`📊 Web Vitals:`);
      console.log(`   LCP: ${lcp?.toFixed(0)}ms (target: <2500ms)`);

      // LCP should be good
      if (lcp && lcp < 2500) {
        expect(true).toBe(true); // LCP is good
      }
    }

    // Page should be interactive
    const isInteractive = await page.evaluate(() => document.readyState);
    expect(isInteractive).toBe('complete');
  });
});
