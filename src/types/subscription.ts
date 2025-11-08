// Subscription types for Stripe integration

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'business'

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'unpaid'
  | 'incomplete'
  | 'trialing'
  | 'incomplete_expired'

export type ExportFormat = 'csv' | 'excel' | 'qbo' | 'qfx' | 'json'

export interface PlanFeatures {
  tier: SubscriptionTier
  name: string
  price: number // in pence (999 = £9.99)
  currency: 'gbp'
  interval: 'month'
  conversionsLimit: number
  exportFormats: ExportFormat[]
  dataRetentionDays: number
  features: string[]
  supportLevel: 'email' | 'priority' | 'dedicated'
  hasApiAccess: boolean
  hasBatchProcessing: boolean
  hasAdvancedAnalytics: boolean
  hasQuickBooksIntegration: boolean
  hasTransactionCategorization: boolean
  mostPopular?: boolean
}

export interface UserSubscription {
  id: string
  userId: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripePriceId: string | null
  conversionsUsedThisMonth: number
  conversionsLimit: number
  allowedExportFormats: ExportFormat[]
  subscriptionStartDate: Date | null
  subscriptionEndDate: Date | null
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UsageStats {
  conversionsUsed: number
  conversionsLimit: number
  percentageUsed: number
  conversionsRemaining: number
  resetDate: Date | null
  canConvert: boolean
}

export interface SubscriptionUpgrade {
  from: SubscriptionTier
  to: SubscriptionTier
  proratedAmount: number
  effectiveDate: Date
}

// Plan definitions
export const PLAN_FEATURES: Record<SubscriptionTier, PlanFeatures> = {
  free: {
    tier: 'free',
    name: 'Free',
    price: 0,
    currency: 'gbp',
    interval: 'month',
    conversionsLimit: 5,
    exportFormats: ['csv'],
    dataRetentionDays: 7,
    supportLevel: 'email',
    hasApiAccess: false,
    hasBatchProcessing: false,
    hasAdvancedAnalytics: false,
    hasQuickBooksIntegration: false,
    hasTransactionCategorization: false,
    features: [
      '5 conversions/month',
      'CSV export only',
      'Email support',
      '7-day data retention',
      'Access to all UK banks',
    ],
  },
  starter: {
    tier: 'starter',
    name: 'Starter',
    price: 999, // £9.99
    currency: 'gbp',
    interval: 'month',
    conversionsLimit: 50,
    exportFormats: ['csv'],
    dataRetentionDays: 30,
    supportLevel: 'email',
    hasApiAccess: false,
    hasBatchProcessing: false,
    hasAdvancedAnalytics: false,
    hasQuickBooksIntegration: false,
    hasTransactionCategorization: false,
    features: [
      '50 conversions/month',
      'CSV export only',
      'Email support',
      '30-day data retention',
      'Access to all UK banks',
    ],
  },
  professional: {
    tier: 'professional',
    name: 'Professional',
    price: 1999, // £19.99
    currency: 'gbp',
    interval: 'month',
    conversionsLimit: 150,
    exportFormats: ['csv', 'excel', 'qbo', 'qfx'],
    dataRetentionDays: 365,
    supportLevel: 'priority',
    hasApiAccess: false,
    hasBatchProcessing: false,
    hasAdvancedAnalytics: false,
    hasQuickBooksIntegration: true,
    hasTransactionCategorization: true,
    mostPopular: true,
    features: [
      '150 conversions/month',
      'All export formats (CSV, Excel, QBO, QFX)',
      'Priority email support',
      '1-year data retention',
      'QuickBooks/Xero integration',
      'Access to all UK banks',
      'Transaction categorization',
    ],
  },
  business: {
    tier: 'business',
    name: 'Business',
    price: 3999, // £39.99
    currency: 'gbp',
    interval: 'month',
    conversionsLimit: 500,
    exportFormats: ['csv', 'excel', 'qbo', 'qfx', 'json'],
    dataRetentionDays: 730,
    supportLevel: 'dedicated',
    hasApiAccess: true,
    hasBatchProcessing: true,
    hasAdvancedAnalytics: true,
    hasQuickBooksIntegration: true,
    hasTransactionCategorization: true,
    features: [
      '500 conversions/month',
      'All Professional features',
      'API access',
      'Dedicated support',
      '2-year data retention',
      'Advanced analytics',
      'Batch processing',
    ],
  },
}

// Helper function to format price
export function formatPrice(priceInPence: number): string {
  const pounds = (priceInPence / 100).toFixed(2)
  return `£${pounds}`
}

// Helper function to check if tier has feature
export function hasPlanFeature(
  tier: SubscriptionTier,
  feature: keyof PlanFeatures
): boolean {
  return PLAN_FEATURES[tier][feature] as boolean
}

// Helper to get plan by tier
export function getPlanFeatures(tier: SubscriptionTier): PlanFeatures {
  return PLAN_FEATURES[tier]
}
