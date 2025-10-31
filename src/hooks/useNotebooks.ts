import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { calculateTotalPL, calculateWinRate, calculateROI } from '@/lib/betting'

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
    if (!user || !user.id) {
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

        const bet_count = bets.length
        const win_rate = calculateWinRate(bets)
        const total_pl = calculateTotalPL(bets)
        const roi = calculateROI(bets)

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notebooks'
      setError(errorMessage)
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
    if (!user || !user.id) throw new Error('User not authenticated')

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create notebook'
      throw new Error(errorMessage)
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update notebook'
      throw new Error(errorMessage)
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete notebook'
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      await fetchNotebooks()
      if (cancelled) {
        return
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [user?.id])

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