'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, Clock, Zap, Shield } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-20 bg-white relative">
      <div className="container mx-auto px-4">
        {/* Top Stats Bar */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-uk-blue-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-uk-blue-600" />
            </div>
            <span className="text-gray-600 text-sm font-medium">&gt;1.2K Statements processed</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-uk-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-uk-blue-600" />
            </div>
            <span className="text-gray-600 text-sm font-medium">95% Time savings</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-uk-blue-100 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-uk-blue-600" />
            </div>
            <span className="text-gray-600 text-sm font-medium">10x Productivity increase</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-uk-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-uk-blue-600" />
            </div>
            <span className="text-gray-600 text-sm font-medium">GDPR Compliant</span>
          </div>
        </div>

        {/* CTA Card that overlaps with footer */}
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-100 p-12 max-w-6xl mx-auto mb-[-120px]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-uk-blue-50 to-uk-green-50 rounded-full border border-uk-blue-100 mb-4">
              <svg className="w-4 h-4 text-uk-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-semibold text-uk-blue-700">Get in Touch</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">
              Have more questions?
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Contact Form */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Send in a query</h3>
              <form className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Your work email*"
                    className="w-full p-4 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="w-20">
                    <Input
                      type="text"
                      placeholder="+1"
                      className="w-full p-4 border border-gray-300 rounded-lg text-center"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="tel"
                      placeholder="Contact number"
                      className="w-full p-4 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <textarea
                    placeholder="How can we help you?*"
                    rows={4}
                    className="w-full p-4 border border-gray-300 rounded-lg resize-none"
                  />
                </div>
                <Button className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-8 py-3 rounded-lg font-medium">
                  Submit Query →
                </Button>
              </form>
            </div>

            {/* Right Side - Demo CTA */}
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Talk to an AI expert</h3>
              <p className="text-gray-600 mb-6">
                Get a free 15-minute consultation with our Conversion experts. We can discuss
                Pricing, Integrations or try the app live on your own bank statements.
              </p>
              <Button className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-3">
                Request a Demo
                <div className="flex -space-x-2">
                  <img
                    src="/testimonial-james.jpg"
                    alt="Expert 1"
                    className="w-6 h-6 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="/testimonial-anna.jpg"
                    alt="Expert 2"
                    className="w-6 h-6 rounded-full border-2 border-white object-cover"
                  />
                  <img
                    src="/testimonial-emeka.jpg"
                    alt="Expert 3"
                    className="w-6 h-6 rounded-full border-2 border-white object-cover"
                  />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}