import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { parseLocalDate } from '@/lib/utils'
import { calculateTotalPL, calculateWinRate, calculateROI } from '@/lib/betting'

export interface DashboardStats {
  totalBets: number
  winRate: number
  totalPL: number
  roi: number
  activeNotebooks: number
  pendingBets: number
}

export interface RecentBet {
  id: string
  description: string
  odds: number
  wager_amount: number
  status: 'pending' | 'won' | 'lost' | 'push'
  return_amount: number | null
  date: string
}

export interface TopNotebook {
  id: string
  name: string
  bet_count: number
  win_rate: number
  total_pl: number
  roi: number
  color: string | null
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBets: 0,
    winRate: 0,
    totalPL: 0,
    roi: 0,
    activeNotebooks: 0,
    pendingBets: 0,
  })
  const [recentBets, setRecentBets] = useState<RecentBet[]>([])
  const [topNotebooks, setTopNotebooks] = useState<TopNotebook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()

  const fetchDashboardData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch notebooks with their bets
      const { data: notebooks, error: notebooksError } = await supabase
        .from('notebooks')
        .select(`
          id,
          name,
          color,
          bets (
            id,
            status,
            wager_amount,
            return_amount,
            date,
            description,
            odds
          )
        `)
        .eq('user_id', user.id)

      if (notebooksError) throw notebooksError

      if (!notebooks || notebooks.length === 0) {
        // No notebooks, set all stats to 0
        setStats({
          totalBets: 0,
          winRate: 0,
          totalPL: 0,
          roi: 0,
          activeNotebooks: 0,
          pendingBets: 0,
        })
        setRecentBets([])
        setTopNotebooks([])
        setLoading(false)
        return
      }

      // Flatten all bets
      const allBets = notebooks.flatMap(notebook => 
        notebook.bets.map((bet: any) => ({
          ...bet,
          notebook_name: notebook.name,
          notebook_id: notebook.id
        }))
      )

      // Calculate stats
      const totalBets = allBets.length
      const pendingBets = allBets.filter((bet: any) => bet.status === 'pending').length

      const winRate = calculateWinRate(allBets)
      const totalPL = calculateTotalPL(allBets)
      const roi = calculateROI(allBets)

      setStats({
        totalBets,
        winRate,
        totalPL,
        roi,
        activeNotebooks: notebooks.length,
        pendingBets,
      })

      // Get recent bets (last 5)
      const recentBetsData = allBets
        .sort((a: any, b: any) => {
          // Parse dates in local timezone to avoid UTC conversion issues
          const aDate = parseLocalDate(a.date);
          const bDate = parseLocalDate(b.date);
          return bDate.getTime() - aDate.getTime();
        })
        .slice(0, 5)
        .map((bet: any) => ({
          id: bet.id,
          description: bet.description,
          odds: bet.odds,
          wager_amount: bet.wager_amount,
          status: bet.status,
          return_amount: bet.return_amount,
          date: bet.date,
        }))

      setRecentBets(recentBetsData)

      // Calculate top performing notebooks
      const notebooksWithStats = notebooks
        .map(notebook => {
          const bets = notebook.bets || []

          const bet_count = bets.length
          const win_rate = calculateWinRate(bets)
          const total_pl = calculateTotalPL(bets)
          const roi = calculateROI(bets)

          return {
            id: notebook.id,
            name: notebook.name,
            bet_count,
            win_rate,
            total_pl,
            roi,
            color: notebook.color
          }
        })
        .filter(notebook => notebook.bet_count > 0) // Only include notebooks with bets
        .sort((a, b) => b.total_pl - a.total_pl) // Sort by P&L descending
        .slice(0, 3) // Top 3

      setTopNotebooks(notebooksWithStats)

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      await fetchDashboardData()
      if (cancelled) {
        // Reset state if component unmounted
        return
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [user?.id])

  return {
    stats,
    recentBets,
    topNotebooks,
    loading,
    error,
    refetch: fetchDashboardData
  }
} 