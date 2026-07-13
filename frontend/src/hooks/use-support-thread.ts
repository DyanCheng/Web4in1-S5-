'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'

import { supportTopic } from '@/lib/chat/support-constants'
import {
  fetchSessionMessages,
  insertSupportMessage,
  markSessionRead,
} from '@/lib/chat/support'
import type {
  SupportMessage,
  SupportSenderType,
} from '@/lib/chat/support-types'
import { applyRealtimeAuth } from '@/lib/supabase/realtime-auth'

const EVENT_MESSAGE_TYPE = 'message'

function appendUnique(
  current: SupportMessage[],
  incoming: SupportMessage
): SupportMessage[] {
  if (current.some((message) => message.id === incoming.id)) return current
  return [...current, incoming]
}

interface UseSupportThreadProps {
  sessionId: string | null
  userId: string
  username: string
  senderType: SupportSenderType
  avatar?: string
  accessToken: string | null
  onRefreshToken?: () => Promise<string | null>
  enabled?: boolean
  markReadAs?: 'customer' | 'staff' | null
}

export function useSupportThread({
  sessionId,
  userId,
  username,
  senderType,
  avatar,
  accessToken,
  onRefreshToken,
  enabled = true,
  markReadAs = null,
}: UseSupportThreadProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabaseRef = useRef<SupabaseClient | null>(null)

  const getValidToken = useCallback(async () => {
    if (accessToken) return accessToken
    if (onRefreshToken) return onRefreshToken()
    return null
  }, [accessToken, onRefreshToken])

  useEffect(() => {
    let cancelled = false

    const connect = async () => {
      setError(null)
      setIsConnected(false)
      setMessages([])

      if (!enabled || !sessionId) {
        setIsLoadingHistory(false)
        return
      }

      setIsLoadingHistory(true)

      const token = await getValidToken()
      if (cancelled) return

      if (!token) {
        setIsLoadingHistory(false)
        setError(
          'Thiếu token Realtime. Đăng xuất và đăng nhập lại, hoặc kiểm tra SUPABASE_SERVICE_ROLE_KEY trên backend.'
        )
        return
      }

      const supabase = await applyRealtimeAuth(token)
      if (cancelled) return
      supabaseRef.current = supabase

      try {
        const history = await fetchSessionMessages(supabase, sessionId)
        if (!cancelled) setMessages(history)
        if (markReadAs) {
          await markSessionRead(supabase, sessionId, markReadAs)
        }
      } catch (historyError) {
        if (!cancelled) {
          setError(
            historyError instanceof Error
              ? historyError.message
              : 'Không thể tải lịch sử chat'
          )
        }
      } finally {
        if (!cancelled) setIsLoadingHistory(false)
      }

      const topic = supportTopic(sessionId)
      const stale = supabase
        .getChannels()
        .filter(
          (channel) =>
            channel.topic === topic || channel.topic === `realtime:${topic}`
        )
      await Promise.all(stale.map((channel) => supabase.removeChannel(channel)))
      if (cancelled) return

      const channel = supabase.channel(topic, {
        config: { private: true },
      })

      channel
        .on('broadcast', { event: EVENT_MESSAGE_TYPE }, ({ payload }) => {
          setMessages((current) =>
            appendUnique(current, payload as SupportMessage)
          )
          if (markReadAs && supabaseRef.current && sessionId) {
            void markSessionRead(supabaseRef.current, sessionId, markReadAs)
          }
        })
        .subscribe((status, subscribeError) => {
          if (cancelled) return
          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
            setError(null)
            return
          }
          setIsConnected(false)
          if (subscribeError) setError(subscribeError.message)
          else if (status === 'CHANNEL_ERROR') {
            setError(
              'Không thể kết nối kênh hỗ trợ. Kiểm tra Realtime Authorization trên Supabase.'
            )
          }
        })

      channelRef.current = channel
    }

    void connect()

    return () => {
      cancelled = true
      const channel = channelRef.current
      const supabase = supabaseRef.current
      channelRef.current = null
      supabaseRef.current = null
      if (channel && supabase) void supabase.removeChannel(channel)
      else if (channel) void channel.unsubscribe()
    }
  }, [enabled, sessionId, getValidToken, markReadAs])

  const sendMessage = useCallback(
    async (content: string) => {
      const channel = channelRef.current
      const supabase = supabaseRef.current
      if (!channel || !supabase || !sessionId || !isConnected) return

      const message: SupportMessage = {
        id: crypto.randomUUID(),
        sessionId,
        content,
        senderType,
        user: {
          id: userId,
          name: username,
          avatar,
        },
        createdAt: new Date().toISOString(),
      }

      setMessages((current) => appendUnique(current, message))

      try {
        await insertSupportMessage(supabase, {
          sessionId,
          content,
          senderType,
          senderId: userId,
          senderName: username,
          senderAvatar: avatar,
          createdAt: message.createdAt,
          messageId: message.id,
        })
      } catch (persistError) {
        setMessages((current) =>
          current.filter((item) => item.id !== message.id)
        )
        setError(
          persistError instanceof Error
            ? persistError.message
            : 'Không thể lưu tin nhắn'
        )
        return
      }

      const result = await channel.send({
        type: 'broadcast',
        event: EVENT_MESSAGE_TYPE,
        payload: message,
      })

      if (result !== 'ok') {
        setError('Gửi tin nhắn thất bại')
      }
    },
    [avatar, isConnected, senderType, sessionId, userId, username]
  )

  return {
    messages,
    sendMessage,
    isConnected,
    isLoadingHistory,
    error,
  }
}
