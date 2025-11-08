import { Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PlanFeatures, formatPrice } from '@/types/subscription'
import Link from 'next/link'

interface PricingCardProps {
  plan: PlanFeatures
  paymentLink?: string
  isCurrentPlan?: boolean
}

export function PricingCard({ plan, paymentLink, isCurrentPlan = false }: PricingCardProps) {
  const isFree = plan.tier === 'free'

  return (
    <Card
      className={`relative flex flex-col ${
        plan.mostPopular
          ? 'border-uk-blue-600 border-2 shadow-lg scale-105'
          : ''
      }`}
    >
      {plan.mostPopular && (
        <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
          <div className="flex items-center gap-1 bg-uk-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            Most Popular
          </div>
        </div>
      )}

      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <div className="mt-4">
          <span className="text-5xl font-extrabold">
            {formatPrice(plan.price)}
          </span>
          {!isFree && <span className="text-muted-foreground">/month</span>}
        </div>
        <CardDescription className="mt-2">
          {plan.tier === 'starter' && 'Perfect for freelancers and small businesses getting started'}
          {plan.tier === 'professional' && 'For growing businesses with advanced needs'}
          {plan.tier === 'business' && 'Enterprise solution with API access and dedicated support'}
          {plan.tier === 'free' && 'Try out our basic features for free'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-uk-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        {isCurrentPlan ? (
          <Button
            className="w-full"
            variant="outline"
            disabled
          >
            Current Plan
          </Button>
        ) : isFree ? (
          <Link href="/auth/signup" className="w-full">
            <Button
              className="w-full bg-uk-blue-600 hover:bg-uk-blue-700"
            >
              Get Started Free
            </Button>
          </Link>
        ) : paymentLink ? (
          <a href={paymentLink} className="w-full" target="_blank" rel="noopener noreferrer">
            <Button
              className={`w-full ${
                plan.mostPopular
                  ? 'bg-uk-blue-600 hover:bg-uk-blue-700'
                  : ''
              }`}
              variant={plan.mostPopular ? 'default' : 'outline'}
            >
              Subscribe Now
            </Button>
          </a>
        ) : (
          <Button
            className="w-full"
            variant="outline"
            disabled
          >
            Coming Soon
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
