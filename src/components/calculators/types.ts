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