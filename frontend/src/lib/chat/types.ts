export interface ChatMessage {
  id: string
  content: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
}

export interface PresenceUser {
  user_id: string
  name: string
  avatar?: string
  online_at: string
}
