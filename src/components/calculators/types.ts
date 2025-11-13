export interface CalculatorInputs {
  unitSize: number;
  unitsToWin: number;
  odds: string;
}

export interface CalculationResult {
  wager: number;
  targetWin: number;
  totalWinnings: number;
  unitsToWin: number;
}

export interface ValidationErrors {
  unitSize?: string;
  unitsToWin?: string;
  odds?: string;
  general?: string;
}

// Parlay Calculator Types
export interface ParlayLeg {
  id: string;
  description: string;
  odds: string;
}

export interface ParlayResult {
  combinedDecimalOdds: number;
  combinedAmericanOdds: number;
  totalPayout: number;
  profit: number;
  overallProbability: number;
  individualProbabilities: number[];
}

export interface ParlayValidationErrors {
  wager?: string;
  legs?: string;
  general?: string;
}

// Note: Arbitrage and Hedge calculators now manage their own types inline
// The types were separated to support independent calculator components

// Kelly Criterion Calculator Types
export interface KellyInputs {
  bettingBookLine: string;
  bettingBookOdds: string;
  sharpBookLine: string;
  sharpBookOdds: string;
  bankroll: number;
  maxBetPercentage: number;
  kellyFraction: number; // 0.25 = 25%, 0.5 = 50%, etc.
}

export interface KellyResult {
  bettingBookImpliedProb: number;
  sharpBookImpliedProb: number;
  edge: number;
  kellyPercentage: number;
  recommendedBetAmount: number;
  finalBetAmount: number;
  expectedValue: number;
  isPositiveEdge: boolean;
  maxBetReached: boolean;
}

export interface KellyValidationErrors {
  bettingBookLine?: string;
  bettingBookOdds?: string;
  sharpBookLine?: string;
  sharpBookOdds?: string;
  bankroll?: string;
  maxBetPercentage?: string;
  kellyFraction?: string;
  general?: string;
} 

// Line Discrepancy EV Calculator Types
export interface LineDiscrepancyInputs {
  mode: 'spread' | 'total';
  yourLine: number;
  yourOdds: string;
  sharpLine: number;
  sharpOdds: string;
  totalSide?: 'over' | 'under'; // required when mode === 'total'
}

export interface LineDiscrepancyResult {
  yourImpliedProb: number; // from your odds (% 0-100)
  sharpProbAtSharpLine: number; // from sharp odds at sharp line (% 0-100)
  modeledProbAtYourLine: number; // modeled probability at your line using normal model (% 0-100)
  edge: number; // modeledProb - yourImpliedProb (% points)
  expectedValuePerDollar: number; // EV for a $1 stake
  decimalOdds: number; // your odds in decimal
  kellyPercentage: number; // full Kelly % of bankroll (0-100)
  quarterKellyUnits: number; // in units where 1.0 QK = 1 unit
}

export interface LineDiscrepancyValidationErrors {
  yourLine?: string;
  yourOdds?: string;
  sharpLine?: string;
  sharpOdds?: string;
  totalSide?: string;
  general?: string;
}