'use client'

import { FileText, Upload, Shield, Zap, Download, CheckCircle } from "lucide-react"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BankCarousel } from "./bank-carousel"

export function HeroSectionV3() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [currentWord, setCurrentWord] = useState(0)

  const rotatingWords = ['accuracy', 'efficiency', 'precision', 'speed']

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % rotatingWords.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

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
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 min-h-screen">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.4))] opacity-30" />

      <div className="relative container mx-auto px-4 py-4 lg:py-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">

          {/* Top Section - Users + Security */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-uk-blue-50 to-uk-green-50 rounded-full border border-uk-blue-100">
              <div className="flex -space-x-1">
                <img
                  src="/testimonial-james.jpg"
                  alt="James testimonial"
                  className="w-4 h-4 rounded-full border border-white object-cover"
                />
                <img
                  src="/testimonial-anna.jpg"
                  alt="Anna testimonial"
                  className="w-4 h-4 rounded-full border border-white object-cover"
                />
                <img
                  src="/testimonial-emeka.jpg"
                  alt="Emeka testimonial"
                  className="w-4 h-4 rounded-full border border-white object-cover"
                />
              </div>
              <span className="text-xs font-semibold text-uk-blue-700">Trusted by 1200+ businesses</span>
            </div>
            <Badge variant="security" className="text-xs px-2 py-1">AICPA SOC Certified</Badge>
          </div>

          {/* Headline Section */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
              Increase{" "}
              <span className="text-uk-blue-600 relative inline-block min-w-[200px]">
                <span
                  key={currentWord}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out relative"
                >
                  {rotatingWords[currentWord]}
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-uk-blue-200 animate-in fade-in duration-700 delay-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,8 Q50,0 100,8" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </span>
              </span>
              , not effort.
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-4 whitespace-nowrap">
              Convert your PDF bank statements into CSV, QIF & Excel files in seconds
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link href="/convert">
                <Button className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-6 py-2 text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all">
                  Try Free
                </Button>
              </Link>
              <Button variant="outline" className="px-6 py-2 text-sm font-medium rounded-lg border-gray-300 hover:bg-gray-50">
                Learn more
              </Button>
            </div>
          </div>

          {/* Central Upload Zone with Side Features */}
          <div className="relative max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8 items-start">

              {/* Left Features */}
              <div className="hidden lg:block lg:col-span-3 space-y-4 mt-16">
                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-uk-blue-100 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-uk-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">10x faster</h4>
                        <p className="text-xs text-gray-600">processing</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-uk-green-100 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-uk-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Bank-grade</h4>
                        <p className="text-xs text-gray-600">security</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-uk-blue-100 rounded-xl flex items-center justify-center">
                        <Download className="w-5 h-5 text-uk-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Multiple</h4>
                        <p className="text-xs text-gray-600">formats</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Central Upload */}
              <div className="lg:col-span-6">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 lg:p-8">
              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 lg:p-10 text-center transition-all duration-500 ${
                  isDragOver
                    ? 'border-uk-blue-400 bg-uk-blue-50 scale-105'
                    : uploadedFile
                    ? 'border-uk-green-300 bg-uk-green-50'
                    : 'border-gray-200 bg-gray-50 hover:border-uk-blue-300 hover:bg-uk-blue-50/50 hover:scale-102'
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
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-uk-green-100 rounded-2xl flex items-center justify-center mx-auto">
                      <CheckCircle className="w-10 h-10 text-uk-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">File Ready!</h3>
                      <p className="text-gray-600 mb-1">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Link href="/convert">
                      <Button size="lg" className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                        Process Statement
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-uk-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Upload className="w-10 h-10 text-uk-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">Upload Your Statement</h3>
                      <p className="text-gray-600">Drag and drop your file here, or click to browse</p>
                    </div>
                    <div className="flex justify-center gap-3">
                      <Badge variant="outline" className="text-sm font-medium">PDF</Badge>
                      <Badge variant="outline" className="text-sm font-medium">CSV</Badge>
                      <Badge variant="outline" className="text-sm font-medium">Excel</Badge>
                    </div>
                  </div>
                )}
              </div>
                </div>
              </div>

              {/* Right Features */}
              <div className="hidden lg:block lg:col-span-3 space-y-4 mt-16">
                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-uk-green-100 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-uk-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">99.6%</h4>
                        <p className="text-xs text-gray-600">accuracy</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-uk-blue-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-uk-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">All UK</h4>
                        <p className="text-xs text-gray-600">banks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-uk-green-100 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-uk-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">GDPR</h4>
                        <p className="text-xs text-gray-600">compliant</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* Floating Success Indicator */}
            {uploadedFile && (
              <div className="absolute -top-4 -right-4 bg-uk-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Ready to convert!
                </div>
              </div>
            )}
          </div>

          {/* Mobile Features Grid */}
          <div className="lg:hidden grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-uk-blue-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-uk-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">10x faster</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-uk-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-uk-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Bank-grade</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-uk-blue-100 rounded-lg flex items-center justify-center">
                    <Download className="w-4 h-4 text-uk-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">CSV, QIF, Excel</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-uk-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-uk-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">99.6% accurate</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bank Carousel Section */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <p className="text-sm font-medium text-gray-500 text-center">
              Works with all major UK banks
            </p>
            <BankCarousel />
          </div>

        </div>
      </div>
    </section>
  )
}