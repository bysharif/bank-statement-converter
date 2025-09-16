'use client'

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function BenefitsSection() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            See measurable results in minutes, not hours
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our proven technology delivers exceptional results across all key metrics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold text-uk-blue-600 mb-2">95.8%</div>
            <div className="text-sm font-medium text-gray-500 mb-1">Average reduction</div>
            <div className="text-lg font-semibold text-gray-900">in manual effort</div>
          </div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold text-uk-blue-600 mb-2">4.2x</div>
            <div className="text-sm font-medium text-gray-500 mb-1">Median ROI over a 3-</div>
            <div className="text-lg font-semibold text-gray-900">month period</div>
          </div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold text-uk-blue-600 mb-2">5-8x</div>
            <div className="text-sm font-medium text-gray-500 mb-1">Faster setup time than</div>
            <div className="text-lg font-semibold text-gray-900">industry standards</div>
          </div>
        </div>

        <div className="text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to transform your workflow?
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Join thousands of businesses already saving hours on statement processing
            </p>
          </div>
          <Link href="/signup">
            <Button className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all group">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <div className="mt-4 text-sm text-gray-500">
            No credit card required • 30-day free trial • Cancel anytime
          </div>
        </div>
      </div>
    </section>
  )
}