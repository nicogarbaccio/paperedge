import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export interface DailyPLEntry {
  id: string
  account_id: string
  date: string // YYYY-MM-DD
  amount: number
  note: string | null
  created_at: string
  updated_at: string
  // Casino-specific transaction fields
  deposited_usd?: number | null
  withdrew_usd?: number | null
  in_casino?: number | null
  usd_value?: number | null
  tokens_received?: string | null
  deposit_method?: string | null
}

export interface DailyPLByDate {
  [date: string]: {
    total: number
    byAccount: Record<string, {
      amount: number
      entryId?: string
      deposited_usd?: number | null
      withdrew_usd?: number | null
      in_casino?: number | null
      usd_value?: number | null
      tokens_received?: string | null
      deposit_method?: string | null
      note?: string | null
    }>
  }
}

function toISODate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useDailyPL(rangeStart: Date, rangeEnd: Date, accountId?: string) {
  const { user } = useAuthStore()
  const [data, setData] = useState<DailyPLEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cacheRef = useRef<Map<string, DailyPLEntry[]>>(new Map())

  function makeKey(start: Date, end: Date, accId?: string) {
    return `${toISODate(start)}|${toISODate(end)}|${accId ?? ''}`
  }

  async function fetchRange(signal?: AbortSignal) {
    if (!user?.id) {
      setData([])
      setLoading(false)
      setInitialized(true)
      setIsFetching(false)
      return
    }
    try {
      if (!initialized) {
        setLoading(true)
      } else {
        setIsFetching(true)
        // If we have a prefetched cache for the upcoming range, show it immediately
        const key = makeKey(rangeStart, rangeEnd, accountId)
        const cached = cacheRef.current.get(key)
        if (cached) {
          setData(cached)
        }
      }
      setError(null)
      let query = supabase
        .from('account_daily_pl')
        .select(`
          id, account_id, date, amount, note, created_at, updated_at,
          accounts!inner ( user_id )
        `)
        .gte('date', toISODate(rangeStart))
        .lte('date', toISODate(rangeEnd))

      if (accountId) {
        query = query.eq('account_id', accountId)
      }

      const { data, error } = await query

      if (error) throw error

      // Validate response data
      if (!data || !Array.isArray(data)) {
        setData([])
        const key = makeKey(rangeStart, rangeEnd, accountId)
        cacheRef.current.set(key, [])
        return
      }

      // Filter to current user, then strip joined object
      // Type: array of objects with accounts relation joined
      // Note: Supabase returns foreign key joins as single objects, not arrays
      type DailyPLWithAccounts = DailyPLEntry & {
        accounts?: { user_id: string } | { user_id: string }[] | null
      }

      const filtered = (data as unknown as DailyPLWithAccounts[])
        .filter((row) => {
          // Handle both object and array cases for accounts
          if (Array.isArray(row.accounts)) {
            return row.accounts.some(acc => acc.user_id === user.id)
          }
          return row.accounts?.user_id === user.id
        })
        .map(({ accounts, ...rest }) => rest as DailyPLEntry)

      setData(filtered)
      // Update cache for this range
      const key = makeKey(rangeStart, rangeEnd, accountId)
      cacheRef.current.set(key, filtered)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch daily P&L data'
      setError(errorMessage)
      setData([])
    } finally {
      setLoading(false)
      setInitialized(true)
      setIsFetching(false)
    }
  }

  async function upsertValue(
    accountId: string,
    date: string,
    amount: number,
    casinoData?: {
      deposited_usd?: number | null
      withdrew_usd?: number | null
      in_casino?: number | null
      usd_value?: number | null
      tokens_received?: string | null
      deposit_method?: string | null
      note?: string | null
    }
  ) {
    const { error } = await supabase
      .from('account_daily_pl')
      .upsert(
        [{
          account_id: accountId,
          date,
          amount,
          ...(casinoData || {}),
        }],
        { onConflict: 'account_id,date' }
      )
    if (error) throw error
    await fetchRange()
  }

  async function deleteValue(accountId: string, date: string) {
    const { error } = await supabase
      .from('account_daily_pl')
      .delete()
      .eq('account_id', accountId)
      .eq('date', date)
    if (error) throw error
    await fetchRange()
  }

  const byDate: DailyPLByDate = useMemo(() => {
    const map: DailyPLByDate = {}
    for (const e of data) {
      if (!map[e.date]) map[e.date] = { total: 0, byAccount: {} }
      const amt = Number(e.amount) || 0
      map[e.date].total += amt
      map[e.date].byAccount[e.account_id] = {
        amount: amt,
        entryId: e.id,
        deposited_usd: e.deposited_usd,
        withdrew_usd: e.withdrew_usd,
        in_casino: e.in_casino,
        usd_value: e.usd_value,
        tokens_received: e.tokens_received,
        deposit_method: e.deposit_method,
        note: e.note,
      }
    }
    return map
  }, [data])

  async function fetchAllTimeTotal(filterAccountId?: string): Promise<number> {
    if (!user?.id) return 0
    let query = supabase
      .from('account_daily_pl')
      .select('amount, account_id, accounts!inner(user_id)')

    if (filterAccountId) {
      query = query.eq('account_id', filterAccountId)
    }

    const { data, error } = await query

    if (error) throw error
    const rows = (data as any[])
      .filter((row) => row.accounts?.user_id === user.id)
      .map((row) => Number(row.amount) || 0)
    return rows.reduce((a, b) => a + b, 0)
  }

  async function fetchYearTotal(year: number = new Date().getFullYear(), filterAccountId?: string): Promise<number> {
    if (!user?.id) return 0
    const start = `${year}-01-01`
    const end = `${year}-12-31`

    let query = supabase
      .from('account_daily_pl')
      .select('amount, account_id, accounts!inner(user_id)')
      .gte('date', start)
      .lte('date', end)

    if (filterAccountId) {
      query = query.eq('account_id', filterAccountId)
    }

    const { data, error } = await query

    if (error) throw error
    const rows = (data as any[])
      .filter((row) => row.accounts?.user_id === user.id)
      .map((row) => Number(row.amount) || 0)
    return rows.reduce((a, b) => a + b, 0)
  }

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      await fetchRange()
      if (cancelled) {
        return
      }
    }

    fetchData()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, rangeStart.getTime(), rangeEnd.getTime(), accountId])

  async function prefetchRange(targetStart: Date, targetEnd: Date, targetAccountId?: string) {
    if (!user?.id) return
    const key = makeKey(targetStart, targetEnd, targetAccountId)
    if (cacheRef.current.has(key)) return
    try {
      let query = supabase
        .from('account_daily_pl')
        .select(`
          id, account_id, date, amount, note, created_at, updated_at,
          accounts!inner ( user_id )
        `)
        .gte('date', toISODate(targetStart))
        .lte('date', toISODate(targetEnd))

      if (targetAccountId) {
        query = query.eq('account_id', targetAccountId)
      }

      const { data, error } = await query
      if (error) throw error

      // Validate and type the response
      if (!data || !Array.isArray(data)) {
        cacheRef.current.set(key, [])
        return
      }

      type DailyPLWithAccounts = DailyPLEntry & {
        accounts?: { user_id: string } | { user_id: string }[] | null
      }

      const filtered = (data as unknown as DailyPLWithAccounts[])
        .filter((row) => {
          // Handle both object and array cases for accounts
          if (Array.isArray(row.accounts)) {
            return row.accounts.some(acc => acc.user_id === user.id)
          }
          return row.accounts?.user_id === user.id
        })
        .map(({ accounts, ...rest }) => rest as DailyPLEntry)
      cacheRef.current.set(key, filtered)
    } catch (_) {
      // Silently ignore prefetch errors - not critical
    }
  }

  return { data, byDate, loading, initialized, isFetching, error, refetch: fetchRange, prefetchRange, upsertValue, deleteValue, fetchAllTimeTotal, fetchYearTotal }
}


