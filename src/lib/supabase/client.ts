import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton instance to prevent multiple GoTrueClient instances
let supabaseInstance: SupabaseClient | null = null

export function createClient() {
  // Return existing instance if available (prevents "Multiple GoTrueClient instances" warning)
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Create new instance only on first call
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return supabaseInstance
}

// Helper to reset the client (useful for testing or sign-out)
export function resetClient() {
  supabaseInstance = null
}
