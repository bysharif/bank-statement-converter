'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Star, Users, Zap, Shield, Upload, Download, CheckCircle } from "lucide-react"
import Link from "next/link"

// Import bank data from carousel
const ukBanks = [
  { name: 'HSBC', logo: 'https://logo.clearbit.com/hsbc.com' },
  { name: 'Lloyds Banking Group', logo: 'https://logo.clearbit.com/lloydsbank.com' },
  { name: 'Barclays', logo: 'https://logo.clearbit.com/barclays.com' },
  { name: 'NatWest', logo: 'https://logo.clearbit.com/natwest.com' },
  { name: 'Santander UK', logo: 'https://logo.clearbit.com/santander.co.uk' },
  { name: 'Monzo', logo: 'https://logo.clearbit.com/monzo.com' },
  { name: 'Starling Bank', logo: 'https://logo.clearbit.com/starlingbank.com' },
  { name: 'Revolut', logo: 'https://logo.clearbit.com/revolut.com' },
]

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-uk-blue-600 to-uk-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-uk-green-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">convertbank-statement.com</span>
              <span className="text-xs text-gray-500">Convert Statements</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create your free account
            </h1>
            <p className="text-gray-600">
              Start converting your bank statements with 99.6% accuracy
            </p>
          </div>

          {/* Google Sign Up Button */}
          <Button
            className="w-full mb-6 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 py-3 text-base font-medium flex items-center justify-center gap-3 shadow-sm"
            size="lg"
            onClick={() => {
              // Mock Google OAuth - in production this would be real Google authentication
              window.location.href = '/dashboard'
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="text-center text-gray-500 mb-6">
            Or, register with your email
          </div>

          {/* Email Form */}
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault()
            // Mock signup - in production this would be real authentication
            window.location.href = '/dashboard'
          }}>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Work email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="(eg) shawn@company.com"
                className="mt-1 w-full"
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
                placeholder="Password"
                className="mt-1 w-full"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-uk-blue-600 hover:bg-uk-blue-700 text-white py-3 mt-6">
              Create free account
            </Button>
          </form>

          <p className="text-xs text-gray-500 mt-4 text-center">
            By signing up, you agree to BankConverter's{" "}
            <Link href="/terms" className="text-uk-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-uk-blue-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          {/* Trust Badges */}
          <div className="flex justify-center gap-2 mt-6">
            <Badge variant="security" className="text-xs">GDPR Compliant</Badge>
            <Badge variant="security" className="text-xs">ISO 27001</Badge>
            <Badge variant="security" className="text-xs">AICPA SOC</Badge>
          </div>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-uk-blue-600 hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Value Proposition */}
      <div className="flex-1 bg-gray-50 p-12 flex items-center justify-center">
        <div className="w-full max-w-lg">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-gray-500 mb-4">
              Trusted by 1200+ businesses across the UK
            </p>

            {/* Company Logos */}
            <div className="flex items-center justify-center gap-4 opacity-60 mb-12 flex-wrap">
              {ukBanks.slice(0, 8).map((bank) => (
                <div key={bank.name} className="h-10 w-20 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center p-2">
                  <img
                    src={bank.logo}
                    alt={`${bank.name} logo`}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<span class="text-xs font-medium text-gray-600">${bank.name.split(' ')[0]}</span>`;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-uk-blue-600 mb-2">95.8%</div>
              <div className="text-sm text-gray-600">Manual Effort Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-uk-blue-600 mb-2">4.2x</div>
              <div className="text-sm text-gray-600">ROI in 3 Months</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-uk-blue-600 mb-2">5-8x</div>
              <div className="text-sm text-gray-600">Faster Setup Time</div>
            </div>
          </div>

          {/* Key Features */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 text-center">Why Choose BankConverter?</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-uk-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-uk-blue-600" />
                </div>
                <div>
                  <span className="font-medium text-gray-900">10x faster processing</span>
                  <p className="text-sm text-gray-600">Convert statements in seconds, not hours</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-uk-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-uk-green-600" />
                </div>
                <div>
                  <span className="font-medium text-gray-900">Bank-grade security</span>
                  <p className="text-sm text-gray-600">Your data is encrypted and never stored</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-uk-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-uk-blue-600" />
                </div>
                <div>
                  <span className="font-medium text-gray-900">Multiple export formats</span>
                  <p className="text-sm text-gray-600">CSV, QIF, Excel - ready for any software</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-uk-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-uk-green-600" />
                </div>
                <div>
                  <span className="font-medium text-gray-900">99.6% accuracy rate</span>
                  <p className="text-sm text-gray-600">AI-powered precision for every transaction</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-uk-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-uk-blue-600" />
                </div>
                <div>
                  <span className="font-medium text-gray-900">All UK bank support</span>
                  <p className="text-sm text-gray-600">Works with 30+ major UK banks</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-uk-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-uk-green-600" />
                </div>
                <div>
                  <span className="font-medium text-gray-900">GDPR compliant</span>
                  <p className="text-sm text-gray-600">Full compliance with UK data protection</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}