import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Compact currency for constrained UIs (no cents)
 */
export function formatCurrencyNoCents(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Compact currency for tiny UIs like calendar cells.
 * Shows $1.2K for thousands, $45 for smaller values.
 */
export function formatCurrencyCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1000) {
    const k = amount / 1000;
    const formatted = Math.abs(k) >= 10
      ? `$${k.toFixed(0)}K`
      : `$${k.toFixed(1)}K`;
    return formatted.replace('$-', '-$');
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

/**
 * Parse date string to Date object in local timezone
 * This prevents dates from shifting due to UTC conversion issues
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  // Parse the date string and create a date object in local timezone
  // This prevents the date from shifting due to UTC conversion
  const localDate = parseLocalDate(dateString);
  
  return localDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format date for input fields (YYYY-MM-DD)
 * Uses local timezone to avoid date shifting issues
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current local date in YYYY-MM-DD format
 */
export function getCurrentLocalDate(): string {
  const now = new Date()
  return formatDateForInput(now)
}

/**
 * Get status color class for bet status
 */
export function getStatusColorClass(status: string): string {
  switch (status) {
    case 'won':
      return 'text-profit'
    case 'lost':
      return 'text-loss'
    case 'push':
      return 'text-text-secondary'
    case 'pending':
      return 'text-orange-400'
    default:
      return 'text-text-secondary'
  }
}

/**
 * Get P&L color class
 */
export function getPLColorClass(value: number): string {
  if (value > 0) return 'text-profit'
  if (value < 0) return 'text-loss'
  return 'text-text-secondary'
}

/**
 * Capitalize first letter of a string
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Clean win rate for display
 */
export function cleanWinRate(winRate: number): number {
  if (winRate === 0) return 0
  if (winRate < 0.1) return 0.1
  if (winRate > 99.9) return 99.9
  return Math.round(winRate * 10) / 10
}

/**
 * Clean ROI for display
 */
export function cleanROI(roi: number): number {
  if (Math.abs(roi) < 0.1) return 0
  return Math.round(roi * 10) / 10
}

/**
 * Check if a value is within a range (inclusive)
 */
export function isInRange(value: number, min: number | null, max: number | null): boolean {
  if (min !== null && value < min) return false
  if (max !== null && value > max) return false
  return true
}

/**
 * Convert string to number safely
 */
export function safeNumber(value: string | number | null | undefined): number | null {
  if (typeof value === 'number') return value
  if (!value || value === '') return null
  const num = parseFloat(value.toString())
  return isNaN(num) ? null : num
}

/**
 * Basic debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined = undefined

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Custom field categories for visual styling
 */
export type CustomFieldCategory = 'game' | 'league' | 'market' | 'sportsbook' | 'notes';

/**
 * Categorize custom field based on column name
 * 
 * DETECTION ORDER IS CRITICAL:
 * 1. Game (most specific matchup/opponent fields)
 * 2. Sportsbook (MUST come before league - "sportsbook" contains "sport")
 * 3. League (after sportsbook to avoid false positives)
 * 4. Market (bet types and lines)
 * 5. Notes (fallback for everything else)
 * 
 * ⚠️  WARNING: Changing the order can break color coding!
 */
export function categorizeCustomField(columnName: string): CustomFieldCategory {
  const name = columnName.toLowerCase().trim();
  
  // Game/Matchup fields
  if (name.includes('game') || name.includes('matchup') || name.includes('teams') || 
      name.includes('vs') || name.includes('match') || name.includes('opponent')) {
    return 'game';
  }
  
  // Sportsbook fields - CHECK FIRST (before league) to avoid 'sport' conflict
  if (name.includes('book') || name.includes('sportsbook') || name.includes('site') ||
      name.includes('provider') || name.includes('platform') || name.includes('source') ||
      name.includes('operator') || name.includes('casino') || name.includes('betting') ||
      name.includes('wager') || name.includes('bet site') || name.includes('bookmaker')) {
    return 'sportsbook';
  }
  
  // League/Sport fields - CHECK AFTER sportsbook
  if (name.includes('league') || name.includes('sport') || name.includes('competition') ||
      name.includes('tournament') || name.includes('division')) {
    return 'league';
  }
  
  // Market/Bet Type fields
  if (name.includes('market') || name.includes('bet type') || name.includes('line') ||
      name.includes('spread') || name.includes('total') || name.includes('moneyline') ||
      name.includes('prop') || name.includes('over') || name.includes('under')) {
    return 'market';
  }
  
  // Default to notes for everything else
  return 'notes';
}

/**
 * Get styling classes for custom field category
 */
export function getCustomFieldStyles(category: CustomFieldCategory, isPrimary: boolean = false) {
  const baseClasses = "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium";
  const primaryClasses = isPrimary ? "px-3 py-1.5 text-sm" : "";
  
  switch (category) {
    case 'game':
      return `${baseClasses} ${primaryClasses} bg-blue-500/20 text-blue-300 border border-blue-500/30`;
    case 'league':
      return `${baseClasses} ${primaryClasses} bg-green-500/20 text-green-300 border border-green-500/30`;
    case 'market':
      return `${baseClasses} ${primaryClasses} bg-purple-500/20 text-purple-300 border border-purple-500/30`;
    case 'sportsbook':
      return `${baseClasses} ${primaryClasses} bg-orange-500/20 text-orange-300 border border-orange-500/30`;
    case 'notes':
    default:
      return `${baseClasses} ${primaryClasses} bg-surface-secondary/50 text-text-secondary border border-surface-secondary`;
  }
}

/**
 * Get category priority for field ordering (lower = higher priority)
 */
export function getCustomFieldPriority(category: CustomFieldCategory): number {
  switch (category) {
    case 'game': return 1;
    case 'market': return 2;
    case 'league': return 3;
    case 'sportsbook': return 4;
    case 'notes': return 5;
    default: return 6;
  }
}