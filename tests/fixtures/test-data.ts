/**
 * Test data fixtures for Playwright tests
 * Based on REFACTORING_TEST_PLAN.md
 */

export interface TestBet {
  description: string;
  status: 'won' | 'lost' | 'push' | 'pending';
  wager_amount: number;
  odds: number;
  return_amount?: number;
  bet_date: string;
  custom_values?: Record<string, string | number>;
}

export interface TestNotebook {
  name: string;
  starting_bankroll: number;
  bets: TestBet[];
  custom_columns?: CustomColumn[];
}

export interface CustomColumn {
  name: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
}

/**
 * Test user credentials
 * Loaded from .env.test file
 */
export const testUser = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'test123456',
};

/**
 * Custom columns for testing
 */
export const customColumns: CustomColumn[] = [
  {
    name: 'Sport',
    type: 'select',
    options: ['Football', 'Basketball', 'Baseball']
  },
  {
    name: 'League',
    type: 'select',
    options: ['NFL', 'NBA', 'MLB', 'Other']
  },
  {
    name: 'Bet Type',
    type: 'select',
    options: ['Spread', 'Moneyline', 'Over/Under']
  },
  {
    name: 'Notes',
    type: 'text'
  },
  {
    name: 'Confidence',
    type: 'number'
  },
];

/**
 * Test notebooks with various bet scenarios
 *
 * NFL 2024 Notebook Expected Calculations:
 * - Total P&L: +$100
 * - Completed bets: 3 (won, lost, push)
 * - Won bets: 1
 * - Win Rate: 33.33%
 * - Total Wagered (for ROI): $150 (won + lost only)
 * - ROI: 66.67%
 */
export const notebooks: TestNotebook[] = [
  {
    name: 'NFL 2024',
    starting_bankroll: 1000,
    custom_columns: customColumns,
    bets: [
      {
        description: 'Chiefs -3.5',
        status: 'won',
        wager_amount: 100,
        odds: 150, // +150 American odds
        return_amount: 150, // Profit only
        bet_date: '2024-01-15',
        custom_values: {
          'Sport': 'Football',
          'League': 'NFL',
          'Bet Type': 'Spread',
          'Confidence': 8,
        },
      },
      {
        description: 'Cowboys ML',
        status: 'lost',
        wager_amount: 50,
        odds: -110,
        bet_date: '2024-01-16',
        custom_values: {
          'Sport': 'Football',
          'League': 'NFL',
          'Bet Type': 'Moneyline',
          'Confidence': 6,
        },
      },
      {
        description: 'Bills vs Dolphins Over 47',
        status: 'push',
        wager_amount: 75,
        odds: 200,
        bet_date: '2024-01-17',
        custom_values: {
          'Sport': 'Football',
          'League': 'NFL',
          'Bet Type': 'Over/Under',
        },
      },
      {
        description: 'Ravens ML',
        status: 'pending',
        wager_amount: 25,
        odds: -150,
        bet_date: '2024-01-18',
        custom_values: {
          'Sport': 'Football',
          'League': 'NFL',
          'Bet Type': 'Moneyline',
        },
      },
    ],
  },
  {
    name: 'NBA 2024',
    starting_bankroll: 500,
    bets: [
      {
        description: 'Lakers ML',
        status: 'won',
        wager_amount: 200,
        odds: 100, // +100 American odds (even money)
        return_amount: 200, // Profit only
        bet_date: '2024-01-15',
      },
      {
        description: 'Celtics -5.5',
        status: 'lost',
        wager_amount: 150,
        odds: -120,
        bet_date: '2024-01-16',
      },
    ],
  },
  {
    name: 'MLB 2024',
    starting_bankroll: 750,
    bets: [
      {
        description: 'Yankees ML',
        status: 'won',
        wager_amount: 100,
        odds: 110,
        return_amount: 110,
        bet_date: '2024-04-01',
      },
    ],
  },
];

/**
 * Expected calculations for NFL 2024 notebook (TC-1.4)
 */
export const nflExpectedCalculations = {
  totalPL: 100, // +150 (won) - 50 (lost) = +100
  completedBets: 3, // won, lost, push
  wonBets: 1,
  winRate: 33.33, // (1 / 3) * 100
  totalWagered: 150, // 100 (won) + 50 (lost), excludes push and pending
  roi: 66.67, // (100 / 150) * 100
};

/**
 * Expected calculations for NBA 2024 notebook
 */
export const nbaExpectedCalculations = {
  totalPL: 50, // +200 (won) - 150 (lost) = +50
  completedBets: 2,
  wonBets: 1,
  winRate: 50.0,
  totalWagered: 350, // 200 + 150
  roi: 14.29, // (50 / 350) * 100
};

/**
 * Expected calculations for MLB 2024 notebook
 */
export const mlbExpectedCalculations = {
  totalPL: 110,
  completedBets: 1,
  wonBets: 1,
  winRate: 100.0,
  totalWagered: 100,
  roi: 110.0,
};

/**
 * Expected dashboard totals (all notebooks combined)
 */
export const dashboardExpectedCalculations = {
  totalPL: 260, // 100 (NFL) + 50 (NBA) + 110 (MLB)
  completedBets: 6, // 3 + 2 + 1
  wonBets: 3,
  winRate: 50.0, // (3 / 6) * 100
  totalWagered: 600, // 150 + 350 + 100
  roi: 43.33, // (260 / 600) * 100
};

/**
 * Edge case bets for custom column testing
 */
export const customColumnEdgeCases = {
  // Test "Other" option filtering
  sportColumnWithOtherVariants: {
    name: 'Sport',
    type: 'select' as const,
    options: ['Football', 'Basketball', 'Other', 'other', 'Other...', 'other…', 'OTHER'],
  },

  // Test case-insensitive deduplication
  duplicateColumns: [
    { name: 'sport', type: 'text' as const },
    { name: 'Sport', type: 'text' as const },
    { name: 'SPORT', type: 'text' as const },
  ],
};
