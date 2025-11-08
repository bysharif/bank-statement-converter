'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, MessageSquare, Send, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // TODO: Implement actual form submission
      // For now, simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500))

      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
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
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Information Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email Card */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-uk-blue-300 hover:shadow-lg transition-all">
              <div className="bg-uk-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-uk-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600 text-sm mb-3">
                For general inquiries and support
              </p>
              <a
                href="mailto:support@convertbank-statement.com"
                className="text-uk-blue-600 hover:text-uk-blue-700 font-medium text-sm hover:underline"
              >
                support@convertbank-statement.com
              </a>
            </div>

            {/* Sales Card */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-uk-blue-300 hover:shadow-lg transition-all">
              <div className="bg-uk-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-uk-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Inquiries</h3>
              <p className="text-gray-600 text-sm mb-3">
                For enterprise and custom solutions
              </p>
              <a
                href="mailto:sales@convertbank-statement.com"
                className="text-uk-blue-600 hover:text-uk-blue-700 font-medium text-sm hover:underline"
              >
                sales@convertbank-statement.com
              </a>
            </div>

            {/* Response Time Card */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Response Time</h3>
              <p className="text-gray-600 text-sm">
                We typically respond within 24 hours during business days (Monday-Friday, 9am-6pm GMT)
              </p>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600 text-sm">
                United Kingdom<br />
                Serving UK businesses nationwide
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    Thank you for your message! We'll get back to you soon.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">
                    Something went wrong. Please try again or email us directly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full"
                  />
                </div>

                {/* Subject Input */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    className="w-full"
                  />
                </div>

                {/* Message Textarea */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    className="w-full min-h-[150px]"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-uk-blue-600 hover:bg-uk-blue-700 text-white py-6 text-base font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-sm text-gray-600 text-center">
                By submitting this form, you agree to our{' '}
                <Link href="/privacy" className="text-uk-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What are your support hours?</h3>
              <p className="text-gray-600">
                Our support team is available Monday to Friday, 9am-6pm GMT. We typically respond to all inquiries within 24 hours.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer phone support?</h3>
              <p className="text-gray-600">
                Currently, we provide support via email for the best tracking and documentation. Business plan customers can request priority email support.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I schedule a demo?</h3>
              <p className="text-gray-600">
                Yes! Email sales@convertbank-statement.com to schedule a personalized demo of our platform and discuss your specific needs.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I report a bug or issue?</h3>
              <p className="text-gray-600">
                Please email support@convertbank-statement.com with details about the issue, including screenshots if possible. We'll investigate and respond promptly.
              </p>
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="bg-gradient-to-br from-uk-blue-50 to-uk-green-50 rounded-2xl p-8 border border-uk-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Looking for Something Else?</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/support">
              <Button variant="outline">Visit Support Center</Button>
            </Link>
            <Link href="/about">
              <Button variant="outline">Learn About Us</Button>
            </Link>
            <Link href="/security">
              <Button variant="outline">Security Information</Button>
            </Link>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/about" className="text-uk-blue-600 hover:text-uk-blue-700 hover:underline">
              About Us
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
