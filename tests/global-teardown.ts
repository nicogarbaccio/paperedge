import { createClient } from '@supabase/supabase-js';

/**
 * Global teardown - runs after all tests complete
 * Cleans up any test accounts created during test runs
 */
async function globalTeardown() {
  console.log('Running global test teardown...');

  // Skip cleanup if main test user credentials aren't set
  const testUserEmail = process.env.TEST_USER_EMAIL;
  if (!testUserEmail) {
    console.log('No test user email found, skipping cleanup');
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('Supabase credentials not found, skipping cleanup');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get list of test accounts to preserve (we DON'T want to delete these)
  const preserveAccounts = [testUserEmail];

  console.log(`Preserving main test account: ${testUserEmail}`);

  // TODO: Add logic here to delete any test accounts created during tests
  // For example, if tests create accounts like "test-signup-123@example.com"
  // we can query for and delete those here

  // Example pattern matching for cleanup:
  // const { data: testAccounts } = await supabase.auth.admin.listUsers();
  // const accountsToDelete = testAccounts?.users.filter(user =>
  //   user.email?.startsWith('test-') &&
  //   !preserveAccounts.includes(user.email)
  // );

  // Note: Deleting users requires admin API which needs service_role key
  // For now, we'll just log a reminder
  console.log('Test cleanup complete. Remember to manually clean up any test accounts if needed.');
}

export default globalTeardown;
