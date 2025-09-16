'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { SignupModal } from '@/components/signup-modal'

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string
    price: string
    type: 'free' | 'professional' | 'enterprise'
  }>({ name: 'Free', price: '£0', type: 'free' })

  const handlePlanSelect = (planName: string, planPrice: string, planType: 'free' | 'professional' | 'enterprise') => {
    setSelectedPlan({ name: planName, price: planPrice, type: planType })
    setIsModalOpen(true)
  }

  return (
    <section id="pricing" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-uk-blue-50 to-uk-green-50 rounded-full border border-uk-blue-100 mb-4">
            <svg className="w-4 h-4 text-uk-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="text-xs font-semibold text-uk-blue-700">Simple Pricing</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">
            Choose your plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto whitespace-nowrap mb-8">
            Start free, upgrade when you need more conversions
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Billed monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isAnnual ? 'bg-uk-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Billed annually
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Free Plan */}
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Free</h3>
            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900">£0</div>
              {isAnnual && (
                <div className="text-sm text-gray-500">Yes, completely free</div>
              )}
            </div>

            <Button
              onClick={() => handlePlanSelect('Free', '£0', 'free')}
              className="w-full mb-8 bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              Get started
            </Button>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                <span className="text-sm text-gray-700">5 conversions per month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                <span className="text-sm text-gray-700">All UK banks</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                <span className="text-sm text-gray-700">CSV exports</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                <span className="text-sm text-gray-700">Email support</span>
              </li>
            </ul>
          </div>

          {/* Professional Plan */}
          <div className="bg-white border-2 border-uk-blue-600 rounded-lg p-8 relative">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Professional</h3>
            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900">
                £{isAnnual ? '24' : '29'} <span className="text-lg text-gray-600">per month</span>
              </div>
              {isAnnual && (
                <div className="text-sm text-gray-500">£288 per annum</div>
              )}
            </div>

            <Button
              onClick={() => handlePlanSelect('Professional', isAnnual ? '£24' : '£29', 'professional')}
              className="w-full mb-8 bg-uk-blue-600 text-white hover:bg-uk-blue-700"
            >
              7 day free trial
            </Button>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                <span className="text-sm text-gray-700">All free plan features and...</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                <span className="text-sm text-gray-700">100 conversions per month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                <span className="text-sm text-gray-700">All export formats (CSV, QIF, Excel)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                <span className="text-sm text-gray-700">HMRC compliance</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                <span className="text-sm text-gray-700">API access</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                <span className="text-sm text-gray-700">Priority support</span>
              </li>
            </ul>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Enterprise</h3>
            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900">
                £{isAnnual ? '96' : '120'} <span className="text-lg text-gray-600">per month</span>
              </div>
              {isAnnual && (
                <div className="text-sm text-gray-500">£1,152 per annum</div>
              )}
            </div>

            <Button
              onClick={() => handlePlanSelect('Enterprise', isAnnual ? '£96' : '£120', 'enterprise')}
              className="w-full mb-8 bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              Get started
            </Button>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                <span className="text-sm text-gray-700">All free plan features and...</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                <span className="text-sm text-gray-700">Unlimited conversions</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                <span className="text-sm text-gray-700">Custom integrations</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                <span className="text-sm text-gray-700">White-label options</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                <span className="text-sm text-gray-700">Dedicated account manager</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-4 h-4 text-gray-900 mt-0.5" />
                <span className="text-sm text-gray-700">24/7 phone support</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <SignupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planName={selectedPlan.name}
        planPrice={selectedPlan.price}
        planType={selectedPlan.type}
      />
    </section>
  )
}