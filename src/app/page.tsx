import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { HeroSectionV3 } from '@/components/hero-section-v3'
import { HowItWorksNew } from '@/components/how-it-works-new'
import { TestimonialsSection } from '@/components/testimonials-section'
import { PricingSection } from '@/components/pricing-section'
import { BlogSection } from '@/components/blog-section'
import { CTASection } from '@/components/cta-section'

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