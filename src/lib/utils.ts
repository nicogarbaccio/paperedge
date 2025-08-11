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
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  let d: Date
  if (typeof date === 'string') {
    // Parse date string as local date to avoid timezone shifting
    // "2024-07-26" should be treated as July 26th locally, not UTC
    const [year, month, day] = date.split('-').map(Number)
    d = new Date(year, month - 1, day) // month is 0-indexed
  } else {
    d = date
  }
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get current local date in YYYY-MM-DD format for HTML date inputs
 * This avoids timezone conversion issues that can occur with toISOString()
 */
export function getCurrentLocalDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Convert a Date object to YYYY-MM-DD format in local timezone
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get color class for profit/loss display
 */
export function getPLColorClass(value: number): string {
  if (value > 0) return 'text-profit'
  if (value < 0) return 'text-loss'
  return 'text-text-secondary'
}

/**
 * Get status color class
 */
export function getStatusColorClass(status: string): string {
  switch (status) {
    case 'won':
      return 'text-profit'
    case 'lost':
      return 'text-loss'
    case 'pending':
      return 'text-pending'
    case 'push':
      return 'text-push'
    default:
      return 'text-text-secondary'
  }
}

/**
 * Capitalize the first letter of a string (leaves the rest unchanged)
 */
export function capitalizeFirst(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
} 