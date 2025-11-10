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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/90 backdrop-blur-xl">
            <div className="flex flex-col space-y-1 py-4">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 justify-end rounded-lg" asChild>
                <a href="#how-it-works">How it Works</a>
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 justify-end rounded-lg" asChild>
                <a href="#pricing">Pricing</a>
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 justify-end rounded-lg" asChild>
                <a href="#testimonials">Testimonials</a>
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 justify-end rounded-lg" asChild>
                <Link href="/blog">Blog</Link>
              </Button>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                <Button className="bg-[#1E40AF] hover:bg-[#1a3a9f] text-white justify-end w-full" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button
                  onClick={handleTryFree}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 justify-end w-full"
                >
                  Learn more
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
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