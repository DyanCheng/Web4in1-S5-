'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'

import { fetchRoomMessages, persistRoomMessage } from '@/lib/chat/messages'
import type { ChatMessage, PresenceUser } from '@/lib/chat/types'
import { applyRealtimeAuth } from '@/lib/supabase/realtime-auth'

export type { ChatMessage, PresenceUser }

interface UseRealtimeChatProps {
  roomTopic: string
  userId: string
  username: string
  userRole: string
  avatar?: string
  accessToken: string | null
  onRefreshToken?: () => Promise<string | null>
}

const EVENT_MESSAGE_TYPE = 'message'

function parsePresenceState(
  state: Record<string, PresenceUser[]>
): PresenceUser[] {
  const users = new Map<string, PresenceUser>()

  Object.values(state).forEach((entries) => {
    entries.forEach((entry) => {
      users.set(entry.user_id, entry)
    })
  })

  return Array.from(users.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
}

function isSameRoomChannel(channel: RealtimeChannel, roomTopic: string) {
  return (
    channel.topic === roomTopic ||
    channel.topic === `realtime:${roomTopic}` ||
    channel.subTopic === roomTopic
  )
}

async function removeRoomChannel(
  supabase: SupabaseClient,
  roomTopic: string
) {
  const staleChannels = supabase
    .getChannels()
    .filter((channel) => isSameRoomChannel(channel, roomTopic))

  await Promise.all(
    staleChannels.map((channel) => supabase.removeChannel(channel))
  )
}

function appendUniqueMessage(
  current: ChatMessage[],
  incoming: ChatMessage
): ChatMessage[] {
  if (current.some((message) => message.id === incoming.id)) {
    return current
  }

  return [...current, incoming]
}

export function useRealtimeChat({
  roomTopic,
  userId,
  username,
  userRole,
  avatar,
  accessToken,
  onRefreshToken,
}: UseRealtimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
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
      setIsLoadingHistory(true)
      setOnlineUsers([])
      setMessages([])

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
        const history = await fetchRoomMessages(supabase, roomTopic)
        if (!cancelled) setMessages(history)
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

      await removeRoomChannel(supabase, roomTopic)
      if (cancelled) return

      const channel = supabase.channel(roomTopic, {
        config: {
          private: true,
          presence: { key: userId },
        },
      })

      const updatePresence = () => {
        const state = channel.presenceState<PresenceUser>()
        setOnlineUsers(parsePresenceState(state))
      }

      channel
        .on('broadcast', { event: EVENT_MESSAGE_TYPE }, ({ payload }) => {
          setMessages((current) =>
            appendUniqueMessage(current, payload as ChatMessage)
          )
        })
        .on('presence', { event: 'sync' }, updatePresence)
        .subscribe(async (status, subscribeError) => {
          if (cancelled) return

          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
            setError(null)
            await channel.track({
              user_id: userId,
              name: username,
              avatar,
              online_at: new Date().toISOString(),
            })
            updatePresence()
            return
          }

          setIsConnected(false)
          if (subscribeError) {
            setError(subscribeError.message)
          } else if (status === 'CHANNEL_ERROR') {
            setError(
              'Không thể kết nối kênh chat. Kiểm tra Realtime Authorization trên Supabase.'
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

      if (channel && supabase) {
        void supabase.removeChannel(channel)
      } else if (channel) {
        void channel.unsubscribe()
      }
    }
  }, [roomTopic, userId, username, avatar, getValidToken])

  const sendMessage = useCallback(
    async (content: string) => {
      const channel = channelRef.current
      const supabase = supabaseRef.current
      if (!channel || !supabase || !isConnected) return

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        content,
        user: {
          id: userId,
          name: username,
          avatar,
        },
        createdAt: new Date().toISOString(),
      }

      setMessages((current) => appendUniqueMessage(current, message))

      try {
        await persistRoomMessage(supabase, roomTopic, message, userRole)
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
    [isConnected, roomTopic, userId, username, userRole, avatar]
  )

  const presenceLabel = useMemo(() => {
    if (!onlineUsers.length) return 'Chưa có ai trực tuyến'
    if (onlineUsers.length === 1) return '1 người đang online'
    return `${onlineUsers.length} người đang online`
  }, [onlineUsers])

  return {
    messages,
    onlineUsers,
    presenceLabel,
    sendMessage,
    isConnected,
    isLoadingHistory,
    error,
  }
}
