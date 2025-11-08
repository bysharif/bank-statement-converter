'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Zap, ArrowUpCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface SubscriptionUsageProps {
  className?: string
}

interface UsageData {
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

export function SubscriptionUsage({ className }: SubscriptionUsageProps) {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsage() {
      try {
        const response = await fetch('/api/subscription/usage')
        if (response.ok) {
          const usageData = await response.json()
          setData(usageData)
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Subscription Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const { subscription, usage } = data
  const percentageUsed = usage.percentageUsed
  const isNearLimit = percentageUsed >= 80 && percentageUsed < 100
  const isAtLimit = percentageUsed >= 100
  const isFree = subscription.tier === 'free'

  const tierDisplayNames: Record<string, string> = {
    free: 'Free',
    starter: 'Starter',
    professional: 'Professional',
    business: 'Business',
  }

  const tierColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-800',
    starter: 'bg-blue-100 text-blue-800',
    professional: 'bg-purple-100 text-purple-800',
    business: 'bg-amber-100 text-amber-800',
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription Usage</CardTitle>
            <CardDescription>
              Monthly conversion usage
            </CardDescription>
          </div>
          <Badge className={tierColors[subscription.tier] || 'bg-gray-100'}>
            {tierDisplayNames[subscription.tier] || subscription.tier}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Conversions used</span>
            <span className="font-medium">
              {usage.conversionsUsed} / {usage.conversionsLimit}
            </span>
          </div>
          <Progress
            value={percentageUsed}
            className={
              isAtLimit
                ? '[&>div]:bg-red-500'
                : isNearLimit
                ? '[&>div]:bg-amber-500'
                : '[&>div]:bg-uk-green-500'
            }
          />
          <p className="text-xs text-muted-foreground">
            {percentageUsed.toFixed(0)}% of monthly limit used
          </p>
        </div>

        {/* Warnings */}
        {isAtLimit && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've reached your monthly conversion limit. Upgrade to continue converting.
            </AlertDescription>
          </Alert>
        )}

        {isNearLimit && !isAtLimit && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You're approaching your monthly limit. Consider upgrading to avoid interruptions.
            </AlertDescription>
          </Alert>
        )}

        {/* Subscription Status */}
        {subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your subscription will be cancelled on{' '}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </AlertDescription>
          </Alert>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-2">
          {isFree || isNearLimit || isAtLimit ? (
            <Link href="/pricing" className="flex-1">
              <Button className="w-full bg-uk-blue-600 hover:bg-uk-blue-700">
                <Zap className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/billing" className="flex-1">
              <Button variant="outline" className="w-full">
                Manage Subscription
              </Button>
            </Link>
          )}

          {!isFree && (
            <Link href="/pricing">
              <Button variant="ghost" size="icon">
                <ArrowUpCircle className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
