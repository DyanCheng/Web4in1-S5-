import type { SupabaseClient } from '@supabase/supabase-js'

import {
  SUPPORT_AUTO_REPLY,
  supportTopic,
} from '@/lib/chat/support-constants'
import type {
  SupportMessage,
  SupportMessageRow,
  SupportSenderType,
  SupportSession,
  SupportSessionRow,
} from '@/lib/chat/support-types'

function rowToSession(row: SupportSessionRow): SupportSession {
  return {
    sessionId: row.session_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerAvatar: row.customer_avatar,
    status: row.status,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
    customerLastReadAt: row.customer_last_read_at,
    staffLastReadAt: row.staff_last_read_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function rowToSupportMessage(row: SupportMessageRow): SupportMessage {
  const senderType = row.sender_type
  const fallbackName =
    senderType === 'system'
      ? 'CMC Travel'
      : senderType === 'employee'
        ? 'Nhân viên'
        : 'Khách hàng'

  return {
    id: row.message_id,
    sessionId: row.session_id,
    content: row.content,
    senderType,
    user: {
      id: row.sender_id ?? senderType,
      name: row.sender_name ?? fallbackName,
      avatar: row.sender_avatar ?? undefined,
    },
    createdAt: row.created_at ?? new Date().toISOString(),
  }
}

const SESSION_SELECT =
  'session_id, customer_id, customer_name, customer_email, customer_avatar, status, last_message_at, last_message_preview, customer_last_read_at, staff_last_read_at, created_at, updated_at'

export async function fetchCustomerSession(
  supabase: SupabaseClient,
  customerId: string
): Promise<SupportSession | null> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select(SESSION_SELECT)
    .eq('customer_id', customerId)
    .maybeSingle()

  if (error) throw error
  return data ? rowToSession(data as SupportSessionRow) : null
}

export async function createCustomerSession(
  supabase: SupabaseClient,
  params: {
    customerId: string
    customerName: string
    customerEmail: string
    customerAvatar?: string
  }
): Promise<SupportSession> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      customer_id: params.customerId,
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_avatar: params.customerAvatar ?? null,
      status: 'waiting',
      last_message_at: now,
      last_message_preview: SUPPORT_AUTO_REPLY,
      customer_last_read_at: now,
      created_at: now,
      updated_at: now,
    })
    .select(SESSION_SELECT)
    .single()

  if (error) throw error

  const session = rowToSession(data as SupportSessionRow)
  await insertSupportMessage(supabase, {
    sessionId: session.sessionId,
    content: SUPPORT_AUTO_REPLY,
    senderType: 'system',
    senderId: 'cmc-travel',
    senderName: 'CMC Travel',
    createdAt: now,
  })

  return session
}

export async function ensureCustomerSession(
  supabase: SupabaseClient,
  params: {
    customerId: string
    customerName: string
    customerEmail: string
    customerAvatar?: string
  }
): Promise<{ session: SupportSession; created: boolean }> {
  const existing = await fetchCustomerSession(supabase, params.customerId)
  if (existing) return { session: existing, created: false }

  try {
    const session = await createCustomerSession(supabase, params)
    return { session, created: true }
  } catch {
    const raced = await fetchCustomerSession(supabase, params.customerId)
    if (raced) return { session: raced, created: false }
    throw new Error('Không thể tạo phiên hỗ trợ')
  }
}

export async function fetchSupportSessions(
  supabase: SupabaseClient
): Promise<SupportSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select(SESSION_SELECT)
    .not('customer_id', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(100)

  if (error) throw error
  return (data ?? []).map((row) => rowToSession(row as SupportSessionRow))
}

export async function fetchSessionMessages(
  supabase: SupabaseClient,
  sessionId: string,
  limit = 200
): Promise<SupportMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(
      'message_id, session_id, content, sender_type, sender_id, sender_name, sender_avatar, created_at'
    )
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data ?? []).map((row) =>
    rowToSupportMessage(row as SupportMessageRow)
  )
}

export async function insertSupportMessage(
  supabase: SupabaseClient,
  params: {
    sessionId: string
    content: string
    senderType: SupportSenderType
    senderId: string
    senderName: string
    senderAvatar?: string
    createdAt?: string
    messageId?: string
  }
): Promise<SupportMessage> {
  const createdAt = params.createdAt ?? new Date().toISOString()
  const messageId = params.messageId ?? crypto.randomUUID()

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      message_id: messageId,
      session_id: params.sessionId,
      room_topic: supportTopic(params.sessionId),
      sender_type: params.senderType,
      sender_id: params.senderId,
      sender_name: params.senderName,
      sender_avatar: params.senderAvatar ?? null,
      content: params.content,
      created_at: createdAt,
    })
    .select(
      'message_id, session_id, content, sender_type, sender_id, sender_name, sender_avatar, created_at'
    )
    .single()

  if (error) throw error

  await supabase
    .from('chat_sessions')
    .update({
      status: params.senderType === 'customer' ? 'waiting' : 'active',
      last_message_at: createdAt,
      last_message_preview: params.content.slice(0, 160),
      updated_at: createdAt,
      ...(params.senderType === 'customer'
        ? { customer_last_read_at: createdAt }
        : params.senderType === 'employee'
          ? { staff_last_read_at: createdAt }
          : {}),
    })
    .eq('session_id', params.sessionId)

  return rowToSupportMessage(data as SupportMessageRow)
}

export async function markSessionRead(
  supabase: SupabaseClient,
  sessionId: string,
  reader: 'customer' | 'staff'
): Promise<void> {
  const now = new Date().toISOString()
  const patch =
    reader === 'customer'
      ? { customer_last_read_at: now }
      : { staff_last_read_at: now }

  const { error } = await supabase
    .from('chat_sessions')
    .update(patch)
    .eq('session_id', sessionId)

  if (error) throw error
}

export function hasUnreadForCustomer(session: SupportSession | null): boolean {
  if (!session?.lastMessageAt) return false
  if (!session.customerLastReadAt) return true
  return (
    new Date(session.lastMessageAt).getTime() >
    new Date(session.customerLastReadAt).getTime()
  )
}

export function hasUnreadForStaff(session: SupportSession): boolean {
  if (!session.lastMessageAt) return false
  if (!session.staffLastReadAt) return session.status === 'waiting'
  return (
    new Date(session.lastMessageAt).getTime() >
    new Date(session.staffLastReadAt).getTime()
  )
}
