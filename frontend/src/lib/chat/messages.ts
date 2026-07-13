import type { SupabaseClient } from '@supabase/supabase-js'

import type { ChatMessage } from '@/lib/chat/types'

const STAFF_ROLES = new Set([
  'admin',
  'employee',
  'hotel_owner',
  'accountant',
])

interface ChatMessageRow {
  message_id: string
  content: string
  sender_id: string | null
  sender_name: string | null
  sender_avatar: string | null
  created_at: string | null
}

export function mapSenderType(role: string): 'employee' | 'customer' {
  return STAFF_ROLES.has(role) ? 'employee' : 'customer'
}

export function rowToChatMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.message_id,
    content: row.content,
    user: {
      id: row.sender_id ?? 'unknown',
      name: row.sender_name ?? 'Người dùng',
      avatar: row.sender_avatar ?? undefined,
    },
    createdAt: row.created_at ?? new Date().toISOString(),
  }
}

export async function fetchRoomMessages(
  supabase: SupabaseClient,
  roomTopic: string,
  limit = 100
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(
      'message_id, content, sender_id, sender_name, sender_avatar, created_at'
    )
    .eq('room_topic', roomTopic)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data ?? []).map((row) => rowToChatMessage(row as ChatMessageRow))
}

export async function persistRoomMessage(
  supabase: SupabaseClient,
  roomTopic: string,
  message: ChatMessage,
  role: string
): Promise<void> {
  const { error } = await supabase.from('chat_messages').insert({
    message_id: message.id,
    room_topic: roomTopic,
    session_id: null,
    sender_type: mapSenderType(role),
    sender_id: message.user.id,
    sender_name: message.user.name,
    sender_avatar: message.user.avatar ?? null,
    content: message.content,
    created_at: message.createdAt,
  })

  if (error) throw error
}
