import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for client components
 * Use this in 'use client' components
 */
export const createClient = () => {
  return createClientComponentClient()
}

/**
 * Create a Supabase client for server components
 * Use this in server components, API routes, and middleware
 */
export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
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
