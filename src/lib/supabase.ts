import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug: Log the environment variables (we'll remove this after debugging)
console.log('🔍 Debugging Supabase Environment Variables:')
console.log('VITE_SUPABASE_URL:', supabaseUrl)
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Found (length: ' + supabaseAnonKey.length + ')' : 'Not found')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  console.error('Invalid Supabase URL:', supabaseUrl)
  throw new Error('Invalid Supabase URL format')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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