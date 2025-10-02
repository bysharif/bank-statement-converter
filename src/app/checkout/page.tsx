'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navigation } from '@/components/landing/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, CreditCard, Shield, Lock } from 'lucide-react'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'professional'
  const email = searchParams.get('email') || ''

  const planDetails = {
    professional: {
      name: 'Professional',
      price: '£24',
      annual: '£288',
      description: 'Perfect for growing businesses',
      features: [
        '100 conversions per month',
        'All export formats (CSV, QIF, Excel)',
        'HMRC compliance',
        'API access',
        'Priority support'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      price: '£96',
      annual: '£1,152',
      description: 'For large organizations',
      features: [
        'Unlimited conversions',
        'Custom integrations',
        'White-label options',
        'Dedicated account manager',
        '24/7 phone support'
      ]
    }
  }

  const currentPlan = planDetails[plan as keyof typeof planDetails] || planDetails.professional

  const handleStripeCheckout = () => {
    // Mock Stripe checkout - in production this would redirect to actual Stripe
    alert(`Redirecting to Stripe checkout for ${currentPlan.name} plan...`)
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="bg-uk-blue-600 text-white mb-4">Secure Checkout</Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Subscription</h1>
            <p className="text-gray-600">You're just one step away from transforming your bank statement processing</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{currentPlan.name} Plan</h3>
                        <p className="text-sm text-gray-600">{currentPlan.description}</p>
                        {email && <p className="text-sm text-gray-500">Email: {email}</p>}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{currentPlan.price}</div>
                        <div className="text-sm text-gray-600">per month</div>
                        <div className="text-sm text-uk-blue-600">{currentPlan.annual} annually</div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">What's included:</h4>
                      <ul className="space-y-2">
                        {currentPlan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-uk-green-600" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total (Billed Annually)</span>
                        <span>{currentPlan.annual}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Save 17% with annual billing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-uk-green-50 border border-uk-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-uk-green-600" />
                  <span className="font-medium text-uk-green-900">Secure & Protected</span>
                </div>
                <p className="text-sm text-uk-green-800">
                  Your payment is secured with 256-bit SSL encryption. We never store your card details.
                </p>
              </div>
            </div>

            {/* Payment Section */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Mock Stripe Payment Form */}
                    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <div className="text-gray-600 mb-4">
                        <CreditCard className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-medium">Stripe Payment Form</p>
                        <p className="text-sm">Secure payment processing by Stripe</p>
                      </div>

                      <Button
                        onClick={handleStripeCheckout}
                        className="w-full bg-uk-blue-600 hover:bg-uk-blue-700 text-white py-3 text-lg"
                        size="lg"
                      >
                        Complete Payment - {currentPlan.annual}
                      </Button>
                    </div>

                    <div className="text-center space-y-3">
                      <p className="text-sm text-gray-600">
                        <strong>7-day free trial</strong> • Cancel anytime • No setup fees
                      </p>

                      <div className="flex justify-center gap-4 text-xs text-gray-500">
                        <span>Powered by Stripe</span>
                        <span>•</span>
                        <span>GDPR Compliant</span>
                        <span>•</span>
                        <span>PCI DSS Level 1</span>
                      </div>
                    </div>

                    {/* Money Back Guarantee */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">30-Day Money-Back Guarantee</h4>
                      <p className="text-sm text-gray-600">
                        Not satisfied? Get a full refund within 30 days, no questions asked.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 mb-4">Trusted by 1,200+ businesses across the UK</p>
            <div className="flex justify-center gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                GDPR Compliant
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                256-bit SSL
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                ISO 27001
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}