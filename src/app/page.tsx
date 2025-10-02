import { Navigation } from '@/components/landing/navigation'
import { Footer } from '@/components/landing/footer'
import { HeroSectionV3 } from '@/components/landing/hero-section-v3'
import { HowItWorksNew } from '@/components/landing/how-it-works-new'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { BlogSection } from '@/components/landing/blog-section'
import { CTASection } from '@/components/landing/cta-section'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <HeroSectionV3 />

      {/* How It Works Section */}
      <HowItWorksNew />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Blog Section */}
      <BlogSection />

      {/* CTA Section */}
      <CTASection />

      <Footer />
    </div>
  )
}