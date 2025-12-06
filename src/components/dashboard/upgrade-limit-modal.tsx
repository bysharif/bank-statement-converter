'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, CheckCircle2, ArrowRight, Crown } from 'lucide-react'

interface UpgradeLimitModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan?: string
  conversionsUsed?: number
  conversionsLimit?: number
}

export function UpgradeLimitModal({
  isOpen,
  onClose,
  currentPlan = 'Free',
  conversionsUsed = 5,
  conversionsLimit = 5,
}: UpgradeLimitModalProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    onClose()
    router.push('/pricing')
  }

  const proFeatures = [
    '150 conversions per month',
    'All export formats (CSV, Excel, QBO, QFX)',
    'Priority email support',
    '1-year data retention',
    'QuickBooks/Xero integration',
    'Transaction categorization',
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
            <Crown className="h-8 w-8 text-amber-600" />
          </div>
          <DialogTitle className="text-xl font-bold">
            Monthly Limit Reached
          </DialogTitle>
          <DialogDescription className="text-base">
            You've used all {conversionsLimit} conversions on your {currentPlan} plan this month.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Usage indicator */}
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-800">Conversions Used</span>
              <Badge variant="destructive">{conversionsUsed}/{conversionsLimit}</Badge>
            </div>
            <div className="w-full bg-red-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full w-full"></div>
            </div>
          </div>

          {/* Pro features */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
              <Zap className="h-4 w-4 text-uk-blue-600" />
              Upgrade to Professional for:
            </h4>
            <ul className="space-y-2">
              {proFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 hover:from-uk-blue-700 hover:to-uk-blue-800 text-white font-semibold"
            size="lg"
          >
            <Zap className="mr-2 h-4 w-4" />
            Upgrade to Pro - £19.99/month
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full text-gray-500"
          >
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

