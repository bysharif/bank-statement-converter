'use client'

import { FileText, Upload, Shield, Zap, Download, CheckCircle, ArrowRight } from "lucide-react"
import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BankCarousel } from "./bank-carousel"

export function HeroSectionV3Original() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      setUploadedFile(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setUploadedFile(files[0])
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] opacity-50" />

      <div className="relative container mx-auto px-4 pt-4 pb-8 lg:pt-6 lg:pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh] lg:min-h-[85vh]">

          {/* Left Side - Content */}
          <div className="space-y-5">
            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-uk-blue-50 to-uk-green-50 rounded-full border border-uk-blue-100">
              <FileText className="w-4 h-4 text-uk-blue-600" />
              <span className="text-sm font-semibold text-uk-blue-700">Instant Bank Statement Conversion</span>
              <Badge variant="secondary" className="bg-uk-green-100 text-uk-green-700 text-xs">
                99.6% Accurate
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Increase{" "}
                <span className="text-uk-blue-600 relative">
                  accuracy
                  {/* Target design element - 50x larger */}
                  <div className="absolute -inset-96 pointer-events-none opacity-5 overflow-hidden">
                    <svg viewBox="0 0 120 120" className="w-full h-full text-gray-400">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="1"/>
                      <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                      <circle cx="60" cy="60" r="20" fill="none" stroke="currentColor" strokeWidth="0.6"/>
                      <circle cx="60" cy="60" r="8" fill="currentColor"/>
                    </svg>
                  </div>
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-uk-blue-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,8 Q50,0 100,8" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </span>
                ,<br />
                not effort.
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Transform your bank statements to CSV, QIF, or Excel in seconds.
                Our AI-powered converter works with all major UK banks with 99.9% accuracy.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-4 h-4 text-uk-green-500" />
                <span>30-day free trial</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-4 h-4 text-uk-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-4 h-4 text-uk-green-500" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="security" className="text-xs">AICPA SOC</Badge>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-8 py-3 text-base font-medium rounded-md shadow-sm hover:shadow-md transition-all group w-full sm:w-auto">
                  Try for Free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" className="px-8 py-3 text-base font-medium rounded-md border-gray-300 hover:bg-gray-50 w-full sm:w-auto">
                Learn More
              </Button>
            </div>

            {/* Testimonials - Moved under buttons */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                    JS
                  </div>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                    AM
                  </div>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                    RK
                  </div>
                </div>
                <span className="text-sm text-gray-600">
                  Trusted by <span className="text-uk-blue-600 font-medium">1200+</span> businesses across UK
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Interactive Upload */}
          <div className="relative">
            <Card className="relative bg-white shadow-2xl border-0 overflow-hidden">
              <CardContent className="p-8">
                {/* Upload Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-uk-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {uploadedFile ? (
                      <CheckCircle className="w-8 h-8 text-uk-green-600" />
                    ) : (
                      <Upload className="w-8 h-8 text-uk-blue-600" />
                    )}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {uploadedFile ? 'File Ready!' : 'Upload Bank Statement'}
                  </h3>
                  <p className="text-gray-600">
                    {uploadedFile ? 'Click below to start processing' : 'Drag & drop or click to browse'}
                  </p>
                </div>

                {/* Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    isDragOver
                      ? 'border-uk-blue-400 bg-uk-blue-50'
                      : uploadedFile
                      ? 'border-uk-green-300 bg-uk-green-50'
                      : 'border-gray-300 bg-gray-50 hover:border-uk-blue-300 hover:bg-uk-blue-50/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.csv,.xlsx,.xls"
                    onChange={handleFileChange}
                  />

                  {uploadedFile ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-6 h-6 text-uk-green-600" />
                        <span className="font-medium text-gray-900">{uploadedFile.name}</span>
                      </div>
                      <Button className="bg-uk-green-600 hover:bg-uk-green-700 text-white">
                        Process File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-gray-600">
                        <p className="font-medium mb-2">Drop your statement here</p>
                        <p className="text-sm">PDF, CSV, Excel supported</p>
                      </div>
                      <div className="flex justify-center gap-2">
                        <Badge variant="outline" className="text-xs">PDF</Badge>
                        <Badge variant="outline" className="text-xs">CSV</Badge>
                        <Badge variant="outline" className="text-xs">Excel</Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Benefits Grid - 6 items */}
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-uk-blue-100 rounded-full flex items-center justify-center">
                      <Zap className="w-3 h-3 text-uk-blue-600" />
                    </div>
                    <span className="text-gray-700">10x faster processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-uk-green-100 rounded-full flex items-center justify-center">
                      <Shield className="w-3 h-3 text-uk-green-600" />
                    </div>
                    <span className="text-gray-700">Bank-grade security</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-uk-blue-100 rounded-full flex items-center justify-center">
                      <Download className="w-3 h-3 text-uk-blue-600" />
                    </div>
                    <span className="text-gray-700">CSV, QIF, Excel export</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-uk-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-uk-green-600" />
                    </div>
                    <span className="text-gray-700">99.6% accuracy rate</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-uk-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-3 h-3 text-uk-blue-600" />
                    </div>
                    <span className="text-gray-700">All UK bank formats</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-uk-green-100 rounded-full flex items-center justify-center">
                      <Shield className="w-3 h-3 text-uk-green-600" />
                    </div>
                    <span className="text-gray-700">GDPR compliant</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Success Indicator */}
            {uploadedFile && (
              <div className="absolute -top-4 -right-4 bg-uk-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Ready to process!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bank Carousel Section */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="text-center mb-4">
            <p className="text-sm font-medium text-gray-500 mb-4">
              Trusted by customers of all major UK banks
            </p>
            <BankCarousel />
          </div>
        </div>
      </div>
    </section>
  )
}