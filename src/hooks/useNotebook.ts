import { useState, useEffect, useMemo } from 'react'
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

export interface CustomColumn {
  id: string
  notebook_id: string
  column_name: string
  column_type: 'text' | 'number' | 'select'
  select_options: string[] | null
  created_at: string
}

export type BetCustomMap = Record<string, Record<string, string>>

export function useNotebook(notebookId: string) {
  const [notebook, setNotebook] = useState<NotebookDetail | null>(null)
  const [bets, setBets] = useState<Bet[]>([])
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([])
  const [betCustomData, setBetCustomData] = useState<BetCustomMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  // Validate notebook ID format
  const isValidNotebookId = useMemo(() => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(notebookId);
  }, [notebookId]);

  const fetchNotebook = async () => {
    if (!user || !user.id || !notebookId) {
      setLoading(false)
      return
    }

    // Debug logging
    console.log('🔍 useNotebook Debug:', {
      currentUserId: user.id,
      currentUserEmail: user.email,
      notebookId,
      isValidNotebookId
    });

    // Check if notebook ID is valid
    if (!isValidNotebookId) {
      setError('Invalid notebook ID format')
      setLoading(false)
      return
    }

    // Check if user has access to this notebook
    if (!user.id) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // First, verify user ownership of the notebook
      const { data: ownershipCheck, error: ownershipError } = await supabase
        .from('notebooks')
        .select('user_id')
        .eq('id', notebookId)
        .single()

      if (ownershipError) {
        if (ownershipError.code === 'PGRST116') {
          throw new Error('Notebook not found')
        }
        throw ownershipError
      }

      // Debug logging for ownership check
      console.log('🔍 Ownership Check:', {
        notebookId,
        notebookOwnerId: ownershipCheck.user_id,
        currentUserId: user.id,
        isOwner: ownershipCheck.user_id === user.id
      });

      // Verify the notebook belongs to the current user
      if (ownershipCheck.user_id !== user.id) {
        throw new Error('Access denied: You do not own this notebook')
      }

      // Fetch notebook details
      const { data: notebookData, error: notebookError } = await supabase
        .from('notebooks')
        .select('*')
        .eq('id', notebookId)
        .eq('user_id', user.id)
        .single()

      if (notebookError) {
        // Check if it's a "not found" error or an unauthorized access
        if (notebookError.code === 'PGRST116') {
          // Notebook not found - this could mean unauthorized access
          throw new Error('Notebook not found or access denied')
        }
        throw notebookError
      }

      // Double-check user ownership (extra security)
      if (notebookData.user_id !== user.id) {
        throw new Error('Access denied: You do not own this notebook')
      }

      // Fetch bets for this notebook
      const { data: betsData, error: betsError } = await supabase
        .from('bets')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('date', { ascending: false })

      if (betsError) throw betsError

      setNotebook(notebookData)
      const notebookBets = betsData || []
      setBets(notebookBets)

      // Fetch custom columns for this notebook
      const { data: columnsData, error: columnsError } = await supabase
        .from('custom_columns')
        .select('*')
        .eq('notebook_id', notebookId)
        .order('created_at', { ascending: true })
      if (columnsError) throw columnsError

      let columns = columnsData || []

      // Auto-seed recommended fields if none exist yet for this notebook
      if (columns.length === 0) {
        const { error: seedError } = await supabase.rpc('add_recommended_fields', {
          target_notebook: notebookId
        })
        if (seedError) throw seedError

        const { data: seededColumns, error: seededFetchError } = await supabase
          .from('custom_columns')
          .select('*')
          .eq('notebook_id', notebookId)
          .order('created_at', { ascending: true })
        if (seededFetchError) throw seededFetchError
        columns = seededColumns || []
      }

      // Dedupe by column_name (case-insensitive) as a guard
      const seenNames = new Set<string>()
      const dedupedColumns: CustomColumn[] = []
      for (const col of columns) {
        const key = (col.column_name || '').trim().toLowerCase()
        if (key && !seenNames.has(key)) {
          seenNames.add(key)
          dedupedColumns.push(col)
        }
      }
      setCustomColumns(dedupedColumns)

      // Fetch custom data for bets
      if ((notebookBets?.length || 0) > 0) {
        const betIds = notebookBets.map(b => b.id)
        const { data: customDataRows, error: customDataError } = await supabase
          .from('bet_custom_data')
          .select('*')
          .in('bet_id', betIds)
        if (customDataError) throw customDataError

        const map: BetCustomMap = {}
        for (const row of customDataRows || []) {
          if (!map[row.bet_id]) map[row.bet_id] = {}
          map[row.bet_id][row.column_id] = row.value
        }
        setBetCustomData(map)
      } else {
        setBetCustomData({})
      }
    } catch (error: any) {
      setError(error.message)
      setNotebook(null)
      setBets([])
      setCustomColumns([])
      setBetCustomData({})
    } finally {
      setLoading(false)
    }
  }

  const addBet = async (
    betData: {
      date: string
      description: string
      odds: number
      wager_amount: number
    },
    customData?: Record<string, string>
  ) => {
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

      // If there is custom data, insert it for the created bet
      if (data && customData && Object.keys(customData).length > 0) {
        const rows = Object.entries(customData)
          .filter(([, v]) => v !== undefined && v !== null && `${v}`.trim() !== '')
          .map(([columnId, value]) => ({ bet_id: data.id, column_id: columnId, value: `${value}` }))
        if (rows.length > 0) {
          const { error: cdError } = await supabase
            .from('bet_custom_data')
            .upsert(rows, { onConflict: 'bet_id,column_id' })
          if (cdError) throw cdError
        }
      }

      // Refresh data
      await fetchNotebook()

      return data
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const updateBet = async (betId: string, updates: Partial<Bet>, delayRefresh = false) => {
    try {
      const { error } = await supabase
        .from('bets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', betId)

      if (error) throw error

      // Refresh data unless delayed
      if (!delayRefresh) {
        await fetchNotebook()
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const upsertBetCustomData = async (betId: string, customData: Record<string, string>, delayRefresh = false) => {
    try {
      const rows = Object.entries(customData)
        .map(([columnId, value]) => ({ bet_id: betId, column_id: columnId, value: `${value ?? ''}` }))
      if (rows.length === 0) return
      const { error } = await supabase
        .from('bet_custom_data')
        .upsert(rows, { onConflict: 'bet_id,column_id' })
      if (error) throw error
      
      // Refresh data unless delayed
      if (!delayRefresh) {
        await fetchNotebook()
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  // Combined update function for bet + custom data with single refresh
  const updateBetWithCustomData = async (
    betId: string, 
    updates: Partial<Bet>, 
    customData: Record<string, string>
  ) => {
    try {
      // Do both operations without refreshing
      await updateBet(betId, updates, true)
      await upsertBetCustomData(betId, customData, true)
      
      // Single refresh after both operations
      await fetchNotebook()
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const createColumn = async (input: { column_name: string; column_type: 'text' | 'number' | 'select'; select_options?: string[] }) => {
    try {
      const { error } = await supabase
        .from('custom_columns')
        .insert([{ notebook_id: notebookId, column_name: input.column_name, column_type: input.column_type, select_options: input.select_options ?? null }])
      if (error) throw error
      await fetchNotebook()
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const updateColumn = async (columnId: string, updates: Partial<CustomColumn>) => {
    try {
      const { error } = await supabase
        .from('custom_columns')
        .update({
          column_name: updates.column_name,
          column_type: updates.column_type,
          select_options: updates.select_options ?? null
        })
        .eq('id', columnId)
      if (error) throw error
      await fetchNotebook()
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const deleteColumn = async (columnId: string) => {
    try {
      const { error } = await supabase
        .from('custom_columns')
        .delete()
        .eq('id', columnId)
      if (error) throw error
      await fetchNotebook()
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const addRecommendedFields = async () => {
    try {
      const { error } = await supabase.rpc('add_recommended_fields', { target_notebook: notebookId })
      if (error) throw error
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
    if (isValidNotebookId) {
      fetchNotebook()
    } else if (notebookId) {
      setError('Invalid notebook ID format')
      setLoading(false)
    }
  }, [user?.id, notebookId, isValidNotebookId])

  return {
    notebook,
    bets,
    customColumns,
    betCustomData,
    loading,
    error,
    addBet,
    updateBet,
    deleteBet,
    upsertBetCustomData,
    updateBetWithCustomData,
    createColumn,
    updateColumn,
    deleteColumn,
    addRecommendedFields,
    refetch: fetchNotebook
  }
} 