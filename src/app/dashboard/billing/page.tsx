'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { PricingCard } from '@/components/pricing/PricingCard'
import { PLAN_FEATURES, formatPrice } from '@/types/subscription'
import {
  CreditCard,
  ExternalLink,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'

interface BillingData {
  subscription: {
    tier: string
    status: string
    cancelAtPeriodEnd: boolean
    currentPeriodEnd: string | null
  }
  usage: {
    conversionsUsed: number
    conversionsLimit: number
    percentageUsed: number
  }
}

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function fetchBillingData() {
      try {
        const response = await fetch('/api/subscription/usage')
        if (response.ok) {
          const billingData = await response.json()
          setData(billingData)
        }
      } catch (error) {
        console.error('Failed to fetch billing data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBillingData()
  }, [])

  const handleOpenPortal = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        console.error('Failed to create portal session')
      }
    } catch (error) {
      console.error('Error opening portal:', error)
    } finally {
      setPortalLoading(false)
    }
  }

  const tierDisplayNames: Record<string, string> = {
    free: 'Free',
    starter: 'Starter',
    professional: 'Professional',
    business: 'Business',
  }

  const statusColors: Record<string, string> = {
    active: 'bg-uk-green-100 text-uk-green-800',
    canceled: 'bg-gray-100 text-gray-800',
    past_due: 'bg-red-100 text-red-800',
    unpaid: 'bg-red-100 text-red-800',
    trialing: 'bg-blue-100 text-blue-800',
  }

  const plans = [
    {
      ...PLAN_FEATURES.starter,
      paymentLink: process.env.NEXT_PUBLIC_STRIPE_STARTER_PAYMENT_LINK,
    },
    {
      ...PLAN_FEATURES.professional,
      paymentLink: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PAYMENT_LINK,
    },
    {
      ...PLAN_FEATURES.business,
      paymentLink: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PAYMENT_LINK,
    },
  ]

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load billing information. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { subscription, usage } = data
  const currentTier = subscription.tier
  const isFree = currentTier === 'free'

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Subscription Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Subscription
              </CardTitle>
              <CardDescription>
                Your current plan and billing status
              </CardDescription>
            </div>
            <Badge className={statusColors[subscription.status] || 'bg-gray-100'}>
              {subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Plan</p>
              <p className="text-2xl font-bold">
                {tierDisplayNames[currentTier] || currentTier}
              </p>
              {!isFree && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formatPrice(PLAN_FEATURES[currentTier as keyof typeof PLAN_FEATURES]?.price || 0)}/month
                </p>
              )}
            </div>

            {!isFree && subscription.currentPeriodEnd && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {subscription.cancelAtPeriodEnd ? 'Ends on' : 'Renews on'}
                </p>
                <p className="text-lg font-semibold">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Usage Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                Monthly Usage
              </p>
              <p className="text-sm text-muted-foreground">
                {usage.conversionsUsed} / {usage.conversionsLimit} conversions
              </p>
            </div>
            <Progress
              value={usage.percentageUsed}
              className={
                usage.percentageUsed >= 100
                  ? '[&>div]:bg-red-500'
                  : usage.percentageUsed >= 80
                  ? '[&>div]:bg-amber-500'
                  : '[&>div]:bg-uk-green-500'
              }
            />
            <p className="text-xs text-muted-foreground">
              {usage.percentageUsed.toFixed(0)}% of monthly limit used
            </p>
          </div>

          {/* Warnings */}
          {subscription.cancelAtPeriodEnd && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your subscription is scheduled to be cancelled. Reactivate from the customer portal.
              </AlertDescription>
            </Alert>
          )}

          {subscription.status === 'past_due' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your payment is past due. Please update your payment method to continue using paid features.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!isFree && (
              <Button
                onClick={handleOpenPortal}
                disabled={portalLoading}
                className="flex-1"
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Manage Billing
                  </>
                )}
              </Button>
            )}
            <Link href="/pricing" className={isFree ? 'flex-1' : ''}>
              <Button variant="outline" className="w-full">
                {isFree ? 'View Plans' : 'Change Plan'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard
              key={plan.tier}
              plan={plan}
              paymentLink={plan.paymentLink}
              isCurrentPlan={plan.tier === currentTier}
              isAuthenticated={true}
            />
          ))}
        </div>
      </div>

      {/* Help Text */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Need help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            If you have questions about billing or need to discuss a custom plan for your business,
            we're here to help.
          </p>
          <Link href="/dashboard/help">
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
