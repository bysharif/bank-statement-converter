import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

/**
 * Create a Supabase client for client components
 * Use this in 'use client' components
 */
export const createClient = () => {
  return createClientComponentClient()
}

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
