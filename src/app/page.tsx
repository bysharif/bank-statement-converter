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
      <BlogSection
        posts={[
          {
            id: "post-1",
            title: "How to Convert Bank Statements for HMRC Digital Tax Returns",
            summary: "Learn the essential steps to prepare your bank statements for Making Tax Digital compliance, including format requirements and common pitfalls to avoid.",
            label: "Tax Compliance",
            author: "Sarah Mitchell",
            published: "15 Mar 2024",
            url: "/blog/hmrc-digital-tax-returns-bank-statements",
            image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop&crop=center",
            tags: ["Tax Compliance", "HMRC"],
          },
          {
            id: "post-2",
            title: "Why AI-Powered Bank Statement Conversion Beats Manual Processing",
            summary: "Discover how purpose-built AI delivers 99.6% accuracy compared to manual data entry, saving businesses hours of work and reducing costly errors.",
            label: "Automation",
            author: "James Thompson",
            published: "22 Mar 2024",
            url: "/blog/ai-powered-bank-statement-conversion",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&crop=center",
            tags: ["Automation", "AI Technology"],
          },
        ]}
      />

      {/* CTA Section */}
      <CTASection />

      <Footer />
    </div>
  )
}