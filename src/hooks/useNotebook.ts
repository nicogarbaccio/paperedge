import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export interface NotebookDetail {
  id: string
  user_id: string
  name: string
  description: string | null
  starting_bankroll: number
  current_bankroll: number
  color: string | null
  created_at: string
  updated_at: string
}

export interface Bet {
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

export function useNotebook(notebookId: string) {
  const [notebook, setNotebook] = useState<NotebookDetail | null>(null)
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  const fetchNotebook = async () => {
    if (!user || !user.id || !notebookId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch notebook details
      const { data: notebookData, error: notebookError } = await supabase
        .from('notebooks')
        .select('*')
        .eq('id', notebookId)
        .eq('user_id', user.id)
        .single()

      if (notebookError) throw notebookError

      // Fetch bets for this notebook
      const { data: betsData, error: betsError } = await supabase
        .from('bets')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('date', { ascending: false })

      if (betsError) throw betsError

      setNotebook(notebookData)
      setBets(betsData || [])
    } catch (error: any) {
      setError(error.message)
      setNotebook(null)
      setBets([])
    } finally {
      setLoading(false)
    }
  }

  const addBet = async (betData: {
    date: string
    description: string
    odds: number
    wager_amount: number
  }) => {
    if (!user || !user.id || !notebookId) throw new Error('User not authenticated or notebook not found')

    try {
      const { data, error } = await supabase
        .from('bets')
        .insert([
          {
            ...betData,
            notebook_id: notebookId,
            status: 'pending' as const
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Refresh data
      await fetchNotebook()

      return data
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const updateBet = async (betId: string, updates: Partial<Bet>) => {
    try {
      const { error } = await supabase
        .from('bets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', betId)

      if (error) throw error

      // Refresh data
      await fetchNotebook()
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const deleteBet = async (betId: string) => {
    try {
      const { error } = await supabase
        .from('bets')
        .delete()
        .eq('id', betId)

      if (error) throw error

      // Refresh data
      await fetchNotebook()
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  useEffect(() => {
    fetchNotebook()
  }, [user?.id, notebookId])

  return {
    notebook,
    bets,
    loading,
    error,
    addBet,
    updateBet,
    deleteBet,
    refetch: fetchNotebook
  }
} 