/**
 * Test data fixtures for PaperEdge E2E tests
 *
 * This file contains all test data used across test suites.
 * Using consistent test data helps with test reliability and debugging.
 */

export const testUsers = {
  // Valid test user for most tests
  // These credentials match .env.test file
  validUser: {
    email: process.env.TEST_EMAIL || 'test@example.com',
    password: process.env.TEST_PASSWORD || 'test123456',
    name: 'Test User',
  },

  // Alternative valid user for multi-user scenarios
  alternateUser: {
    email: 'alternate@example.com',
    password: 'alternate123456',
    name: 'Alternate User',
  },

  // Invalid/edge case users
  invalidEmail: {
    email: 'invalid-email',
    password: 'Password123!',
  },

  weakPassword: {
    email: 'weak@paperedge.com',
    password: '123',
  },

  nonExistentUser: {
    email: 'nonexistent@paperedge.com',
    password: 'Password123!',
  },

  sqlInjection: {
    email: "admin'--",
    password: "' OR '1'='1",
  },

  xssAttempt: {
    email: '<script>alert("xss")</script>@test.com',
    password: 'Password123!',
  },
};

export const testNotebooks = {
  basic: {
    name: 'NFL 2024 Season',
    description: 'Testing NFL betting strategies',
    color: 'blue',
    starting_bankroll: 1000,
  },

  withoutDescription: {
    name: 'NBA Bets',
    color: 'green',
    starting_bankroll: 500,
  },

  minimal: {
    name: 'Quick Test',
    color: 'red',
    starting_bankroll: 100,
  },

  edgeCase: {
    name: 'A'.repeat(100), // Very long name
    description: 'B'.repeat(500), // Very long description
    color: 'purple',
    starting_bankroll: 99999.99,
  },
};

export const testBets = {
  pending: {
    description: 'Chiefs -7.5 vs Raiders',
    odds: -110,
    wager_amount: 100,
    status: 'pending' as const,
    date: new Date().toISOString().split('T')[0],
  },

  won: {
    description: 'Lakers ML vs Celtics',
    odds: 150,
    wager_amount: 50,
    status: 'won' as const,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    return_amount: 75,
  },

  lost: {
    description: 'Yankees -1.5 vs Red Sox',
    odds: -150,
    wager_amount: 75,
    status: 'lost' as const,
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // 2 days ago
  },

  push: {
    description: 'Totals O 48.5',
    odds: -110,
    wager_amount: 100,
    status: 'push' as const,
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
  },

  highOdds: {
    description: 'Long shot parlay',
    odds: 1000,
    wager_amount: 10,
    status: 'pending' as const,
    date: new Date().toISOString().split('T')[0],
  },

  negativeOdds: {
    description: 'Heavy favorite',
    odds: -500,
    wager_amount: 500,
    status: 'pending' as const,
    date: new Date().toISOString().split('T')[0],
  },
};

export const testAccounts = {
  sportsbook: {
    name: 'DraftKings',
    kind: 'main' as const,
  },

  other: {
    name: 'Local Bookie',
    kind: 'other' as const,
  },
};

export const testCustomColumns = {
  selectColumn: {
    column_name: 'Sport',
    column_type: 'select' as const,
    select_options: ['NFL', 'NBA', 'MLB', 'NHL', 'Soccer'],
  },

  textColumn: {
    column_name: 'Notes',
    column_type: 'text' as const,
  },

  numberColumn: {
    column_name: 'Confidence',
    column_type: 'number' as const,
  },
};

// Error messages that the application should display
export const errorMessages = {
  auth: {
    invalidEmail: 'Invalid email format',
    wrongPassword: 'Invalid login credentials',
    userNotFound: 'Invalid login credentials',
    weakPassword: 'Password should be at least 6 characters',
    passwordMismatch: 'Passwords do not match',
    emailExists: 'User already registered',
    requiredField: 'This field is required',
    expiredToken: 'Password reset token has expired',
  },

  notebook: {
    nameRequired: 'Notebook name is required',
    invalidColor: 'Invalid color selection',
  },

  bet: {
    invalidOdds: 'Odds must be a valid number',
    invalidWager: 'Wager must be greater than 0',
    requiredDescription: 'Bet description is required',
  },
};

// Success messages
export const successMessages = {
  auth: {
    loginSuccess: 'Welcome back!',
    registerSuccess: 'Account created successfully',
    passwordResetSent: 'Password reset email sent',
    passwordUpdated: 'Password updated successfully',
  },

  notebook: {
    created: 'Notebook created',
    updated: 'Notebook updated',
    deleted: 'Notebook deleted',
  },

  bet: {
    created: 'Bet added',
    updated: 'Bet updated',
    deleted: 'Bet deleted',
  },
};
