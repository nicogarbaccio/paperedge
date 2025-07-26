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