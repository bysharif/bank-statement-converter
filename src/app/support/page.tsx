'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, HelpCircle, FileText, CreditCard, Shield, AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqs = [
    {
      category: 'Getting Started',
      icon: FileText,
      questions: [
        {
          q: 'How do I convert my first bank statement?',
          a: 'Simply sign up for a free account, log in, and upload your bank statement PDF. Select your desired output format (CSV, Excel, QIF, OFX, or JSON) and click Convert. Your converted file will be ready to download in seconds.'
        },
        {
          q: 'What file formats can I upload?',
          a: 'We currently support PDF bank statements from all major UK banks. The PDF should contain text (not scanned images) for best results. If you have scanned statements, our AI can still process them, but accuracy may vary.'
        },
        {
          q: 'Which output formats are available?',
          a: 'We support CSV, Excel (XLSX), QIF, OFX, and JSON formats. These are compatible with popular accounting software like QuickBooks, Xero, Sage, FreeAgent, and Microsoft Excel.'
        },
        {
          q: 'How long does conversion take?',
          a: 'Most conversions complete in under 10 seconds, regardless of the number of transactions. Large statements with thousands of transactions may take up to 30 seconds.'
        }
      ]
    },
    {
      category: 'Subscriptions & Billing',
      icon: CreditCard,
      questions: [
        {
          q: 'What are the differences between plans?',
          a: 'Free: 3 conversions/month. Starter (£9.99): 30 conversions/month. Professional (£19.99): 100 conversions/month. Business (£39.99): Unlimited conversions. All plans include the same features and accuracy.'
        },
        {
          q: 'Can I upgrade or downgrade my plan?',
          a: 'Yes! You can change your plan at any time through your account settings. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period.'
        },
        {
          q: 'When does my monthly limit reset?',
          a: 'Your conversion limit resets on the first day of each billing cycle. For example, if you subscribed on the 15th, your limit resets on the 15th of each month.'
        },
        {
          q: 'Do you offer refunds?',
          a: 'We do not offer refunds for partial months. However, you can cancel at any time and continue using paid features until the end of your billing period. We recommend starting with our free plan to test the service.'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express) processed securely through Stripe. We do not store your card information.'
        }
      ]
    },
    {
      category: 'Privacy & Security',
      icon: Shield,
      questions: [
        {
          q: 'Is my financial data secure?',
          a: 'Absolutely. Your bank statements are processed entirely in memory and never stored on our servers. All communications use TLS 1.3 encryption. Files are automatically deleted immediately after conversion.'
        },
        {
          q: 'Do you store my bank statements?',
          a: 'No. We do not store your bank statements or transaction data. Processing happens in memory, and all data is deleted immediately after conversion completes.'
        },
        {
          q: 'Can you see my account numbers?',
          a: 'While our system processes account numbers to accurately extract data, this information is never logged or stored. The converted output includes the account numbers as they appear in your original statement.'
        },
        {
          q: 'Are you GDPR compliant?',
          a: 'Yes, we are fully compliant with UK GDPR and data protection regulations. We minimize data collection, process data securely, and respect your privacy rights. See our Privacy Policy for details.'
        },
        {
          q: 'Who has access to my data?',
          a: 'Only you have access to your uploaded statements during the brief conversion process. Our automated systems process the files, and no human staff access your financial data.'
        }
      ]
    },
    {
      category: 'Troubleshooting',
      icon: AlertCircle,
      questions: [
        {
          q: 'Why is my conversion taking longer than usual?',
          a: 'Large statements with thousands of transactions may take slightly longer. If conversion exceeds 60 seconds, please refresh the page and try again. Check your internet connection.'
        },
        {
          q: 'The conversion failed. What should I do?',
          a: 'Try these steps: 1) Ensure your PDF is not password-protected, 2) Check that the PDF contains text (not just scanned images), 3) Verify your file is under 10MB, 4) Try again with a different browser. If issues persist, contact support.'
        },
        {
          q: 'Some transactions are missing in the output',
          a: 'This is rare but can happen with unusual statement formats. Please verify your original PDF is complete and contains all transactions. Contact support with your bank name and we\'ll improve our parser.'
        },
        {
          q: 'The dates or amounts are incorrectly parsed',
          a: 'Our AI achieves 99%+ accuracy, but occasional errors can occur. Always verify converted data before use. Report any consistent errors to support so we can improve our models.'
        },
        {
          q: 'My bank is not recognized',
          a: 'We support all major UK banks. If your bank isn\'t recognized, the system will still attempt conversion using generic parsing. Contact support with your bank name so we can add specific support.'
        }
      ]
    }
  ]

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  // Flatten all FAQs for search
  const allFaqs = faqs.flatMap((category, catIndex) =>
    category.questions.map((faq, qIndex) => ({
      ...faq,
      categoryName: category.category,
      categoryIcon: category.icon,
      index: catIndex * 100 + qIndex
    }))
  )

  const filteredFaqs = searchQuery
    ? allFaqs.filter(faq =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Back Button */}
        <Link href="/" className="inline-block mb-8">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Support Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions and get help with ConvertBank Statement Converter
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg w-full"
            />
          </div>
        </div>

        {/* Search Results */}
        {filteredFaqs && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Search Results ({filteredFaqs.length})
            </h2>
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No results found for "{searchQuery}"</p>
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <div
                    key={faq.index}
                    className="bg-white rounded-xl p-6 border border-gray-200 hover:border-uk-blue-300 transition-all"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <faq.categoryIcon className="h-5 w-5 text-uk-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs font-medium text-uk-blue-600 mb-1">{faq.categoryName}</p>
                        <h3 className="text-lg font-semibold text-gray-900">{faq.q}</h3>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed ml-8">{faq.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAQ Categories */}
        {!searchQuery && (
          <div className="space-y-8">
            {faqs.map((category, catIndex) => (
              <section key={catIndex}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-uk-blue-100 rounded-full p-2">
                    <category.icon className="h-6 w-6 text-uk-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
                </div>

                <div className="space-y-3">
                  {category.questions.map((faq, qIndex) => {
                    const faqIndex = catIndex * 100 + qIndex
                    const isExpanded = expandedFaq === faqIndex

                    return (
                      <div
                        key={qIndex}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-uk-blue-300 transition-all"
                      >
                        <button
                          onClick={() => toggleFaq(faqIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                          <svg
                            className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform ${
                              isExpanded ? 'transform rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isExpanded && (
                          <div className="px-6 pb-4 pt-2 text-gray-700 leading-relaxed border-t border-gray-100">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Quick Start Guide */}
        <section className="mt-16 bg-gradient-to-br from-uk-blue-50 to-uk-green-50 rounded-2xl p-8 border border-uk-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Start Guide</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-uk-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-sm text-gray-600">Create your free account in seconds</p>
            </div>
            <div className="text-center">
              <div className="bg-uk-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload PDF</h3>
              <p className="text-sm text-gray-600">Drag and drop your bank statement</p>
            </div>
            <div className="text-center">
              <div className="bg-uk-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Select Format</h3>
              <p className="text-sm text-gray-600">Choose CSV, Excel, QIF, OFX, or JSON</p>
            </div>
            <div className="text-center">
              <div className="bg-uk-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Download</h3>
              <p className="text-sm text-gray-600">Get your converted file instantly</p>
            </div>
          </div>
        </section>

        {/* Supported Banks */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Supported UK Banks</h2>
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                'HSBC', 'Barclays', 'Lloyds', 'NatWest',
                'Santander', 'Nationwide', 'TSB', 'RBS',
                'Halifax', 'First Direct', 'Metro Bank', 'Monzo',
                'Starling', 'Revolut', 'Virgin Money', 'Co-operative Bank'
              ].map((bank) => (
                <div key={bank} className="flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-uk-green-600 mr-2" />
                  <span className="text-gray-700 font-medium">{bank}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-600 mt-6 text-sm">
              And many more! If your bank isn't listed, we likely still support it. Try a conversion to see.
            </p>
          </div>
        </section>

        {/* Still Need Help */}
        <section className="mt-16 bg-white rounded-2xl p-8 border border-gray-200 text-center">
          <Mail className="h-12 w-12 text-uk-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Still Need Help?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help. We typically respond within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-uk-blue-600 hover:bg-uk-blue-700">
                Contact Support
              </Button>
            </Link>
            <a href="mailto:support@convertbank-statement.com">
              <Button size="lg" variant="outline">
                Email Us Directly
              </Button>
            </a>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/about" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              About Us
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/contact" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              Contact
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/security" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              Security
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/privacy" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
