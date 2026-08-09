'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import { apiUrl, parseJsonResponse } from '@/lib/backendUrl'
import { isStaleRealtimeToken } from '@/lib/supabase/realtime-auth'
import { toast } from 'sonner'

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin' | 'hotel_owner' | 'employee' | 'accountant'
  avatar?: string
  phone?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  authProvider?: 'local' | 'google' | string
  canChangePassword?: boolean
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  apiToken: string | null
  tokenExpiresAt: number | null
  realtimeConfigured: boolean
  login: (email: string, password: string, role?: string) => Promise<User>
  loginWithGoogle: (credential: string) => Promise<User>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
  refreshProfile: () => Promise<User | null>
  updateProfile: (data: {
    fullName?: string
    phone?: string
    dateOfBirth?: string
    gender?: string
  }) => Promise<User>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  uploadAvatar: (dataUrl: string) => Promise<string>
  refreshRealtimeToken: () => Promise<string | null>
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthResponse {
  id: string
  email: string
  name: string
  role: User['role']
  avatar?: string
  phone?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  authProvider?: string
  canChangePassword?: boolean
  accessToken?: string | null
  apiToken?: string | null
  tokenExpiresAt?: number | null
  realtimeConfigured?: boolean
  message?: string
}

interface StoredSession {
  user: User
  accessToken?: string | null
  apiToken?: string | null
  tokenExpiresAt?: number | null
  realtimeConfigured?: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
// Session lưu localStorage — gồm user + Supabase Realtime JWT (không phải cookie HTTP-only)
const STORAGE_KEY = 'cmc_travel_user'

async function readAuthResponse(
  response: Response,
  fallbackMessage: string
): Promise<AuthResponse> {
  const data = await parseJsonResponse<AuthResponse>(response)
  if (!response.ok) {
    throw new Error(data.message || fallbackMessage)
  }
  return data
}

function toUser(data: AuthResponse): User {
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role,
    avatar: data.avatar,
    phone: data.phone ?? null,
    dateOfBirth: data.dateOfBirth ?? null,
    gender: data.gender ?? null,
    authProvider: data.authProvider ?? 'local',
    canChangePassword: data.canChangePassword ?? data.authProvider !== 'google',
  }
}

function authHeaders(apiToken: string | null, json = true): HeadersInit {
  const headers: Record<string, string> = {}
  if (json) headers['Content-Type'] = 'application/json'
  if (apiToken) headers.Authorization = `Bearer ${apiToken}`
  return headers
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [apiToken, setApiToken] = useState<string | null>(null)
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null)
  const [realtimeConfigured, setRealtimeConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const persistSession = useCallback((session: StoredSession | null) => {
    if (!session) {
      setUser(null)
      setAccessToken(null)
      setApiToken(null)
      setTokenExpiresAt(null)
      setRealtimeConfigured(false)
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    setUser(session.user)
    setAccessToken(session.accessToken ?? null)
    setApiToken(session.apiToken ?? null)
    setTokenExpiresAt(session.tokenExpiresAt ?? null)
    setRealtimeConfigured(!!session.realtimeConfigured)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }, [])

  const applyAuthResponse = useCallback(
    (data: AuthResponse) => {
      const userData = toUser(data)
      persistSession({
        user: userData,
        accessToken: data.accessToken ?? null,
        apiToken: data.apiToken ?? null,
        tokenExpiresAt: data.tokenExpiresAt ?? null,
        realtimeConfigured: data.realtimeConfigured ?? false,
      })
      return userData
    },
    [persistSession]
  )

  const refreshProfile = useCallback(async (): Promise<User | null> => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as StoredSession
    const token = parsed.apiToken
    if (!token) return parsed.user ?? null

    try {
      const response = await fetch(apiUrl('/api/auth/me'), {
        headers: authHeaders(token, false),
      })
      if (!response.ok) return parsed.user ?? null
      const data = await parseJsonResponse<AuthResponse>(response)
      const nextUser = toUser(data)
      persistSession({
        user: nextUser,
        accessToken: parsed.accessToken ?? null,
        apiToken: parsed.apiToken ?? null,
        tokenExpiresAt: parsed.tokenExpiresAt ?? null,
        realtimeConfigured: parsed.realtimeConfigured ?? false,
      })
      return nextUser
    } catch {
      return parsed.user ?? null
    }
  }, [persistSession])

  useEffect(() => {
    const boot = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return

        const parsed = JSON.parse(stored) as StoredSession | User
        let session: StoredSession
        if ('user' in parsed) {
          session = parsed
          persistSession(parsed)
        } else {
          session = { user: parsed }
          persistSession(session)
        }

        // Verify ban status (Next.js route)
        fetch(`/api/auth/me?userId=${session.user.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.status === 'banned') {
              persistSession(null)
              toast.error('Tài khoản của bạn đã bị khóa')
              window.location.href = '/login'
            }
          })
          .catch(console.error)

        // Hydrate profile fields from backend when JWT exists
        if (session.apiToken) {
          await refreshProfile()
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      } finally {
        setIsLoading(false)
      }
    }

    void boot()
  }, [persistSession, refreshProfile])

  const login = async (
    email: string,
    password: string,
    role: string = 'user'
  ): Promise<User> => {
    let response: Response
    try {
      response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })
    } catch {
      throw new Error(
        'Không thể kết nối máy chủ. Kiểm tra backend Railway và redeploy Vercel.'
      )
    }

    let data: AuthResponse
    try {
      data = await readAuthResponse(response, 'Đăng nhập thất bại')
    } catch (error: any) {
      const statusRes = await fetch(`/api/auth/me?email=${encodeURIComponent(email)}`)
      if (statusRes.ok) {
        const statusData = await statusRes.json()
        if (statusData.status === 'banned') {
          throw new Error('Tài khoản của bạn đã bị khóa')
        }
      }
      throw error
    }

    const statusRes = await fetch(`/api/auth/me?userId=${data.id}`)
    if (statusRes.ok) {
      const statusData = await statusRes.json()
      if (statusData.status === 'banned') {
        throw new Error('Tài khoản của bạn đã bị khóa')
      }
    }

    return applyAuthResponse(data)
  }

  const loginWithGoogle = async (credential: string): Promise<User> => {
    let response: Response
    try {
      response = await fetch(apiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      })
    } catch {
      throw new Error(
        'Không thể kết nối máy chủ. Kiểm tra backend Railway và redeploy Vercel.'
      )
    }

    const data = await readAuthResponse(response, 'Đăng nhập Google thất bại')

    const statusRes = await fetch(`/api/auth/me?userId=${data.id}`)
    if (statusRes.ok) {
      const statusData = await statusRes.json()
      if (statusData.status === 'banned') {
        throw new Error('Tài khoản của bạn đã bị khóa')
      }
    }

    return applyAuthResponse(data)
  }

  const register = async (email: string, password: string, name: string) => {
    let response: Response
    try {
      response = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })
    } catch {
      throw new Error(
        'Không thể kết nối máy chủ. Kiểm tra backend Railway và redeploy Vercel.'
      )
    }

    const data = await readAuthResponse(response, 'Đăng ký thất bại')
    applyAuthResponse(data)
  }

  const logout = () => {
    persistSession(null)
  }

  const updateUser = (data: Partial<User>) => {
    if (!user) return
    persistSession({
      user: { ...user, ...data },
      accessToken,
      apiToken,
      tokenExpiresAt,
      realtimeConfigured,
    })
  }

  const updateProfile = async (data: {
    fullName?: string
    phone?: string
    dateOfBirth?: string
    gender?: string
  }): Promise<User> => {
    if (!apiToken) throw new Error('Vui lòng đăng nhập lại')

    const response = await fetch(apiUrl('/api/auth/profile'), {
      method: 'PATCH',
      headers: authHeaders(apiToken),
      body: JSON.stringify({
        fullName: data.fullName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
      }),
    })
    const result = await parseJsonResponse<AuthResponse>(response)
    if (!response.ok) throw new Error(result.message || 'Cập nhật hồ sơ thất bại')

    const nextUser = toUser(result)
    persistSession({
      user: nextUser,
      accessToken,
      apiToken,
      tokenExpiresAt,
      realtimeConfigured,
    })
    return nextUser
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!apiToken) throw new Error('Vui lòng đăng nhập lại')
    const response = await fetch(apiUrl('/api/auth/change-password'), {
      method: 'POST',
      headers: authHeaders(apiToken),
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const result = await parseJsonResponse<{ message?: string }>(response)
    if (!response.ok) throw new Error(result.message || 'Đổi mật khẩu thất bại')
  }

  const uploadAvatar = async (dataUrl: string): Promise<string> => {
    if (!apiToken) throw new Error('Vui lòng đăng nhập lại')
    const response = await fetch(apiUrl('/api/auth/avatar'), {
      method: 'POST',
      headers: authHeaders(apiToken),
      body: JSON.stringify({ dataUrl }),
    })
    const result = await parseJsonResponse<{
      avatar?: string
      avatarUrl?: string
      message?: string
      profile?: AuthResponse
    }>(response)
    if (!response.ok) throw new Error(result.message || 'Cập nhật ảnh thất bại')

    const avatar = result.avatar || result.avatarUrl || ''
    if (result.profile) {
      persistSession({
        user: toUser(result.profile),
        accessToken,
        apiToken,
        tokenExpiresAt,
        realtimeConfigured,
      })
    } else if (user) {
      persistSession({
        user: { ...user, avatar },
        accessToken,
        apiToken,
        tokenExpiresAt,
        realtimeConfigured,
      })
    }
    return avatar
  }

  const refreshRealtimeToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null

    const response = await fetch(apiUrl('/api/auth/realtime-token'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, email: user.email }),
    })

    const data = await parseJsonResponse<{
      accessToken?: string
      tokenExpiresAt?: number
      message?: string
    }>(response)

    if (!response.ok || !data.accessToken) {
      throw new Error(data.message || 'Không thể làm mới token chat')
    }

    persistSession({
      user,
      accessToken: data.accessToken,
      apiToken,
      tokenExpiresAt: data.tokenExpiresAt ?? null,
      realtimeConfigured: true,
    })

    return data.accessToken
  }, [user, apiToken, persistSession])

  useEffect(() => {
    if (!user || !isStaleRealtimeToken(accessToken)) return

    void refreshRealtimeToken().catch(() => {
      persistSession({
        user,
        accessToken: null,
        apiToken,
        tokenExpiresAt: null,
        realtimeConfigured: false,
      })
    })
  }, [user, accessToken, apiToken, refreshRealtimeToken, persistSession])

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        apiToken,
        tokenExpiresAt,
        realtimeConfigured,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUser,
        refreshProfile,
        updateProfile,
        changePassword,
        uploadAvatar,
        refreshRealtimeToken,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
