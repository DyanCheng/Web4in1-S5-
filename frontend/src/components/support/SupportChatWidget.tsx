'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2, MessageCircle, Minimize2, Send, X } from 'lucide-react'

import { ChatMessageItem } from '@/components/Chat-message'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import { useCustomerSupportSession } from '@/hooks/use-support-session'
import { useSupportThread } from '@/hooks/use-support-thread'
import { isSupportStaffRole } from '@/lib/chat/support-constants'
import { cn } from '@/lib/utils'

const HIDDEN_PATH_PREFIXES = [
  '/login',
  '/register',
  '/admin',
  '/employee',
  '/accountant',
  '/hotel-owner',
]

export function SupportChatWidget() {
  const pathname = usePathname()
  const router = useRouter()
  const {
    user,
    accessToken,
    refreshRealtimeToken,
    isAuthenticated,
    isLoading: authLoading,
    realtimeConfigured,
  } = useAuth()

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const { containerRef, scrollToBottom } = useChatScroll()

  const hidden =
    authLoading ||
    !isAuthenticated ||
    !user ||
    isSupportStaffRole(user.role) ||
    HIDDEN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  const {
    session,
    isLoading: sessionLoading,
    error: sessionError,
    hasUnread,
    openOrCreate,
    clearUnread,
  } = useCustomerSupportSession({
    userId: user?.id ?? '',
    userName: user?.name ?? '',
    userEmail: user?.email ?? '',
    userAvatar: user?.avatar,
    accessToken,
    onRefreshToken: refreshRealtimeToken,
    enabled: !hidden,
  })

  const {
    messages,
    sendMessage,
    isConnected,
    isLoadingHistory,
    error: threadError,
  } = useSupportThread({
    sessionId: open ? (session?.sessionId ?? null) : null,
    userId: user?.id ?? '',
    username: user?.name ?? '',
    senderType: 'customer',
    avatar: user?.avatar,
    accessToken,
    onRefreshToken: refreshRealtimeToken,
    enabled: open && !!session,
    markReadAs: 'customer',
  })

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleOpen = useCallback(async () => {
    if (!user) {
      router.push('/login')
      return
    }
    setOpen(true)
    const next = session ?? (await openOrCreate())
    if (next) await clearUnread()
  }, [clearUnread, openOrCreate, router, session, user])

  const handleClose = useCallback(() => {
    setOpen(false)
    setDraft('')
  }, [])

  const handleSend = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      const content = draft.trim()
      if (!content || !isConnected) return
      setDraft('')
      await sendMessage(content)
    },
    [draft, isConnected, sendMessage]
  )

  if (hidden) return null

  const initials = (user?.name ?? 'CT')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {open ? (
        <div className="pointer-events-auto flex h-[min(34rem,calc(100vh-6.5rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900">
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-blue-700 px-4 py-3 text-white dark:bg-blue-800">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-9 border border-white/30">
                <AvatarImage src="/logo.svg" alt="CMC Travel" />
                <AvatarFallback className="bg-blue-500 text-xs font-bold">
                  CT
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">CMC Travel</p>
                <p className="truncate text-xs text-blue-100">
                  {isConnected ? 'Hỗ trợ trực tuyến' : 'Đang kết nối...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Thu nhỏ"
                onClick={handleClose}
                className="rounded-lg p-1.5 hover:bg-white/10"
              >
                <Minimize2 className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Đóng"
                onClick={handleClose}
                className="rounded-lg p-1.5 hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>
          </header>

          {!realtimeConfigured ? (
            <div className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              Backend cần SUPABASE_SERVICE_ROLE_KEY để chat realtime hoạt động.
            </div>
          ) : null}

          {(sessionError || threadError) && (
            <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {sessionError || threadError}
            </div>
          )}

          <div ref={containerRef} className="flex-1 space-y-1 overflow-y-auto bg-slate-50 p-3 dark:bg-slate-950">
            {sessionLoading || isLoadingHistory ? (
              <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" />
                Đang tải hội thoại...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
                Gửi tin nhắn để được nhân viên hỗ trợ.
              </div>
            ) : (
              messages.map((message, index) => {
                const prev = index > 0 ? messages[index - 1] : null
                const showHeader = !prev || prev.user.id !== message.user.id
                return (
                  <ChatMessageItem
                    key={message.id}
                    message={message}
                    isOwnMessage={message.user.id === user?.id}
                    showHeader={showHeader}
                  />
                )
              })
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
          >
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={!isConnected}
              className="rounded-full bg-slate-100 dark:bg-slate-800"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!isConnected || !draft.trim()}
              className="shrink-0 rounded-full bg-blue-700 hover:bg-blue-800"
            >
              {isConnected ? (
                <Send className="size-4" />
              ) : (
                <Loader2 className="size-4 animate-spin" />
              )}
            </Button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Mở chat hỗ trợ"
        onClick={() => {
          if (open) handleClose()
          else void handleOpen()
        }}
        className={cn(
          'pointer-events-auto relative flex size-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg shadow-blue-900/25 transition hover:scale-105 hover:bg-blue-800',
          open && 'ring-4 ring-blue-200 dark:ring-blue-900'
        )}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        {!open && hasUnread ? (
          <span className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full border-2 border-white bg-rose-500" />
        ) : null}
        <span className="sr-only">{initials}</span>
      </button>
    </div>
  )
}
