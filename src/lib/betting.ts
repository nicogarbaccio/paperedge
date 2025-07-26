/**
 * Calculate the potential return from a bet based on American odds
 * @param odds American odds (e.g., +110, -150)
 * @param wager The wager amount
 * @returns The potential profit (not including the original wager)
 */
export function calculateReturn(odds: number, wager: number): number {
  if (odds > 0) {
    // Positive odds: (odds/100) * wager
    return (odds / 100) * wager
  } else {
    // Negative odds: (100/|odds|) * wager
    return (100 / Math.abs(odds)) * wager
  }
}

/**
 * Calculate the total payout (original wager + profit)
 * @param odds American odds
 * @param wager The wager amount
 * @returns Total payout if bet wins
 */
export function calculatePayout(odds: number, wager: number): number {
  return wager + calculateReturn(odds, wager)
}

/**
 * Convert American odds to decimal odds
 * @param americanOdds American odds (e.g., +110, -150)
 * @returns Decimal odds
 */
export function americanToDecimal(americanOdds: number): number {
  if (americanOdds > 0) {
    return (americanOdds / 100) + 1
  } else {
    return (100 / Math.abs(americanOdds)) + 1
  }
}

/**
 * Convert American odds to implied probability
 * @param americanOdds American odds
 * @returns Implied probability as a percentage (0-100)
 */
export function getImpliedProbability(americanOdds: number): number {
  if (americanOdds > 0) {
    return (100 / (americanOdds + 100)) * 100
  } else {
    return (Math.abs(americanOdds) / (Math.abs(americanOdds) + 100)) * 100
  }
}

/**
 * Validate American odds format
 * @param odds The odds to validate
 * @returns True if valid American odds
 */
export function isValidAmericanOdds(odds: number): boolean {
  // Must be an integer
  if (!Number.isInteger(odds)) return false
  
  // Cannot be 0, -100, or between -100 and +100 (except +100)
  if (odds === 0 || odds === -100 || (odds > -100 && odds < 100 && odds !== 100)) {
    return false
  }
  
  return true
}

/**
 * Format odds for display
 * @param odds American odds
 * @returns Formatted string with + for positive odds
 */
export function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`
}

/**
 * Calculate win rate from bet results
 * @param bets Array of bet objects with status
 * @returns Win rate as percentage (0-100)
 */
export function calculateWinRate(bets: Array<{ status: string }>): number {
  const completedBets = bets.filter(bet => 
    ['won', 'lost', 'push'].includes(bet.status)
  )
  
  if (completedBets.length === 0) return 0
  
  const wins = completedBets.filter(bet => bet.status === 'won').length
  return (wins / completedBets.length) * 100
}

/**
 * Calculate total profit/loss from bets
 * @param bets Array of bet objects
 * @returns Total P&L
 */
export function calculateTotalPL(bets: Array<{ 
  status: string
  wager_amount: number
  return_amount: number | null 
}>): number {
  return bets.reduce((total, bet) => {
    if (bet.status === 'won' && bet.return_amount) {
      return total + bet.return_amount
    } else if (bet.status === 'lost') {
      return total - bet.wager_amount
    }
    // Push or pending bets don't affect P&L
    return total
  }, 0)
}

/**
 * Calculate ROI from bets
 * @param bets Array of bet objects
 * @returns ROI as percentage
 */
export function calculateROI(bets: Array<{ 
  status: string
  wager_amount: number
  return_amount: number | null 
}>): number {
  const totalWagered = bets
    .filter(bet => ['won', 'lost'].includes(bet.status))
    .reduce((total, bet) => total + bet.wager_amount, 0)
  
  if (totalWagered === 0) return 0
  
  const totalPL = calculateTotalPL(bets)
  return (totalPL / totalWagered) * 100
} 