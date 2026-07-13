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

interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin' | 'hotel_owner' | 'employee' | 'accountant'
  avatar?: string
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  tokenExpiresAt: number | null
  realtimeConfigured: boolean
  login: (email: string, password: string, role?: string) => Promise<User>
  loginWithGoogle: (credential: string) => Promise<User>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
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
  accessToken?: string | null
  tokenExpiresAt?: number | null
  realtimeConfigured?: boolean
  message?: string
}

interface StoredSession {
  user: User
  accessToken?: string | null
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
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null)
  const [realtimeConfigured, setRealtimeConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const persistSession = useCallback((session: StoredSession | null) => {
    if (!session) {
      setUser(null)
      setAccessToken(null)
      setTokenExpiresAt(null)
      setRealtimeConfigured(false)
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    setUser(session.user)
    setAccessToken(session.accessToken ?? null)
    setTokenExpiresAt(session.tokenExpiresAt ?? null)
    setRealtimeConfigured(!!session.realtimeConfigured)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const parsed = JSON.parse(stored) as StoredSession | User
      if ('user' in parsed) {
        persistSession(parsed)
      } else {
        persistSession({ user: parsed })
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [persistSession])

  const applyAuthResponse = useCallback(
    (data: AuthResponse) => {
      const userData = toUser(data)
      persistSession({
        user: userData,
        accessToken: data.accessToken ?? null,
        tokenExpiresAt: data.tokenExpiresAt ?? null,
        realtimeConfigured: data.realtimeConfigured ?? false,
      })
      return userData
    },
    [persistSession]
  )

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

    const data = await readAuthResponse(response, 'Đăng nhập thất bại')
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
      tokenExpiresAt,
      realtimeConfigured,
    })
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
      tokenExpiresAt: data.tokenExpiresAt ?? null,
      realtimeConfigured: true,
    })

    return data.accessToken
  }, [user, accessToken, tokenExpiresAt, realtimeConfigured, persistSession])

  // Tự refresh token Realtime khi phát hiện JWT cũ (HS256) hoặc hết hạn
  useEffect(() => {
    if (!user || !isStaleRealtimeToken(accessToken)) return

    void refreshRealtimeToken().catch(() => {
      persistSession({
        user,
        accessToken: null,
        tokenExpiresAt: null,
        realtimeConfigured: false,
      })
    })
  }, [user, accessToken, refreshRealtimeToken, persistSession])

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        tokenExpiresAt,
        realtimeConfigured,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUser,
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
