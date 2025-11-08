import { Metadata } from 'next'
import { PricingCard } from '@/components/pricing/PricingCard'
import { PricingComparison } from '@/components/pricing/PricingComparison'
import { PLAN_FEATURES } from '@/types/subscription'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata: Metadata = {
  title: 'Pricing | Bank Statement Converter',
  description:
    'Choose the perfect plan for your business. Convert bank statements to CSV, Excel, QuickBooks and more.',
}

export default function PricingPage() {
  const plans = [
    {
      ...PLAN_FEATURES.free,
      paymentLink: undefined,
    },
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

  const faqs = [
    {
      question: 'How do conversions work?',
      answer:
        'Each time you upload and convert a bank statement PDF, it counts as one conversion. Your monthly conversion limit resets at the start of each billing period.',
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer:
        'Yes! You can upgrade or downgrade at any time. When upgrading, you\'ll be charged a prorated amount for the remainder of your billing period. When downgrading, the change takes effect at the end of your current billing period.',
    },
    {
      question: 'What happens if I exceed my conversion limit?',
      answer:
        'If you reach your monthly conversion limit, you\'ll need to either wait until your next billing period or upgrade to a higher tier. We\'ll send you a warning when you\'ve used 80% of your limit.',
    },
    {
      question: 'Which export formats are supported?',
      answer:
        'All plans include CSV export. Starter and above get Excel export. Professional and Business tiers also include QuickBooks formats (QBO/QFX). Business tier includes JSON API export for custom integrations.',
    },
    {
      question: 'How long is my data retained?',
      answer:
        'Data retention varies by plan: Free (7 days), Starter (30 days), Professional (1 year), Business (2 years). After this period, your conversion history is automatically deleted.',
    },
    {
      question: 'Can I cancel at any time?',
      answer:
        'Yes, you can cancel your subscription at any time from your billing dashboard. You\'ll continue to have access to your plan features until the end of your current billing period.',
    },
    {
      question: 'Do you offer refunds?',
      answer:
        'We offer a 14-day money-back guarantee on all paid plans. If you\'re not satisfied, contact our support team for a full refund.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit and debit cards through Stripe, including Visa, Mastercard, and American Express. All payments are processed securely.',
    },
    {
      question: 'Is there a free trial?',
      answer:
        'Our Free plan allows you to try the service with up to 5 conversions per month at no cost. This lets you test the conversion quality before committing to a paid plan.',
    },
    {
      question: 'What kind of support do you offer?',
      answer:
        'Free and Starter plans include email support. Professional tier gets priority email support with faster response times. Business tier includes dedicated support with direct access to our team.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your business. All plans include secure
            processing and accurate conversions.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <PricingCard
              key={plan.tier}
              plan={plan}
              paymentLink={plan.paymentLink}
            />
          ))}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Compare All Features
          </h2>
          <PricingComparison />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t bg-uk-blue-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start with our free plan today. No credit card required.
          </p>
          <a
            href="/auth/signup"
            className="inline-block bg-uk-blue-600 hover:bg-uk-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Get Started Free
          </a>
        </div>
      </div>
    </div>
  )
}
