// Topic phải khớp RLS policy trong backend/setup_realtime_chat.sql
export const CHAT_ROOMS = {
  lobby: {
    topic: 'cmc-travel:lobby',
    label: 'Cộng đồng',
    description: 'Trò chuyện với khách du lịch khác',
  },
  staff: {
    topic: 'cmc-travel:staff',
    label: 'Nội bộ',
    description: 'Kênh dành cho nhân viên và quản trị',
    roles: ['admin', 'employee', 'hotel_owner', 'accountant'] as const,
  },
} as const

export type ChatRoomKey = keyof typeof CHAT_ROOMS

export function canAccessRoom(
  roomKey: ChatRoomKey,
  role?: string | null
): boolean {
  const room = CHAT_ROOMS[roomKey]
  if (!('roles' in room)) return true
  return !!role && room.roles.includes(role as (typeof room.roles)[number])
}
