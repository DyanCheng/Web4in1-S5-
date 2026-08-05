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
  apiToken: string | null
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
  }
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

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const parsed = JSON.parse(stored) as StoredSession | User
      let sessionUser: User | null = null;
      if ('user' in parsed) {
        sessionUser = parsed.user;
        persistSession(parsed)
      } else {
        sessionUser = parsed as User;
        persistSession({ user: parsed })
      }

      if (sessionUser) {
        // Verify user status on load
        fetch(`/api/auth/me?userId=${sessionUser.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.status === 'banned') {
              persistSession(null)
              toast.error('Tài khoản của bạn đã bị khóa')
              window.location.href = '/login'
            }
          })
          .catch(console.error)
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
        apiToken: data.apiToken ?? null,
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

    let data: AuthResponse;
    try {
      data = await readAuthResponse(response, 'Đăng nhập thất bại')
    } catch (error: any) {
      // Login failed. Check if it's because the account is banned
      const statusRes = await fetch(`/api/auth/me?email=${encodeURIComponent(email)}`)
      if (statusRes.ok) {
        const statusData = await statusRes.json()
        if (statusData.status === 'banned') {
          throw new Error('Tài khoản của bạn đã bị khóa')
        }
      }
      throw error;
    }
    
    // Check status right after login just in case
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

    // Check status right after Google login
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
      apiToken, // keep existing apiToken
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
        apiToken, // retain apiToken even if realtime token fails
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
        apiToken,
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
