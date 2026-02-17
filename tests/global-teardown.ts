/**
 * Global teardown for Playwright tests
 *
 * Cleans up test data from Supabase after all tests complete.
 * Authenticates as the test user first so RLS policies allow deletion.
 */

import { createClient } from '@supabase/supabase-js';

async function globalTeardown() {
  console.log('Global teardown: Cleaning up test environment...');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
  const testPassword = process.env.TEST_USER_PASSWORD || 'test123456';

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Skipping cleanup: Supabase credentials not found');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate as the test user so RLS policies allow deletion
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.warn('Could not authenticate test user, skipping cleanup:', authError.message);
      return;
    }

    // Delete notebooks (cascading will delete related bets, custom columns, etc.)
    const { error: notebooksError } = await supabase
      .from('notebooks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all rows for authenticated user

    if (notebooksError) {
      console.error('Error cleaning up notebooks:', notebooksError);
    } else {
      console.log('Successfully cleaned up test notebooks');
    }

    // Delete accounts
    const { error: accountsError } = await supabase
      .from('accounts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (accountsError) {
      console.error('Error cleaning up accounts:', accountsError);
    } else {
      console.log('Successfully cleaned up test accounts');
    }

    await supabase.auth.signOut();
    console.log('Global teardown: Complete');
  } catch (error) {
    console.error('Error during global teardown:', error);
  }
}

export default globalTeardown;
