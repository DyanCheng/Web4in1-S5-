'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, MessageSquare, Send, Wifi, WifiOff } from 'lucide-react'

import { ChatMessageItem } from '@/components/Chat-message'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import { useSupportInboxSessions } from '@/hooks/use-support-session'
import { useSupportThread } from '@/hooks/use-support-thread'
import { hasUnreadForStaff, markSessionRead } from '@/lib/chat/support'
import type { SupportSession } from '@/lib/chat/support-types'
import { applyRealtimeAuth } from '@/lib/supabase/realtime-auth'
import { cn } from '@/lib/utils'

function formatTime(value: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
}

export function SupportInbox() {
  const {
    user,
    accessToken,
    refreshRealtimeToken,
    realtimeConfigured,
  } = useAuth()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const { containerRef, scrollToBottom } = useChatScroll()

  const { sessions, isLoading, error, refresh } = useSupportInboxSessions({
    accessToken,
    onRefreshToken: refreshRealtimeToken,
    enabled: !!user,
  })

  const selected = useMemo(
    () => sessions.find((item) => item.sessionId === selectedId) ?? null,
    [selectedId, sessions]
  )

  const {
    messages,
    sendMessage,
    isConnected,
    isLoadingHistory,
    error: threadError,
  } = useSupportThread({
    sessionId: selectedId,
    userId: user?.id ?? '',
    username: user?.name ?? 'Nhân viên',
    senderType: 'employee',
    avatar: user?.avatar,
    accessToken,
    onRefreshToken: refreshRealtimeToken,
    enabled: !!selectedId,
    markReadAs: 'staff',
  })

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (!selectedId && sessions.length > 0) {
      setSelectedId(sessions[0].sessionId)
    }
  }, [selectedId, sessions])

  const handleSelect = useCallback(
    async (session: SupportSession) => {
      setSelectedId(session.sessionId)
      setDraft('')
      if (!accessToken) return
      try {
        const supabase = await applyRealtimeAuth(
          accessToken ?? (await refreshRealtimeToken()) ?? ''
        )
        await markSessionRead(supabase, session.sessionId, 'staff')
        await refresh()
      } catch {
        // ignore read marker failures
      }
    },
    [accessToken, refresh, refreshRealtimeToken]
  )

  const handleSend = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      const content = draft.trim()
      if (!content || !isConnected) return
      setDraft('')
      await sendMessage(content)
      await refresh()
    },
    [draft, isConnected, refresh, sendMessage]
  )

  return (
    <div className="flex h-[calc(100vh-2rem)] min-h-[32rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <aside className="flex w-full max-w-sm flex-col border-r border-slate-200 dark:border-slate-800">
        <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Hỗ trợ khách hàng
          </h2>
          <p className="text-sm text-slate-500">
            Chọn hội thoại để trả lời theo thứ tự tin nhắn
          </p>
        </div>

        {!realtimeConfigured ? (
          <div className="mx-3 mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Cần SUPABASE_SERVICE_ROLE_KEY trên backend để realtime hoạt động.
          </div>
        ) : null}

        {error ? (
          <div className="mx-3 mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="size-4 animate-spin" />
              Đang tải...
            </div>
          ) : sessions.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              Chưa có hội thoại hỗ trợ nào.
            </div>
          ) : (
            sessions.map((session) => {
              const unread = hasUnreadForStaff(session)
              const active = session.sessionId === selectedId
              const initials = session.customerName
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()

              return (
                <button
                  key={session.sessionId}
                  type="button"
                  onClick={() => void handleSelect(session)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60',
                    active && 'bg-blue-50 dark:bg-blue-950/30'
                  )}
                >
                  <Avatar className="size-10">
                    {session.customerAvatar ? (
                      <AvatarImage
                        src={session.customerAvatar}
                        alt={session.customerName}
                      />
                    ) : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {session.customerName}
                      </p>
                      <span className="shrink-0 text-[11px] text-slate-400">
                        {formatTime(session.lastMessageAt ?? session.updatedAt)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {session.customerEmail}
                    </p>
                    <p
                      className={cn(
                        'mt-1 truncate text-sm text-slate-600 dark:text-slate-300',
                        unread && 'font-semibold text-slate-900 dark:text-white'
                      )}
                    >
                      {session.lastMessagePreview || 'Chưa có tin nhắn'}
                    </p>
                  </div>
                  {unread ? (
                    <span className="mt-1 size-2.5 shrink-0 rounded-full bg-blue-600" />
                  ) : null}
                </button>
              )
            })
          )}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        {selected ? (
          <>
            <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="min-w-0">
                <h3 className="truncate font-bold text-slate-900 dark:text-white">
                  {selected.customerName}
                </h3>
                <p className="truncate text-sm text-slate-500">
                  {selected.customerEmail}
                </p>
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
            </header>

            {threadError ? (
              <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {threadError}
              </div>
            ) : null}

            <div
              ref={containerRef}
              className="flex-1 space-y-1 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950"
            >
              {isLoadingHistory ? (
                <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
                  <Loader2 className="size-4 animate-spin" />
                  Đang tải tin nhắn...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Chưa có tin nhắn trong hội thoại này.
                </div>
              ) : (
                messages.map((message, index) => {
                  const prev = index > 0 ? messages[index - 1] : null
                  const showHeader = !prev || prev.user.id !== message.user.id
                  return (
                    <ChatMessageItem
                      key={message.id}
                      message={message}
                      isOwnMessage={
                        message.senderType === 'employee' ||
                        message.user.id === user?.id
                      }
                      showHeader={showHeader}
                    />
                  )
                })
              )}
            </div>

            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t border-slate-200 p-4 dark:border-slate-800"
            >
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Nhập phản hồi cho khách..."
                disabled={!isConnected}
                className="rounded-full"
              />
              <Button
                type="submit"
                disabled={!isConnected || !draft.trim()}
                className="rounded-full bg-blue-700 hover:bg-blue-800"
              >
                <Send className="size-4" />
                Gửi
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-500">
            <MessageSquare className="size-10 opacity-40" />
            <p className="text-sm">Chọn một hội thoại bên trái để bắt đầu.</p>
          </div>
        )}
      </section>
    </div>
  )
}
