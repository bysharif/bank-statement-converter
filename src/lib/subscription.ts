import { createClient } from '@/lib/supabase/server'
import {
  SubscriptionTier,
  SubscriptionStatus,
  UserSubscription,
  UsageStats,
  PLAN_FEATURES,
  ExportFormat,
} from '@/types/subscription'

/**
 * Get user's current subscription from database
 */
export async function getUserSubscription(
  userId: string
): Promise<UserSubscription | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user subscription:', error)
      return null
    }

    if (!data) return null

    return {
      id: data.id,
      userId: data.id,
      tier: (data.subscription_tier as SubscriptionTier) || 'free',
      status: (data.subscription_status as SubscriptionStatus) || 'active',
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      stripePriceId: data.stripe_price_id,
      conversionsUsedThisMonth: data.conversions_used_this_month || 0,
      conversionsLimit: data.conversions_limit || 5,
      allowedExportFormats: data.allowed_export_formats || ['csv'],
      subscriptionStartDate: data.subscription_start_date
        ? new Date(data.subscription_start_date)
        : null,
      subscriptionEndDate: data.subscription_end_date
        ? new Date(data.subscription_end_date)
        : null,
      currentPeriodStart: data.current_period_start
        ? new Date(data.current_period_start)
        : null,
      currentPeriodEnd: data.current_period_end
        ? new Date(data.current_period_end)
        : null,
      cancelAtPeriodEnd: data.cancel_at_period_end || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  } catch (error) {
    console.error('Error in getUserSubscription:', error)
    return null
  }
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsageStats(
  userId: string
): Promise<UsageStats | null> {
  try {
    const subscription = await getUserSubscription(userId)

    if (!subscription) return null

    const conversionsUsed = subscription.conversionsUsedThisMonth
    const conversionsLimit = subscription.conversionsLimit
    const conversionsRemaining = Math.max(0, conversionsLimit - conversionsUsed)
    const percentageUsed = Math.round((conversionsUsed / conversionsLimit) * 100)
    const canConvert = conversionsUsed < conversionsLimit

    return {
      conversionsUsed,
      conversionsLimit,
      percentageUsed,
      conversionsRemaining,
      resetDate: subscription.currentPeriodEnd,
      canConvert,
    }
  } catch (error) {
    console.error('Error in getUserUsageStats:', error)
    return null
  }
}

/**
 * Check if user can perform a conversion based on their limit
 */
export async function canUserConvert(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('can_user_convert', {
      user_id: userId,
    })

    if (error) {
      console.error('Error checking conversion limit:', error)
      return false
    }

    return data === true
  } catch (error) {
    console.error('Error in canUserConvert:', error)
    return false
  }
}

/**
 * Increment user's conversion count
 */
export async function incrementConversionCount(
  userId: string
): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.rpc('increment_conversion_count', {
      user_id: userId,
    })

    if (error) {
      console.error('Error incrementing conversion count:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in incrementConversionCount:', error)
    return false
  }
}

/**
 * Check if user's subscription is active
 */
export async function isSubscriptionActive(userId: string): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId)

    if (!subscription) return false

    return subscription.status === 'active' || subscription.status === 'trialing'
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return false
  }
}

/**
 * Get features available for a subscription tier
 */
export function getTierFeatures(tier: SubscriptionTier) {
  return PLAN_FEATURES[tier]
}

/**
 * Check if a tier has access to a specific export format
 */
export function canExportFormat(
  tier: SubscriptionTier,
  format: ExportFormat
): boolean {
  const features = PLAN_FEATURES[tier]
  return features.exportFormats.includes(format)
}

/**
 * Get upgrade recommendations for a user based on usage
 */
export async function getUpgradeRecommendation(
  userId: string
): Promise<SubscriptionTier | null> {
  try {
    const stats = await getUserUsageStats(userId)
    const subscription = await getUserSubscription(userId)

    if (!stats || !subscription) return null

    // If user is consistently hitting 80%+ of their limit, recommend upgrade
    if (stats.percentageUsed >= 80) {
      const currentTier = subscription.tier

      if (currentTier === 'free') return 'starter'
      if (currentTier === 'starter') return 'professional'
      if (currentTier === 'professional') return 'business'
    }

    return null
  } catch (error) {
    console.error('Error getting upgrade recommendation:', error)
    return null
  }
}

/**
 * Update user subscription in database (called from webhooks)
 */
export async function updateUserSubscription(
  userId: string,
  updates: {
    tier?: SubscriptionTier
    status?: SubscriptionStatus
    stripeSubscriptionId?: string
    stripePriceId?: string
    currentPeriodStart?: Date
    currentPeriodEnd?: Date
    cancelAtPeriodEnd?: boolean
  }
): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Get tier-specific limits
    let conversionsLimit = 5
    let allowedFormats: ExportFormat[] = ['csv']

    if (updates.tier) {
      const features = PLAN_FEATURES[updates.tier]
      conversionsLimit = features.conversionsLimit
      allowedFormats = features.exportFormats
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: updates.tier,
        subscription_status: updates.status,
        stripe_subscription_id: updates.stripeSubscriptionId,
        stripe_price_id: updates.stripePriceId,
        current_period_start: updates.currentPeriodStart?.toISOString(),
        current_period_end: updates.currentPeriodEnd?.toISOString(),
        cancel_at_period_end: updates.cancelAtPeriodEnd,
        conversions_limit: conversionsLimit,
        allowed_export_formats: allowedFormats,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user subscription:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in updateUserSubscription:', error)
    return false
  }
}

/**
 * Reset monthly conversion count (called when period renews)
 */
export async function resetMonthlyConversions(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('profiles')
      .update({
        conversions_used_this_month: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Error resetting monthly conversions:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in resetMonthlyConversions:', error)
    return false
  }
}

/**
 * Set Stripe customer ID for a user
 */
export async function setStripeCustomerId(
  userId: string,
  customerId: string
): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('profiles')
      .update({
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Error setting Stripe customer ID:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in setStripeCustomerId:', error)
    return false
  }
}

/**
 * Check if user has access to a feature
 */
export function hasFeatureAccess(
  tier: SubscriptionTier,
  feature: 'api' | 'batch' | 'analytics' | 'quickbooks' | 'categorization'
): boolean {
  const features = PLAN_FEATURES[tier]

  switch (feature) {
    case 'api':
      return features.hasApiAccess
    case 'batch':
      return features.hasBatchProcessing
    case 'analytics':
      return features.hasAdvancedAnalytics
    case 'quickbooks':
      return features.hasQuickBooksIntegration
    case 'categorization':
      return features.hasTransactionCategorization
    default:
      return false
  }
}

/**
 * Get days until subscription renewal
 */
export function getDaysUntilRenewal(currentPeriodEnd: Date | null): number | null {
  if (!currentPeriodEnd) return null

  const now = new Date()
  const diffTime = currentPeriodEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Format subscription status for display
 */
export function formatSubscriptionStatus(status: SubscriptionStatus): string {
  const statusMap: Record<SubscriptionStatus, string> = {
    active: 'Active',
    canceled: 'Canceled',
    past_due: 'Past Due',
    unpaid: 'Unpaid',
    incomplete: 'Incomplete',
    trialing: 'Trial',
    incomplete_expired: 'Expired',
  }

  return statusMap[status] || status
}
