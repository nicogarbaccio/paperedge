/**
 * Global setup for Playwright tests
 *
 * Authenticates once and saves browser state (cookies, localStorage)
 * so all tests can reuse the session without logging in through the UI.
 */

import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const STORAGE_STATE_PATH = path.resolve(__dirname, '.auth/storageState.json');

async function globalSetup() {
  const isCI = !!process.env.CI;
  const baseURL = isCI ? 'http://localhost:4173' : 'http://localhost:5173';
  const email = process.env.TEST_USER_EMAIL || 'test@example.com';
  const password = process.env.TEST_USER_PASSWORD || 'test123456';

  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByTestId('login-submit-button').click();

  // Wait for successful login
  await page.waitForURL('**/dashboard', { timeout: 30000 });

  // Save authenticated state
  await page.context().storageState({ path: STORAGE_STATE_PATH });
  await browser.close();
}

export default globalSetup;
