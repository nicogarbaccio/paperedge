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
  display_order: number
  created_at: string
  updated_at: string
  unit_size: number
  // Computed fields
  bet_count?: number
  win_rate?: number
  total_pl?: number
  roi?: number
  units_won?: number
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
        .order('display_order', { ascending: true })

      if (notebooksError) throw notebooksError

      // Calculate stats for each notebook
      const notebooksWithStats = notebooksData?.map(notebook => {
        const bets = notebook.bets || []

        const bet_count = bets.length
        const win_rate = calculateWinRate(bets)
        const total_pl = calculateTotalPL(bets)
        const roi = calculateROI(bets)
        const unit_size = notebook.unit_size || 100
        const units_won = total_pl / unit_size
        
        // Calculate current bankroll dynamically: starting bankroll + total P/L
        const current_bankroll = notebook.starting_bankroll + total_pl

        return {
          ...notebook,
          bets: undefined, // Remove bets array from final object
          bet_count,
          win_rate,
          total_pl,
          roi,
          units_won,
          current_bankroll // Override with calculated value
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
    unit_size: number
  }) => {
    if (!user || !user.id) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('notebooks')
        .insert([
          {
            ...notebookData,
            user_id: user.id,
            current_bankroll: notebookData.starting_bankroll,
            unit_size: notebookData.unit_size
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

  const duplicateNotebook = async (id: string, newName: string) => {
    try {
      const { data, error } = await supabase.rpc('clone_notebook', {
        original_notebook_id: id,
        new_name: newName
      })

      if (error) throw error

      // Refresh notebooks list
      await fetchNotebooks()
      
      return data // This is the new notebook ID
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate notebook'
      throw new Error(errorMessage)
    }
  }

  const reorderNotebooks = async (reorderedNotebooks: Notebook[]) => {
    // Update the display_order on the objects themselves before setting state
    // so that any sorting logic based on display_order (like in the component's useMemo)
    // sees the correct new values immediately.
    // Use functional update to avoid stale closure issues if any, though here we pass explicit data
    const updatedNotebooks = reorderedNotebooks.map((notebook, index) => ({
      ...notebook,
      display_order: index
    }))

    // Optimistic update - ensuring we don't trigger unnecessary re-fetches
    setNotebooks(updatedNotebooks)

    // Do NOT await the Supabase call within the UI blocking path.
    // Let it happen in background.
    // If it fails, we revert.
    
    // We use a separate async function to handle the side effect to avoid blocking
    const persistOrder = async () => {
      try {
        // We must include all required columns for upsert to work, even if we are just updating.
        // Supabase/Postgres treats upsert as a potential INSERT, so strict schema validation applies.
        const updates = updatedNotebooks.map((notebook) => ({
          id: notebook.id,
          user_id: notebook.user_id,
          name: notebook.name,
          description: notebook.description,
          starting_bankroll: notebook.starting_bankroll,
          current_bankroll: notebook.current_bankroll,
          color: notebook.color,
          display_order: notebook.display_order,
          created_at: notebook.created_at,
          updated_at: new Date().toISOString(),
          unit_size: notebook.unit_size
        }))

        const { error } = await supabase
          .from('notebooks')
          .upsert(updates)

        if (error) throw error
      } catch (error: unknown) {
        console.error('Failed to persist notebook order:', error)
        // Revert to server state on error
        await fetchNotebooks()
      }
    }

    persistOrder()
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
    duplicateNotebook,
    reorderNotebooks,
    refetch: fetchNotebooks
  }
}
