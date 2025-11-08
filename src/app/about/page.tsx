import Link from 'next/link'
import { ArrowLeft, Target, Shield, Zap, Users, TrendingUp, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
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
        <div className="mb-16 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            About ConvertBank
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transforming bank statement processing for UK businesses and finance professionals
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-uk-blue-50 to-uk-green-50 rounded-2xl p-8 lg:p-12 border border-uk-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-uk-blue-600 rounded-full p-3">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 mb-4">
              ConvertBank Statement Converter was created to solve a common problem faced by finance professionals, accountants, and business owners: the time-consuming and error-prone process of manually converting bank statements into usable formats.
            </p>
            <p className="text-lg text-gray-700">
              We believe that financial data processing should be fast, accurate, and accessible to everyone. Our AI-powered platform eliminates hours of manual work, reduces errors, and gives you more time to focus on what matters most - growing your business and making informed financial decisions.
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What We Do</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-uk-blue-300 hover:shadow-lg transition-all">
              <div className="bg-uk-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-uk-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning-Fast Conversion</h3>
              <p className="text-gray-700">
                Process thousands of transactions in seconds using advanced AI and machine learning. What used to take hours now takes just moments.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-uk-blue-300 hover:shadow-lg transition-all">
              <div className="bg-uk-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-uk-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">99%+ Accuracy</h3>
              <p className="text-gray-700">
                Our AI-powered parser achieves industry-leading accuracy, catching errors that manual processes often miss and ensuring your data is reliable.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-uk-blue-300 hover:shadow-lg transition-all">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">UK Bank Support</h3>
              <p className="text-gray-700">
                Comprehensive support for all major UK banks and financial institutions including HSBC, Barclays, Lloyds, NatWest, Santander, and many more.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-uk-blue-300 hover:shadow-lg transition-all">
              <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Bank-Grade Security</h3>
              <p className="text-gray-700">
                Your statements are never stored. All processing happens in memory with encryption, and files are immediately deleted after conversion.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Finance Teams Choose Us</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-uk-blue-100 flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-uk-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Multiple Format Support</h3>
                  <p className="text-gray-600 text-sm">CSV, Excel, QIF, OFX, JSON - compatible with all major accounting software</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-uk-blue-100 flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-uk-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Instant Processing</h3>
                  <p className="text-gray-600 text-sm">No queues, no waiting. Upload and download in seconds</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-uk-blue-100 flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-uk-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">GDPR Compliant</h3>
                  <p className="text-gray-600 text-sm">Fully compliant with UK and EU data protection regulations</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-uk-blue-100 flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-uk-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">No Software Installation</h3>
                  <p className="text-gray-600 text-sm">Works directly in your browser - no downloads required</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-uk-blue-100 flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-uk-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Flexible Pricing</h3>
                  <p className="text-gray-600 text-sm">From free to unlimited - plans that grow with your business</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-uk-blue-100 flex items-center justify-center mt-1">
                  <svg className="w-4 h-4 text-uk-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Dedicated Support</h3>
                  <p className="text-gray-600 text-sm">Responsive customer support to help you succeed</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who We Serve */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Who We Serve</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-uk-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-uk-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Accountants</h3>
              <p className="text-gray-600">
                Streamline client onboarding and month-end close with automated statement processing
              </p>
            </div>

            <div className="text-center">
              <div className="bg-uk-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-uk-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Owners</h3>
              <p className="text-gray-600">
                Manage your finances efficiently without hiring additional bookkeeping staff
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Finance Teams</h3>
              <p className="text-gray-600">
                Reduce errors, save time, and improve accuracy in financial reporting
              </p>
            </div>
          </div>
        </section>

        {/* Our Commitment */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 lg:p-12 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Commitment to You</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-uk-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Privacy First</h3>
                  <p className="text-gray-700">Your financial data is never stored, never shared, and always protected with bank-grade encryption.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="h-6 w-6 text-uk-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Continuous Improvement</h3>
                  <p className="text-gray-700">We constantly update our AI models to improve accuracy and support new bank formats.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-uk-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Customer Success</h3>
                  <p className="text-gray-700">Your success is our success. We provide responsive support and actively listen to your feedback.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="h-6 w-6 text-uk-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Innovation</h3>
                  <p className="text-gray-700">We leverage cutting-edge AI technology to deliver the fastest and most accurate conversions.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 rounded-2xl p-8 lg:p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Workflow?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of finance professionals who save hours every month
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-uk-blue-600 hover:bg-gray-100">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-uk-blue-700">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/contact" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              Contact Us
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/support" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              Support
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/privacy" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              Privacy Policy
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/terms" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
