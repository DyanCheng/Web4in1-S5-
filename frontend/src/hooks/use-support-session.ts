'use client'

import { useCallback, useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  ensureCustomerSession,
  fetchCustomerSession,
  fetchSupportSessions,
  hasUnreadForCustomer,
  markSessionRead,
} from '@/lib/chat/support'
import type { SupportSession } from '@/lib/chat/support-types'
import { applyRealtimeAuth } from '@/lib/supabase/realtime-auth'

interface UseCustomerSupportSessionProps {
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  accessToken: string | null
  onRefreshToken?: () => Promise<string | null>
  enabled?: boolean
}

export function useCustomerSupportSession({
  userId,
  userName,
  userEmail,
  userAvatar,
  accessToken,
  onRefreshToken,
  enabled = true,
}: UseCustomerSupportSessionProps) {
  const [session, setSession] = useState<SupportSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUnread, setHasUnread] = useState(false)

  const getToken = useCallback(async () => {
    if (accessToken) return accessToken
    if (onRefreshToken) return onRefreshToken()
    return null
  }, [accessToken, onRefreshToken])

  const withClient = useCallback(async () => {
    const token = await getToken()
    if (!token) return null
    return applyRealtimeAuth(token)
  }, [getToken])

  const refresh = useCallback(async () => {
    if (!enabled) return
    setIsLoading(true)
    setError(null)
    try {
      const supabase = await withClient()
      if (!supabase) {
        setError('Thiếu token Realtime')
        return
      }
      const current = await fetchCustomerSession(supabase, userId)
      setSession(current)
      setHasUnread(hasUnreadForCustomer(current))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải phiên chat')
    } finally {
      setIsLoading(false)
    }
  }, [enabled, userId, withClient])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let supabase: SupabaseClient | null = null
    let channel: ReturnType<SupabaseClient['channel']> | null = null

    const subscribe = async () => {
      supabase = await withClient()
      if (!supabase || cancelled) return

      channel = supabase
        .channel(`support-session-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_sessions',
            filter: `customer_id=eq.${userId}`,
          },
          (payload) => {
            const row = (payload.new ?? payload.old) as {
              session_id?: string
              last_message_at?: string | null
              customer_last_read_at?: string | null
              last_message_preview?: string | null
              status?: string
              updated_at?: string
              customer_name?: string
              customer_email?: string
              customer_id?: string | null
              customer_avatar?: string | null
              staff_last_read_at?: string | null
              created_at?: string
            } | null

            if (!row?.session_id) return

            const next: SupportSession = {
              sessionId: row.session_id,
              customerId: row.customer_id ?? userId,
              customerName: row.customer_name ?? userName,
              customerEmail: row.customer_email ?? userEmail,
              customerAvatar: row.customer_avatar,
              status: row.status ?? 'waiting',
              lastMessageAt: row.last_message_at ?? null,
              lastMessagePreview: row.last_message_preview ?? null,
              customerLastReadAt: row.customer_last_read_at ?? null,
              staffLastReadAt: row.staff_last_read_at ?? null,
              createdAt: row.created_at ?? new Date().toISOString(),
              updatedAt: row.updated_at ?? new Date().toISOString(),
            }
            setSession(next)
            setHasUnread(hasUnreadForCustomer(next))
          }
        )
        .subscribe()
    }

    void subscribe()

    return () => {
      cancelled = true
      if (channel && supabase) void supabase.removeChannel(channel)
    }
  }, [enabled, userEmail, userId, userName, withClient])

  const openOrCreate = useCallback(async () => {
    const supabase = await withClient()
    if (!supabase) {
      setError('Thiếu token Realtime')
      return null
    }

    try {
      const { session: next } = await ensureCustomerSession(supabase, {
        customerId: userId,
        customerName: userName,
        customerEmail: userEmail,
        customerAvatar: userAvatar,
      })
      setSession(next)
      setHasUnread(false)
      await markSessionRead(supabase, next.sessionId, 'customer')
      return next
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể mở phiên chat')
      return null
    }
  }, [userAvatar, userEmail, userId, userName, withClient])

  const clearUnread = useCallback(async () => {
    if (!session) return
    const supabase = await withClient()
    if (!supabase) return
    await markSessionRead(supabase, session.sessionId, 'customer')
    setHasUnread(false)
    setSession((current) =>
      current
        ? { ...current, customerLastReadAt: new Date().toISOString() }
        : current
    )
  }, [session, withClient])

  return {
    session,
    isLoading,
    error,
    hasUnread,
    openOrCreate,
    clearUnread,
    refresh,
  }
}

interface UseSupportInboxSessionsProps {
  accessToken: string | null
  onRefreshToken?: () => Promise<string | null>
  enabled?: boolean
}

export function useSupportInboxSessions({
  accessToken,
  onRefreshToken,
  enabled = true,
}: UseSupportInboxSessionsProps) {
  const [sessions, setSessions] = useState<SupportSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getToken = useCallback(async () => {
    if (accessToken) return accessToken
    if (onRefreshToken) return onRefreshToken()
    return null
  }, [accessToken, onRefreshToken])

  const refresh = useCallback(async () => {
    if (!enabled) return
    setIsLoading(true)
    setError(null)
    try {
      const token = await getToken()
      if (!token) {
        setError('Thiếu token Realtime')
        return
      }
      const supabase = await applyRealtimeAuth(token)
      const list = await fetchSupportSessions(supabase)
      setSessions(list)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể tải danh sách hội thoại'
      )
    } finally {
      setIsLoading(false)
    }
  }, [enabled, getToken])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let supabase: SupabaseClient | null = null
    let channel: ReturnType<SupabaseClient['channel']> | null = null

    const subscribe = async () => {
      const token = await getToken()
      if (!token || cancelled) return
      supabase = await applyRealtimeAuth(token)
      if (cancelled) return

      channel = supabase
        .channel('support-inbox-sessions')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'chat_sessions' },
          () => {
            void refresh()
          }
        )
        .subscribe()
    }

    void subscribe()

    return () => {
      cancelled = true
      if (channel && supabase) void supabase.removeChannel(channel)
    }
  }, [enabled, getToken, refresh])

  return { sessions, isLoading, error, refresh }
}
