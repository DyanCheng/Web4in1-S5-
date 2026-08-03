'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LayoutGrid, MessageSquare, Settings } from 'lucide-react'

import { SupportInbox } from '@/components/support/SupportInbox'
import { useAuth } from '@/contexts/AuthContext'
import { canAccessSupportInbox } from '@/lib/chat/support-constants'

export default function EmployeeSupportPage() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && (!user || !canAccessSupportInbox(user.role))) {
      router.replace('/login?redirect=/employee/support')
    }
  }, [isLoading, router, user])

  if (isLoading || !user || !canAccessSupportInbox(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 dark:text-slate-400">
        Đang kiểm tra quyền truy cập...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex font-sans">
      <aside className="hidden md:flex w-[260px] flex-shrink-0 bg-[#f8faff] dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex-col fixed h-full left-0 top-0 z-10">
        <div className="px-6 py-8">
          <h1 className="text-xl font-black text-blue-700 dark:text-blue-400 tracking-tight">
            CMC Travel
          </h1>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
            {user.role === 'admin' ? 'Admin Portal' : 'Management Portal'}
          </p>
        </div>

        <nav className="px-4 space-y-2 mt-4 flex-1">
          {user.role === 'employee' ? (
            <Link
              href="/employee"
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <LayoutGrid className="size-5" />
              Thông Tin Khách Hàng
            </Link>
          ) : (
            <Link
              href="/admin"
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <ArrowLeft className="size-5" />
              Về bảng quản trị
            </Link>
          )}
          <Link
            href="/employee/support"
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#1e3a8a] dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm border border-blue-100/50 dark:border-blue-900/50 transition-colors"
          >
            <MessageSquare className="size-5 text-blue-600 dark:text-blue-400" />
            Hỗ trợ chat
          </Link>
        </nav>

        <div className="px-4 pb-8 space-y-2">
          <div className="h-px bg-slate-200 dark:bg-slate-800 mb-4 mx-2" />
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors text-left"
          >
            <Settings className="size-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-[260px] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3 md:hidden">
          <h1 className="text-xl font-bold text-blue-700 dark:text-blue-400">Hỗ trợ chat</h1>
          <Link href={user.role === 'admin' ? '/admin' : '/employee'} className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Quay lại
          </Link>
        </div>
        <SupportInbox />
      </main>
    </div>
  )
}
