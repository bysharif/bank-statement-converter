'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Zap, ArrowRight } from 'lucide-react'
import { PLAN_FEATURES, formatPrice } from '@/types/subscription'

export function PricingSection() {
  const plans = [
    {
      ...PLAN_FEATURES.free,
      paymentLink: undefined,
      buttonText: 'Get Started Free',
      buttonVariant: 'default' as const,
    },
    {
      ...PLAN_FEATURES.starter,
      paymentLink: process.env.NEXT_PUBLIC_STRIPE_STARTER_PAYMENT_LINK,
      buttonText: 'Subscribe Now',
      buttonVariant: 'default' as const,
    },
    {
      ...PLAN_FEATURES.professional,
      paymentLink: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PAYMENT_LINK,
      buttonText: 'Subscribe Now',
      buttonVariant: 'default' as const,
    },
    {
      ...PLAN_FEATURES.business,
      paymentLink: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PAYMENT_LINK,
      buttonText: 'Subscribe Now',
      buttonVariant: 'default' as const,
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-uk-blue-50 to-uk-green-50 rounded-full border border-uk-blue-100 mb-6">
            <svg className="w-4 h-4 text-uk-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="text-sm font-semibold text-uk-blue-700">Simple Pricing</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Choose your plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free, upgrade when you need more conversions
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => {
            const isFree = plan.tier === 'free'
            const isPopular = plan.mostPopular

            return (
              <div
                key={plan.tier}
                className={`relative rounded-2xl p-8 transition-all duration-300 ${
                  isPopular
                    ? 'bg-white border-2 border-uk-blue-600 shadow-xl scale-105 z-10'
                    : 'bg-white border border-gray-200 hover:border-uk-blue-300 hover:shadow-lg'
                }`}
              >
                {/* Most Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-fit">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      <Zap className="h-4 w-4 fill-white" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(plan.price)}
                    </span>
                    {!isFree && (
                      <span className="text-sm text-gray-600">/month</span>
                    )}
                  </div>
                  {!isFree && (
                    <p className="text-sm text-gray-500 mt-2">
                      Billed monthly
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <div className="mb-8">
                  {isFree ? (
                    <Link href="/auth/signup" className="block w-full">
                      <Button
                        className="w-full py-6 text-base font-semibold"
                        variant={plan.buttonVariant}
                      >
                        {plan.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : plan.paymentLink ? (
                    <a
                      href={plan.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button
                        className="w-full py-6 text-base font-semibold"
                        variant={plan.buttonVariant}
                      >
                        {plan.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  ) : (
                    <Button
                      className="w-full py-6 text-base font-semibold"
                      variant="outline"
                      disabled
                    >
                      Coming Soon
                    </Button>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className={`h-5 w-5 ${
                          isPopular ? 'text-uk-blue-600' : 'text-uk-green-500'
                        }`} />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* See Full Comparison Link */}
        <div className="text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-uk-blue-600 hover:text-uk-blue-700 font-semibold transition-colors"
          >
            See full feature comparison
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
