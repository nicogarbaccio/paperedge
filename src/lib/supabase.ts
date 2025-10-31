import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error('Invalid Supabase URL format')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Utility function to get the correct redirect URL for auth
export function getAuthRedirectUrl(path: string = '/dashboard'): string {
  // In development, use localhost:5173 (Vite's default port)
  if (import.meta.env.DEV) {
    return `http://localhost:5173${path}`
  }

  // In production, use the current origin
  return `${window.location.origin}${path}`
}

// Database types
export interface Database {
  public: {
    Tables: {
      notebooks: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          starting_bankroll: number
          current_bankroll: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          starting_bankroll: number
          current_bankroll: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          starting_bankroll?: number
          current_bankroll?: number
          created_at?: string
          updated_at?: string
        }
      }
      bets: {
        Row: {
          id: string
          notebook_id: string
          date: string
          description: string
          odds: number
          wager_amount: number
          status: 'pending' | 'won' | 'lost' | 'push'
          return_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          notebook_id: string
          date: string
          description: string
          odds: number
          wager_amount: number
          status?: 'pending' | 'won' | 'lost' | 'push'
          return_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          notebook_id?: string
          date?: string
          description?: string
          odds?: number
          wager_amount?: number
          status?: 'pending' | 'won' | 'lost' | 'push'
          return_amount?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          kind: 'main' | 'offshore' | 'other'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          kind: 'main' | 'offshore' | 'other'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          kind?: 'main' | 'offshore' | 'other'
          created_at?: string
          updated_at?: string
        }
      }
      account_daily_pl: {
        Row: {
          id: string
          account_id: string
          date: string
          amount: number
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          date: string
          amount: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          date?: string
          amount?: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      custom_columns: {
        Row: {
          id: string
          notebook_id: string
          column_name: string
          column_type: 'text' | 'number' | 'select'
          select_options: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          notebook_id: string
          column_name: string
          column_type: 'text' | 'number' | 'select'
          select_options?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          notebook_id?: string
          column_name?: string
          column_type?: 'text' | 'number' | 'select'
          select_options?: string[] | null
          created_at?: string
        }
      }
      bet_custom_data: {
        Row: {
          bet_id: string
          column_id: string
          value: string
        }
        Insert: {
          bet_id: string
          column_id: string
          value: string
        }
        Update: {
          bet_id?: string
          column_id?: string
          value?: string
        }
      }
    }
  }
} 