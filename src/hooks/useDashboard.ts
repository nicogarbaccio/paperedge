import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { parseLocalDate } from '@/lib/utils'

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
      const completedBets = allBets.filter((bet: any) => ['won', 'lost', 'push'].includes(bet.status))
      const wonBets = allBets.filter((bet: any) => bet.status === 'won')
      const pendingBets = allBets.filter((bet: any) => bet.status === 'pending').length
      
      const winRate = completedBets.length > 0 ? (wonBets.length / completedBets.length) * 100 : 0
      
      const totalPL = allBets.reduce((total: number, bet: any) => {
        if (bet.status === 'won' && bet.return_amount) {
          return total + bet.return_amount // return_amount now stores profit only
        } else if (bet.status === 'lost') {
          return total - bet.wager_amount
        }
        return total
      }, 0)

      const totalWagered = completedBets.reduce((total: number, bet: any) => total + bet.wager_amount, 0)
      const roi = totalWagered > 0 ? (totalPL / totalWagered) * 100 : 0

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
          const completedBets = bets.filter((bet: any) => ['won', 'lost', 'push'].includes(bet.status))
          const wonBets = bets.filter((bet: any) => bet.status === 'won')
          
          const bet_count = bets.length
          const win_rate = completedBets.length > 0 ? (wonBets.length / completedBets.length) * 100 : 0
          
          const total_pl = bets.reduce((total: number, bet: any) => {
            if (bet.status === 'won' && bet.return_amount) {
              return total + bet.return_amount // return_amount now stores profit only
            } else if (bet.status === 'lost') {
              return total - bet.wager_amount
            }
            return total
          }, 0)

          const totalWagered = completedBets.reduce((total: number, bet: any) => total + bet.wager_amount, 0)
          const roi = totalWagered > 0 ? (total_pl / totalWagered) * 100 : 0

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

    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
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