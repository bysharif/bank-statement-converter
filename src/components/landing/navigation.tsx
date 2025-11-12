'use client'

import { useState } from 'react'
import { Menu, X, ExternalLink, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import { SignupModal } from '@/components/shared/signup-modal'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleTryFree = () => {
    setIsModalOpen(true)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/70 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1">
            <div className="relative w-[60px] h-[60px]">
              <Image
                src="/logo.svg"
                alt="ConvertBank-Statement Logo"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              convertbank-statement.com
            </span>
          </Link>

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
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button
              className="bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 hover:from-uk-blue-700 hover:to-uk-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-6"
              asChild
            >
              <Link href="/auth/signup">
                Get Started Free
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

        {/* Mobile Navigation - Drawer Style */}
        {isMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div
              className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer menu */}
            <div className="md:hidden fixed top-16 right-0 bottom-0 w-[280px] max-w-[85vw] bg-white border-l border-gray-200 shadow-2xl z-[70] overflow-y-auto">
              <div className="flex flex-col space-y-1 py-6 px-4">
                {/* Navigation Links */}
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 justify-start rounded-lg text-base font-medium"
                  asChild
                >
                  <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>How it Works</a>
                </Button>
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 justify-start rounded-lg text-base font-medium"
                  asChild
                >
                  <a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a>
                </Button>
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 justify-start rounded-lg text-base font-medium"
                  asChild
                >
                  <a href="#testimonials" onClick={() => setIsMenuOpen(false)}>Testimonials</a>
                </Button>
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 justify-start rounded-lg text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                  asChild
                >
                  <Link href="/blog">Blog</Link>
                </Button>

                {/* CTA Section */}
                <div className="flex flex-col space-y-3 pt-6 mt-2 border-t border-gray-200">
                  <Button
                    className="bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 hover:from-uk-blue-700 hover:to-uk-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg w-full"
                    onClick={() => setIsMenuOpen(false)}
                    asChild
                  >
                    <Link href="/auth/signup">
                      Get Started Free
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-uk-blue-600 text-uk-blue-600 hover:bg-uk-blue-50 font-medium w-full"
                    onClick={() => setIsMenuOpen(false)}
                    asChild
                  >
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <SignupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planName="Free"
        planPrice="£0"
        planType="free"
      />
    </nav>
  )
}