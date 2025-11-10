'use client'

import { FileText, Upload, Shield, Zap, Download, CheckCircle, ArrowLeft } from "lucide-react"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BankCarousel } from "./bank-carousel"
import { SignupModal } from "@/components/shared/signup-modal"
import { EmailDownloadModal } from "@/components/shared/email-download-modal"
import { generateCSVContent, downloadCSV } from "@/lib/csv-utils"

export function HeroSectionV3() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadedFile, setUploadedFile] = useState<File | null>(null) // Keep for backward compatibility
  const [currentWord, setCurrentWord] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [previewData, setPreviewData] = useState<{ preview: any[], download: any[], total: number, csvContent?: string, bankName?: string, detectedFormat?: string } | null>(null)
  const [animatedCount, setAnimatedCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [consolidatedData, setConsolidatedData] = useState<any>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [processingStage, setProcessingStage] = useState<string>('')
  const [processingProgress, setProcessingProgress] = useState(0)

  const rotatingWords = ['accuracy', 'efficiency', 'precision', 'speed']

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % rotatingWords.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Process single file when uploaded
  useEffect(() => {
    if (uploadedFiles.length === 1 && !previewData) {
      processSingleFile(uploadedFiles[0])
    } else if (uploadedFiles.length === 0) {
      setPreviewData(null)
      setAnimatedCount(0)
      setParseError(null)
    }
  }, [uploadedFiles])

  // Animate counting when preview data is available
  useEffect(() => {
    if (previewData) {
      const targetCount = previewData.total
      const duration = 2000 // 2 seconds
      const steps = 50
      const stepTime = duration / steps
      const increment = targetCount / steps

      let currentCount = 0
      const timer = setInterval(() => {
        currentCount += increment
        if (currentCount >= targetCount) {
          setAnimatedCount(targetCount)
          clearInterval(timer)
        } else {
          setAnimatedCount(Math.floor(currentCount))
        }
      }, stepTime)

      return () => clearInterval(timer)
    } else {
      setAnimatedCount(0)
    }
  }, [previewData])

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
    const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf')
    if (files.length > 0) {
      // Reset previous data
      setPreviewData(null)
      setParseError(null)

      // Limit to 10 files total
      const newFiles = [...uploadedFiles, ...files].slice(0, 10)
      setUploadedFiles(newFiles)
      // Set the first file for backward compatibility
      if (!uploadedFile) {
        setUploadedFile(newFiles[0])
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files).filter(file => file.type === 'application/pdf')

      // Reset previous data
      setPreviewData(null)
      setParseError(null)

      // Limit to 10 files total
      const newFiles = [...uploadedFiles, ...fileArray].slice(0, 10)
      setUploadedFiles(newFiles)
      // Set the first file for backward compatibility
      if (!uploadedFile) {
        setUploadedFile(newFiles[0])
      }
    }
  }

  const processSingleFile = async (file: File) => {
    console.log('🚀 Processing file:', file.name, file.size, 'bytes')
    setIsProcessing(true)
    setParseError(null)
    setProcessingProgress(0)
    setProcessingStage('Uploading PDF...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('📤 Sending request to /api/parse-single-pdf (Hybrid parser with fallback)')

      // Progress updates for parsing (typically 5-10 seconds)
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev < 90) return prev + 5
          return prev
        })
      }, 200) // Update every 200ms

      // Stage updates for parsing
      setTimeout(() => setProcessingStage('Detecting bank...'), 500)
      setTimeout(() => setProcessingStage('Extracting transactions...'), 1000)
      setTimeout(() => setProcessingStage('Validating data...'), 2000)

      // Add timeout (60 seconds for complex PDFs)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.error('⏱️ Request timeout after 60 seconds')
        clearInterval(progressInterval)
        controller.abort()
      }, 60000) // 60 seconds timeout

      const response = await fetch('/api/parse-single-pdf', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      clearInterval(progressInterval)

      setProcessingProgress(95)
      setProcessingStage('Processing complete!')

      console.log('📥 Response received:', response.status, response.statusText)

      const result = await response.json()
      console.log('📋 Response data:', result)

      if (response.ok) {
        console.log('✅ Parsing successful:', result.actualTransactionCount, 'transactions')

        setProcessingProgress(100)
        setProcessingStage('Success!')

        // Small delay to show completion
        await new Promise(resolve => setTimeout(resolve, 500))

        setPreviewData({
          preview: result.preview,
          download: result.download,
          total: result.actualTransactionCount, // Use actual count from PDF
          csvContent: result.csvContent,
          bankName: result.bankName,
          detectedFormat: result.detectedFormat
        })
        console.log(`Successfully parsed ${result.actualTransactionCount} transactions from ${file.name}`)
      } else {
        console.error('❌ API error:', result.error, result.details)
        clearInterval(progressInterval)
        throw new Error(result.error || result.details || 'Failed to parse PDF')
      }
    } catch (error) {
      console.error('❌ Error processing file:', error)

      let errorMessage = 'Failed to process PDF'
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout - PDF processing took too long. Try a smaller file or contact support.'
        } else {
          errorMessage = error.message
        }
      }

      setParseError(errorMessage)
      setPreviewData(null)
    } finally {
      console.log('🏁 Processing complete, setting isProcessing to false')
      setIsProcessing(false)
      setProcessingProgress(0)
      setProcessingStage('')
    }
  }

  const handleDownloadCSV = () => {
    if (uploadedFile) {
      // Show email modal to collect email for CSV delivery
      setIsEmailModalOpen(true)
    }
  }

  const handleEmailDownload = (email: string) => {
    // Only download if we have real parsed CSV data
    if (previewData?.csvContent && uploadedFile) {
      const fileName = uploadedFile.name.replace(/\.[^/.]+$/, '') + '_transactions.csv'
      downloadCSV(previewData.csvContent, fileName)
      console.log(`Downloaded real transactions CSV for ${email}`)
    } else {
      console.error('No parsed data available for download')
      setParseError('No transaction data available for download')
    }
  }

  const handleUpgrade = () => {
    setIsModalOpen(true)
  }

  return (
    <section className="relative overflow-x-hidden overflow-y-auto bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20 min-h-screen">
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
              <span className="text-uk-blue-600 relative inline-block">
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
              ,<br className="md:hidden" /> not effort.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-4 px-4">
              Convert your PDF bank statements into CSV, QIF & Excel files in seconds
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-row gap-3 justify-center items-center">
              <Link href="/convert">
                <Button className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-6 py-2 text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all">
                  Try Free
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 text-sm font-medium rounded-lg">
                  Learn more
                </Button>
              </Link>
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

              {/* Central Upload/Preview */}
              <div className="lg:col-span-6">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 lg:p-8">
                  {/* Upload Mode */}
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
                      {!uploadedFile && (
                        <input
                          type="file"
                          id="file-upload"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept=".pdf,.csv,.xlsx,.xls"
                          onChange={handleFileChange}
                        />
                      )}

                      {uploadedFile ? (
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <Button
                              variant="ghost"
                              onClick={() => setUploadedFile(null)}
                              className="text-gray-500 hover:text-gray-700 p-1 h-7"
                            >
                              <ArrowLeft className="w-3 h-3 mr-1" />
                              Back to upload
                            </Button>
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              3 of {animatedCount > 0 ? animatedCount : '...'} transactions
                            </Badge>
                          </div>

                          {/* Preview Header */}
                          <div className="text-center">
                            <div className="w-8 h-8 bg-uk-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <FileText className="w-4 h-4 text-uk-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Free Preview</h3>
                            <p className="text-xs text-gray-600">
                              Showing first 3 transactions from <span className="font-medium">{previewData?.bankName || 'Unknown'}</span> statement
                            </p>
                            {previewData?.bankName && (
                              <p className="text-xs text-gray-500 mt-1">
                                Detected: {previewData.bankName} format
                              </p>
                            )}
                          </div>

                          {/* Mini Transaction List */}
                          <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                            {isProcessing ? (
                              <div className="py-6 px-4 space-y-3">
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-uk-blue-600 h-full transition-all duration-500 ease-out"
                                    style={{ width: `${processingProgress}%` }}
                                  />
                                </div>

                                {/* Status Text */}
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin w-4 h-4 border-2 border-uk-blue-600 border-t-transparent rounded-full"></div>
                                  <span className="ml-2 text-xs text-gray-700 font-medium">{processingStage}</span>
                                </div>

                                {/* Progress Percentage */}
                                <div className="text-center text-xs text-gray-500">
                                  {processingProgress}% complete
                                </div>

                                {/* Estimated Time */}
                                <div className="text-center text-xs text-gray-400">
                                  {processingProgress < 30 && 'Estimated time: 45-60 seconds'}
                                  {processingProgress >= 30 && processingProgress < 70 && 'About 30 seconds remaining...'}
                                  {processingProgress >= 70 && processingProgress < 90 && 'Almost done...'}
                                  {processingProgress >= 90 && 'Just a moment...'}
                                </div>
                              </div>
                            ) : parseError ? (
                              <div className="text-center py-4">
                                <p className="text-xs text-red-600 mb-1">Failed to parse PDF</p>
                                <p className="text-xs text-gray-500">{parseError}</p>
                              </div>
                            ) : previewData?.preview ? (
                              previewData.preview.slice(0, 3).map((transaction, index) => (
                                <div key={index} className="flex items-center justify-between bg-white rounded-md p-2 shadow-sm">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                      transaction.type === 'credit' ? 'bg-uk-green-500' : 'bg-red-500'
                                    }`} />
                                    <div>
                                      <p className="font-medium text-gray-900 text-xs truncate max-w-[120px]">
                                        {transaction.description}
                                      </p>
                                      <p className="text-[10px] text-gray-500">
                                        {new Date(transaction.date).toLocaleDateString('en-GB', {
                                          day: '2-digit',
                                          month: 'short'
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className={`font-semibold text-xs ${
                                      transaction.type === 'credit' ? 'text-uk-green-600' : 'text-red-600'
                                    }`}>
                                      {transaction.type === 'credit' ? '+' : '-'}£{Math.abs(transaction.amount).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-xs text-gray-600">No transactions found</p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2">
                            <Button
                              className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-4 py-2.5 text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all w-full min-h-[36px] flex items-center justify-center"
                              onClick={handleDownloadCSV}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download 50 transactions CSV
                            </Button>

                            <Button
                              onClick={handleUpgrade}
                              className="w-full bg-uk-green-600 hover:bg-uk-green-700 text-white px-4 py-2.5 text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all min-h-[36px] flex items-center justify-center"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Get all {animatedCount > 0 ? animatedCount : '...'} transactions
                            </Button>

                            <p className="text-[10px] text-gray-500 text-center leading-tight">
                              Upgrade for unlimited conversions and advanced features
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="w-20 h-20 bg-uk-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                            <Upload className="w-10 h-10 text-uk-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Upload Your Statements</h3>
                            <p className="text-gray-600">Drop your PDF bank statement for consolidated CSV file</p>
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
            {uploadedFiles.length > 0 && (
              <div className="absolute -top-4 -right-4 bg-uk-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  {uploadedFiles.length === 1 ? 'Ready to convert!' : `${uploadedFiles.length} files ready!`}
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

      <SignupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planName="Professional"
        planPrice="£19"
        planType="professional"
      />

      <EmailDownloadModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        fileName={uploadedFile?.name || ''}
        transactionCount={animatedCount}
        onDownload={handleEmailDownload}
      />
    </section>
  )
}