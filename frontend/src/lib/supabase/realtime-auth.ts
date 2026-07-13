import { createClient } from '@/lib/supabase/client'

/** Token cũ (HS256/anon) không hợp lệ cho private Realtime channel — cần refresh từ backend */
export function isStaleRealtimeToken(token: string | null | undefined): boolean {
  if (!token) return false

  try {
    const [header] = token.split('.')
    if (!header) return true

    const normalized = header.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '='
    )
    const decoded = JSON.parse(atob(padded)) as { alg?: string }
    return decoded.alg === 'HS256'
  } catch {
    return true
  }
}

/** Gắn JWT do backend cấp vào Supabase Realtime client trước khi subscribe channel */
export async function applyRealtimeAuth(accessToken: string) {
  const supabase = createClient()
  await supabase.realtime.setAuth(accessToken)
  return supabase
}
