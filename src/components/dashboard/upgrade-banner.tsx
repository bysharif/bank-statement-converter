'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Zap, X, AlertTriangle } from 'lucide-react'
import { useDashboardRefresh } from '@/context/DashboardRefreshContext'

interface UsageData {
  subscription: {
    tier: string
  }
  usage: {
    conversionsUsed: number
    conversionsLimit: number
    percentageUsed: number
  }
}

export function UpgradeBanner() {
  const router = useRouter()
  const { refreshKey } = useDashboardRefresh()
  const [data, setData] = useState<UsageData | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsage() {
      try {
        setLoading(true)
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
  }, [refreshKey])

  // Don't show if loading, dismissed, or no data
  if (loading || isDismissed || !data) return null

  const { subscription, usage } = data
  const percentageUsed = usage.percentageUsed
  const isNearLimit = percentageUsed >= 80 && percentageUsed < 100
  const isAtLimit = percentageUsed >= 100
  const isFree = subscription.tier === 'free'

  // Only show banner if near limit, at limit, or free user with 60%+ usage
  const shouldShow = isAtLimit || isNearLimit || (isFree && percentageUsed >= 60)
  
  if (!shouldShow) return null

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  // Different banner styles based on urgency
  const getBannerStyle = () => {
    if (isAtLimit) {
      return 'bg-gradient-to-r from-red-600 to-red-700 text-white'
    }
    if (isNearLimit) {
      return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
    }
    return 'bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 text-white'
  }

  const getMessage = () => {
    if (isAtLimit) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        text: `You've reached your monthly limit (${usage.conversionsUsed}/${usage.conversionsLimit}). Upgrade now to continue converting.`,
        buttonText: 'Upgrade Now',
      }
    }
    if (isNearLimit) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        text: `You're running low on conversions (${usage.conversionsUsed}/${usage.conversionsLimit} used). Upgrade to avoid interruptions.`,
        buttonText: 'Upgrade Plan',
      }
    }
    return {
      icon: <Zap className="h-4 w-4" />,
      text: `Unlock unlimited conversions with Pro! Get 150 conversions/month, all export formats & priority support.`,
      buttonText: 'Upgrade to Pro',
    }
  }

  const message = getMessage()

  return (
    <div className={`relative py-2.5 px-4 ${getBannerStyle()}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="flex-shrink-0">{message.icon}</span>
          <p className="text-sm font-medium truncate">
            {message.text}
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={handleUpgrade}
            size="sm"
            variant="secondary"
            className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-sm"
          >
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            {message.buttonText}
          </Button>
          
          {!isAtLimit && (
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

