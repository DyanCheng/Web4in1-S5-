import { createBrowserClient } from '@supabase/ssr'

/** Browser Supabase client — chỉ dùng cho Realtime chat, không dùng cho auth session */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
