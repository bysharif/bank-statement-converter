/**
 * Re-export the Supabase client from the centralized location
 * This ensures all client-side code uses the same singleton instance
 */
export { createClient, resetClient } from '@/lib/supabase/client'

/**
 * Database Types
 * These will be auto-generated later when we create our tables
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          tier: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          tier?: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          tier?: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
