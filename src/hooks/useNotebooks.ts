import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export interface Notebook {
  id: string
  user_id: string
  name: string
  description: string | null
  starting_bankroll: number
  current_bankroll: number
  color: string | null
  created_at: string
  updated_at: string
  // Computed fields
  bet_count?: number
  win_rate?: number
  total_pl?: number
  roi?: number
}

export function useNotebooks() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  const fetchNotebooks = async () => {
    if (!user) {
      setNotebooks([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch notebooks with computed stats
      const { data: notebooksData, error: notebooksError } = await supabase
        .from('notebooks')
        .select(`
          *,
          bets (
            id,
            status,
            wager_amount,
            return_amount
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (notebooksError) throw notebooksError

      // Calculate stats for each notebook
      const notebooksWithStats = notebooksData?.map(notebook => {
        const bets = notebook.bets || []
        const completedBets = bets.filter((bet: any) => ['won', 'lost', 'push'].includes(bet.status))
        const wonBets = bets.filter((bet: any) => bet.status === 'won')
        
        const bet_count = bets.length
        const win_rate = completedBets.length > 0 ? (wonBets.length / completedBets.length) * 100 : 0
        
        const total_pl = bets.reduce((total: number, bet: any) => {
          if (bet.status === 'won' && bet.return_amount) {
            return total + bet.return_amount
          } else if (bet.status === 'lost') {
            return total - bet.wager_amount
          }
          return total
        }, 0)

        const totalWagered = completedBets.reduce((total: number, bet: any) => total + bet.wager_amount, 0)
        const roi = totalWagered > 0 ? (total_pl / totalWagered) * 100 : 0

        return {
          ...notebook,
          bets: undefined, // Remove bets array from final object
          bet_count,
          win_rate,
          total_pl,
          roi
        }
      }) || []

      setNotebooks(notebooksWithStats)
    } catch (error: any) {
      setError(error.message)
      setNotebooks([])
    } finally {
      setLoading(false)
    }
  }

  const createNotebook = async (notebookData: {
    name: string
    description?: string
    starting_bankroll: number
    color?: string
  }) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('notebooks')
        .insert([
          {
            ...notebookData,
            user_id: user.id,
            current_bankroll: notebookData.starting_bankroll
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Refresh notebooks list
      await fetchNotebooks()

      return data
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const updateNotebook = async (id: string, updates: Partial<Notebook>) => {
    try {
      const { error } = await supabase
        .from('notebooks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      // Refresh notebooks list
      await fetchNotebooks()
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const deleteNotebook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notebooks')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Refresh notebooks list
      await fetchNotebooks()
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  useEffect(() => {
    fetchNotebooks()
  }, [user])

  return {
    notebooks,
    loading,
    error,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    refetch: fetchNotebooks
  }
} 