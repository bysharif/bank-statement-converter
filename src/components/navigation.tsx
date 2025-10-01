'use client'

import { useState } from 'react'
import { Menu, X, ExternalLink, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/70 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-uk-blue-600 to-uk-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-uk-green-500 rounded-full flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              convert-bankstatement.com
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-4 py-2 font-medium" asChild>
              <a href="#how-it-works">How it Works</a>
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-4 py-2 font-medium" asChild>
              <a href="#pricing">Pricing</a>
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-4 py-2 font-medium" asChild>
              <a href="#testimonials">Testimonials</a>
            </Button>
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-4 py-2 font-medium" asChild>
              <Link href="/blog">Blog</Link>
            </Button>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button
              className="bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 hover:from-uk-blue-700 hover:to-uk-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-6"
              asChild
            >
              <Link href="/dashboard">
                Try Free
                <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/90 backdrop-blur-xl">
            <div className="flex flex-col space-y-1 py-4">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 justify-start rounded-lg" asChild>
                <a href="#how-it-works">How it Works</a>
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 justify-start rounded-lg" asChild>
                <a href="#pricing">Pricing</a>
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 justify-start rounded-lg" asChild>
                <a href="#testimonials">Testimonials</a>
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 justify-start rounded-lg" asChild>
                <Link href="/blog">Blog</Link>
              </Button>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900 justify-start" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button
                  className="bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 hover:from-uk-blue-700 hover:to-uk-blue-800 text-white justify-start w-full"
                  asChild
                >
                  <Link href="/dashboard">
                    Try Free
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}