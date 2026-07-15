'use client'

import { Loader2, Send, Users, Wifi, WifiOff } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { ChatMessageItem } from '@/components/Chat-message'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import {
  useRealtimeChat,
  type ChatMessage,
  type PresenceUser,
} from '@/hooks/use-realtime-chat'
import { cn } from '@/lib/utils'

interface RealtimeChatProps {
  roomTopic: string
  userId: string
  username: string
  userRole: string
  avatar?: string
  accessToken: string | null
  roomLabel: string
  onRefreshToken?: () => Promise<string | null>
  onMessage?: (messages: ChatMessage[]) => void
  messages?: ChatMessage[]
}

export function RealtimeChat({
  roomTopic,
  userId,
  username,
  userRole,
  avatar,
  accessToken,
  roomLabel,
  onRefreshToken,
  onMessage,
  messages: initialMessages = [],
}: RealtimeChatProps) {
  const { containerRef, scrollToBottom } = useChatScroll()
  const [newMessage, setNewMessage] = useState('')

  const {
    messages: realtimeMessages,
    onlineUsers,
    presenceLabel,
    sendMessage,
    isConnected,
    isLoadingHistory,
    error,
  } = useRealtimeChat({
    roomTopic,
    userId,
    username,
    userRole,
    avatar,
    accessToken,
    onRefreshToken,
  })

  const allMessages = useMemo(() => {
    const mergedMessages = [...initialMessages, ...realtimeMessages]
    const uniqueMessages = mergedMessages.filter(
      (message, index, self) =>
        index === self.findIndex((item) => item.id === message.id)
    )

    return uniqueMessages.sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    )
  }, [initialMessages, realtimeMessages])

  useEffect(() => {
    onMessage?.(allMessages)
  }, [allMessages, onMessage])

  useEffect(() => {
    scrollToBottom()
  }, [allMessages, scrollToBottom])

  const handleSendMessage = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      if (!newMessage.trim() || !isConnected) return

      void sendMessage(newMessage.trim())
      setNewMessage('')
    },
    [newMessage, isConnected, sendMessage]
  )

  return (
    <div className="flex h-full min-h-[32rem] w-full overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold">{roomLabel}</h2>
          </div>
          <Badge
            variant={isConnected ? 'default' : 'secondary'}
            className="gap-1"
          >
            {isConnected ? (
              <Wifi className="size-3" />
            ) : (
              <WifiOff className="size-3" />
            )}
            {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
          </Badge>
        </div>

        {error ? (
          <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div
          ref={containerRef}
          className="flex-1 space-y-4 overflow-y-auto p-4"
        >
          {isLoadingHistory ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Đang tải lịch sử chat...
            </div>
          ) : allMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
            </div>
          ) : (
            <div className="space-y-1">
              {allMessages.map((message, index) => {
                const prevMessage =
                  index > 0 ? allMessages[index - 1] : null
                const showHeader =
                  !prevMessage ||
                  prevMessage.user.id !== message.user.id

                return (
                  <div
                    key={message.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                  >
                    <ChatMessageItem
                      message={message}
                      isOwnMessage={message.user.id === userId}
                      showHeader={showHeader}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSendMessage}
          className="flex w-full gap-2 border-t border-border p-4"
        >
          <Input
            className={cn(
              'rounded-full bg-background text-sm transition-all duration-300',
              isConnected && newMessage.trim()
                ? 'w-[calc(100%-36px)]'
                : 'w-full'
            )}
            type="text"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            placeholder={
              isConnected
                ? 'Nhập tin nhắn...'
                : 'Đang kết nối tới kênh chat...'
            }
            disabled={!isConnected}
          />
          {isConnected && newMessage.trim() ? (
            <Button
              className="aspect-square rounded-full"
              type="submit"
              disabled={!isConnected}
            >
              <Send className="size-4" />
            </Button>
          ) : !isConnected ? (
            <Button
              className="aspect-square rounded-full"
              type="button"
              variant="secondary"
              disabled
            >
              <Loader2 className="size-4 animate-spin" />
            </Button>
          ) : null}
        </form>
      </div>

      <aside className="hidden w-72 border-l border-border bg-muted/30 p-4 lg:block">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium">
          <Users className="size-4" />
          {presenceLabel}
        </div>
        <div className="space-y-3">
          {onlineUsers.map((member) => (
            <PresenceRow
              key={member.user_id}
              member={member}
              isCurrentUser={member.user_id === userId}
            />
          ))}
          {!onlineUsers.length ? (
            <p className="text-sm text-muted-foreground">
              Đang chờ người dùng tham gia phòng...
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  )
}

function PresenceRow({
  member,
  isCurrentUser,
}: {
  member: PresenceUser
  isCurrentUser: boolean
}) {
  const initials = member.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex items-center gap-3 rounded-xl bg-background/80 px-3 py-2">
      <Avatar className="size-9">
        {member.avatar ? <AvatarImage src={member.avatar} alt={member.name} /> : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {member.name}
          {isCurrentUser ? ' (bạn)' : ''}
        </p>
        <p className="text-xs text-muted-foreground">Đang online</p>
      </div>
      <span className="size-2 rounded-full bg-emerald-500" />
    </div>
  )
}
