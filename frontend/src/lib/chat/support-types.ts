import type { ChatMessage } from '@/lib/chat/types'

export type SupportSenderType = 'customer' | 'employee' | 'system'

export interface SupportSession {
  sessionId: string
  customerId: string | null
  customerName: string
  customerEmail: string
  customerAvatar?: string | null
  status: string
  lastMessageAt: string | null
  lastMessagePreview: string | null
  customerLastReadAt: string | null
  staffLastReadAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SupportMessage extends ChatMessage {
  senderType: SupportSenderType
  sessionId: string
}

export interface SupportSessionRow {
  session_id: string
  customer_id: string | null
  customer_name: string
  customer_email: string
  customer_avatar: string | null
  status: string
  last_message_at: string | null
  last_message_preview: string | null
  customer_last_read_at: string | null
  staff_last_read_at: string | null
  created_at: string
  updated_at: string
}

export interface SupportMessageRow {
  message_id: string
  session_id: string
  content: string
  sender_type: SupportSenderType
  sender_id: string | null
  sender_name: string | null
  sender_avatar: string | null
  created_at: string | null
}
