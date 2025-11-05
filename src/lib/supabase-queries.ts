/**
 * Supabase Database Query Helpers
 * Centralized functions for fetching and saving user-specific data
 */

import { createClient } from '@/lib/supabase'

// Types for our database tables
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface ConversionJob {
  id: string
  user_id: string
  original_filename: string
  file_size: number
  file_type: string
  bank_detected: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  transactions_count: number | null
  processing_time_ms: number | null
  error_message: string | null
  created_at: string
  completed_at: string | null
}

export interface UserStats {
  totalConversions: number
  conversionsToday: number
  successRate: number
  totalTransactions: number
  averageProcessingTime: number
}

export interface RecentActivity {
  id: string
  filename: string
  bank: string | null
  status: 'success' | 'failed' | 'processing'
  transactionCount: number | null
  timestamp: string
  errorMessage: string | null
}

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

/**
 * Get user statistics for dashboard
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = createClient()

  // Get total conversions
  const { count: totalConversions } = await supabase
    .from('conversion_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get conversions today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: conversionsToday } = await supabase
    .from('conversion_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())

  // Get completed conversions for success rate
  const { count: completedJobs } = await supabase
    .from('conversion_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')

  // Calculate success rate
  const successRate = totalConversions && totalConversions > 0
    ? (completedJobs || 0) / totalConversions * 100
    : 0

  // Get total transactions from all completed jobs
  const { data: jobs } = await supabase
    .from('conversion_jobs')
    .select('transactions_count, processing_time_ms')
    .eq('user_id', userId)
    .eq('status', 'completed')

  const totalTransactions = jobs?.reduce((sum, job) => sum + (job.transactions_count || 0), 0) || 0
  const averageProcessingTime = jobs && jobs.length > 0
    ? jobs.reduce((sum, job) => sum + (job.processing_time_ms || 0), 0) / jobs.length
    : 0

  return {
    totalConversions: totalConversions || 0,
    conversionsToday: conversionsToday || 0,
    successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
    totalTransactions,
    averageProcessingTime: Math.round(averageProcessingTime),
  }
}

/**
 * Get recent conversion activity for user
 */
export async function getRecentActivity(
  userId: string,
  limit: number = 10
): Promise<RecentActivity[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('conversion_jobs')
    .select('id, original_filename, bank_detected, status, transactions_count, error_message, created_at, completed_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }

  return data.map(job => ({
    id: job.id,
    filename: job.original_filename,
    bank: job.bank_detected,
    status: job.status === 'completed' ? 'success' : job.status === 'failed' ? 'failed' : 'processing',
    transactionCount: job.transactions_count,
    timestamp: job.completed_at || job.created_at,
    errorMessage: job.error_message,
  }))
}

/**
 * Save a conversion job to database
 */
export async function saveConversion(data: {
  userId: string
  filename: string
  fileSize: number
  fileType: string
  filePath?: string
  bankDetected?: string
  status: 'completed' | 'failed'
  transactionsCount?: number
  processingTimeMs?: number
  errorMessage?: string
}): Promise<{ success: boolean; jobId?: string; error?: string }> {
  const supabase = createClient()

  const { data: job, error } = await supabase
    .from('conversion_jobs')
    .insert({
      user_id: data.userId,
      original_filename: data.filename,
      file_size: data.fileSize,
      file_type: data.fileType,
      input_file_path: data.filePath,
      bank_detected: data.bankDetected,
      input_format: 'pdf',
      output_format: 'csv',
      status: data.status,
      transactions_count: data.transactionsCount,
      processing_time_ms: data.processingTimeMs,
      error_message: data.errorMessage,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error saving conversion:', error)
    return { success: false, error: error.message }
  }

  return { success: true, jobId: job.id }
}

/**
 * Get all conversions for a user
 */
export async function getUserConversions(userId: string): Promise<ConversionJob[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('conversion_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user conversions:', error)
    return []
  }

  return data
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string
    avatar_url?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Get supported banks list
 */
export async function getSupportedBanks() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('banks')
    .select('*')
    .eq('is_active', true)
    .order('display_name')

  if (error) {
    console.error('Error fetching banks:', error)
    return []
  }

  return data
}
