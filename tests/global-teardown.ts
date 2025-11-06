/**
 * Global teardown for Playwright tests
 *
 * This file runs once after all tests have completed.
 * Cleans up test data from Supabase to prevent database bloat.
 */

import { createClient } from '@supabase/supabase-js';

async function globalTeardown() {
  console.log('Global teardown: Cleaning up test environment...');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Skipping cleanup: Supabase credentials not found');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get test user email from environment
    const testUserEmail = process.env.TEST_USER_EMAIL || 'test@example.com';

    // Get user ID for the test user
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', testUserEmail)
      .single();

    if (userError || !userData) {
      console.warn('Test user not found, skipping cleanup');
      return;
    }

    const userId = userData.id;

    // Delete notebooks (cascading will delete related bets, custom columns, etc.)
    const { error: notebooksError } = await supabase
      .from('notebooks')
      .delete()
      .eq('user_id', userId);

    if (notebooksError) {
      console.error('Error cleaning up notebooks:', notebooksError);
    } else {
      console.log('Successfully cleaned up test notebooks');
    }

    // Delete accounts
    const { error: accountsError } = await supabase
      .from('accounts')
      .delete()
      .eq('user_id', userId);

    if (accountsError) {
      console.error('Error cleaning up accounts:', accountsError);
    } else {
      console.log('Successfully cleaned up test accounts');
    }

    console.log('Global teardown: Complete');
  } catch (error) {
    console.error('Error during global teardown:', error);
  }
}

export default globalTeardown;
