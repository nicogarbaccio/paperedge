import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export interface Account {
  id: string
  user_id: string
  name: string
  kind: 'main' | 'offshore' | 'other'
  created_at: string
  updated_at: string
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
      setAccounts((data as any) || [])
    } catch (e: any) {
      setError(e.message)
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
    const { error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id)
    if (error) throw error
    await fetchAccounts()
  }

  async function deleteAccount(id: string) {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchAccounts()
  }

  useEffect(() => {
    fetchAccounts()
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
      setAccount(data as Account)
    } catch (e: any) {
      setError(e.message)
      setAccount(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccount()
  }, [user?.id, accountId])

  return { account, loading, error, refetch: fetchAccount }
}


