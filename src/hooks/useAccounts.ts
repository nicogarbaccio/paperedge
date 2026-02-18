import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export interface Account {
  id: string
  user_id: string
  name: string
  kind: 'main' | 'other'
  created_at: string
  updated_at: string
}

// Helper function to get user-friendly label for account kind
export function getAccountKindLabel(kind: Account['kind']): string {
  const labels: Record<Account['kind'], string> = {
    main: 'Sportsbook',
    other: 'Other',
  }
  return labels[kind]
}

export function useAccounts() {
  const { user } = useAuthStore()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchAccounts() {
    if (!user?.id) {
      setAccounts([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      if (error) throw error

      // Validate and type the response data
      if (!data) {
        setAccounts([])
        return
      }

      // Type assertion with validation
      const accounts = data as Account[]
      setAccounts(accounts)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch accounts'
      setError(errorMessage)
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }

  async function createAccount(input: { name: string; kind: Account['kind'] }) {
    if (!user?.id) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('accounts')
      .insert([{ user_id: user.id, ...input }])
    if (error) throw error
    await fetchAccounts()
  }

  async function updateAccount(id: string, updates: Partial<Pick<Account, 'name' | 'kind'>>) {
    if (!user?.id) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    await fetchAccounts()
  }

  async function deleteAccount(id: string) {
    if (!user?.id) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    await fetchAccounts()
  }

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      await fetchAccounts()
      if (cancelled) {
        return
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [user?.id])

  return { accounts, loading, error, refetch: fetchAccounts, createAccount, updateAccount, deleteAccount }
}

export function useAccount(accountId: string | null) {
  const { user } = useAuthStore()
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchAccount() {
    if (!user?.id || !accountId) {
      setAccount(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .eq('user_id', user.id)
        .single()
      if (error) throw error

      // Validate response data
      if (!data) {
        setAccount(null)
        return
      }

      // Type assertion with validation
      const account = data as Account
      setAccount(account)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch account'
      setError(errorMessage)
      setAccount(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      await fetchAccount()
      if (cancelled) {
        return
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [user?.id, accountId])

  return { account, loading, error, refetch: fetchAccount }
}


