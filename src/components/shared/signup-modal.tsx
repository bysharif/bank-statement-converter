'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, FileText, Users, Shield } from "lucide-react"

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  planName?: string
  planPrice?: string
  planType?: 'free' | 'professional' | 'enterprise'
}

export function SignupModal({ isOpen, onClose, planName = "Free", planPrice = "£0", planType = "free" }: SignupModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock signup process
    setTimeout(() => {
      if (planType === 'free') {
        // Redirect to dashboard for free plan
        window.location.href = '/dashboard'
      } else {
        // Redirect to Stripe checkout for paid plans
        // In production, this would integrate with actual Stripe
        window.location.href = `/checkout?plan=${planType}&email=${encodeURIComponent(email)}`
      }
      setIsLoading(false)
    }, 2000)
  }

  const handleGoogleSignup = () => {
    // Mock Google OAuth
    if (planType === 'free') {
      window.location.href = '/dashboard'
    } else {
      window.location.href = `/checkout?plan=${planType}`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 bg-gray-50">
        <div className="flex min-h-[600px] flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2 self-center font-medium">
              <div className="bg-uk-blue-600 text-white flex size-8 items-center justify-center rounded-lg shadow-lg">
                <FileText className="size-4" />
              </div>
              <span className="text-lg font-semibold text-gray-900">convert-bankstatement.com</span>
            </div>

            {/* Plan Badge */}
            {planType !== 'free' && (
              <div className="text-center">
                <Badge className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-4 py-2">
                  {planName} Plan - {planPrice}
                </Badge>
              </div>
            )}

            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {planType === 'free' ? 'Start converting for free' : `Get started with ${planName}`}
              </h2>
              <p className="text-gray-600 text-sm">
                {planType === 'free'
                  ? 'Convert 5 bank statements per month with 99.6% accuracy'
                  : `Unlock unlimited conversions with ${planName} features`
                }
              </p>
            </div>

            {/* Google Signup */}
            <Button
              onClick={handleGoogleSignup}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 py-3 text-base font-medium flex items-center justify-center gap-3 shadow-sm"
              size="lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="text-center text-gray-500 text-sm">
              Or, sign up with your email
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Work email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="(eg) you@company.com"
                  className="mt-1 w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className="mt-1 w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-uk-blue-600 hover:bg-uk-blue-700 text-white py-3 mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' :
                 planType === 'free' ? 'Create free account' : `Start ${planName} trial`}
              </Button>
            </form>

            {/* Trust Badge */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
                <Users className="w-4 h-4" />
                <span>Trusted by 1,200+ UK businesses</span>
              </div>
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="text-xs">GDPR Compliant</Badge>
                <Badge variant="outline" className="text-xs">ISO 27001</Badge>
                <Badge variant="outline" className="text-xs">AICPA SOC</Badge>
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              By signing up, you agree to our{" "}
              <a href="/terms" className="text-uk-blue-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-uk-blue-600 hover:underline">
                Privacy Policy
              </a>
              .
            </p>

            {/* Login Link */}
            <p className="text-sm text-gray-600 text-center">
              Already have an account?{" "}
              <button
                onClick={onClose}
                className="text-uk-blue-600 hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}