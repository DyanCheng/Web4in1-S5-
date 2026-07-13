'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/AuthContext'
import { canAccessSupportInbox } from '@/lib/chat/support-constants'

/** Legacy /chat → staff inbox or home (floating support widget). */
export default function ChatRedirectPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace('/login?redirect=/')
      return
    }

    if (canAccessSupportInbox(user?.role)) {
      router.replace('/employee/support')
      return
    }

    router.replace('/')
  }, [isAuthenticated, isLoading, router, user?.role])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
      Đang chuyển hướng...
    </div>
  )
}
