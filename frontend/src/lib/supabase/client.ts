import { createBrowserClient } from '@supabase/ssr'

/** Browser Supabase client — Realtime chat + hotel reviews (không dùng cho auth session) */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Set them in frontend/.env.local or the parent .env.'
    )
  }

  return createBrowserClient(url, key)
}
