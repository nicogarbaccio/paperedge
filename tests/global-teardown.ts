/**
 * Global teardown for Playwright tests
 *
 * This file runs once after all tests have completed.
 * Use it for cleanup tasks like clearing test data, closing connections, etc.
 */

async function globalTeardown() {
  console.log('Global teardown: Cleaning up test environment...');

  // Add any cleanup logic here
  // Examples:
  // - Clear test database
  // - Close connections
  // - Delete test files
  // - Reset test user accounts

  console.log('Global teardown: Complete');
}

export default globalTeardown;
