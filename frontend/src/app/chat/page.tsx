'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { RealtimeChat } from '@/components/realtime-chat'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import {
  CHAT_ROOMS,
  canAccessRoom,
  type ChatRoomKey,
} from '@/lib/chat/constants'

export default function ChatPage() {
  const router = useRouter()
  const {
    user,
    accessToken,
    realtimeConfigured,
    refreshRealtimeToken,
    isAuthenticated,
    isLoading,
  } = useAuth()
  const [activeRoom, setActiveRoom] = useState<ChatRoomKey>('lobby')

  const availableRooms = useMemo(
    () =>
      (Object.keys(CHAT_ROOMS) as ChatRoomKey[]).filter((roomKey) =>
        canAccessRoom(roomKey, user?.role)
      ),
    [user?.role]
  )

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login?redirect=/chat')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!availableRooms.includes(activeRoom) && availableRooms.length > 0) {
      setActiveRoom(availableRooms[0])
    }
  }, [activeRoom, availableRooms])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Đang tải phòng chat...
      </div>
    )
  }

  const room = CHAT_ROOMS[activeRoom]

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trò chuyện trực tuyến</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableRooms.map((roomKey) => {
              const item = CHAT_ROOMS[roomKey]
              return (
                <Button
                  key={roomKey}
                  variant={activeRoom === roomKey ? 'default' : 'outline'}
                  onClick={() => setActiveRoom(roomKey)}
                >
                  {item.label}
                </Button>
              )
            })}
          </div>
        </div>

        {!realtimeConfigured ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            Backend cần <code>SUPABASE_SERVICE_ROLE_KEY</code> trong <code>.env</code> để
            tạo token Realtime hợp lệ. Lấy từ Supabase Dashboard → Settings → API →
            service_role, rồi đăng xuất và đăng nhập lại.
          </div>
        ) : null}

        <RealtimeChat
          key={`${room.topic}-${user.id}`}
          roomTopic={room.topic}
          roomLabel={room.label}
          userId={user.id}
          username={user.name}
          userRole={user.role}
          avatar={user.avatar}
          accessToken={accessToken}
          onRefreshToken={refreshRealtimeToken}
        />
      </main>

      <Footer />
    </div>
  )
}
