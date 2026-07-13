export const SUPPORT_INBOX_TOPIC = 'cmc-travel:support:inbox'

export const SUPPORT_AUTO_REPLY =
  'Cảm ơn bạn đã liên hệ. Tin nhắn của bạn đã được tiếp nhận và đang được xử lý. Vui lòng chờ phản hồi từ nhân viên!'

export const SUPPORT_STAFF_ROLES = ['admin', 'employee'] as const

export type SupportStaffRole = (typeof SUPPORT_STAFF_ROLES)[number]

export function supportTopic(sessionId: string) {
  return `cmc-travel:support:${sessionId}`
}

export function canAccessSupportInbox(role?: string | null) {
  return !!role && SUPPORT_STAFF_ROLES.includes(role as SupportStaffRole)
}

export function isSupportStaffRole(role?: string | null) {
  return canAccessSupportInbox(role)
}
