'use client'

import React, { useState, useEffect } from 'react'
import { FileText, Upload, Download, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { Navigation } from '@/components/landing/navigation'

export default function ConvertPage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewData, setPreviewData] = useState<{ preview: any[], download: any[], total: number, csvContent?: string, bankName?: string, detectedFormat?: string } | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  // Process single file when uploaded
  useEffect(() => {
    if (uploadedFiles.length === 1 && !previewData) {
      processSingleFile(uploadedFiles[0])
    } else if (uploadedFiles.length === 0) {
      setPreviewData(null)
      setParseError(null)
    }
  }, [uploadedFiles, previewData])

  const processSingleFile = async (file: File) => {
    console.log('🚀 Starting to process file:', file.name, file.size, 'bytes')
    setIsProcessing(true)
    setParseError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('📤 Sending request to /api/parse-single-pdf')

      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.error('⏱️ Request timeout after 65 seconds')
        controller.abort()
      }, 65000) // 65 seconds (slightly more than server timeout)

      const response = await fetch('/api/parse-single-pdf', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log('📥 Response received:', response.status, response.statusText)

      const result = await response.json()
      console.log('📋 Response data:', result)

      if (response.ok) {
        const newPreviewData = {
          preview: result.preview,
          download: result.download,
          total: result.actualTransactionCount,
          csvContent: result.csvContent,
          bankName: result.bankName,
          detectedFormat: result.detectedFormat
        }
        console.log('✅ Setting preview data:', newPreviewData)
        setPreviewData(newPreviewData)
        console.log(`Successfully parsed ${result.actualTransactionCount} transactions from ${file.name}`)
      } else {
        console.error('❌ API error:', result.error, result.details)
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
      console.log('🏁 Finished processing, setting isProcessing to false')
      setIsProcessing(false)
    }
  }

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
    console.log('📁 Files dropped:', files.map(f => f.name))
    if (files.length > 0) {
      setPreviewData(null)
      setParseError(null)
      setUploadedFiles(files.slice(0, 5)) // Limit to 5 files
      console.log('📤 Set uploadedFiles to:', files.slice(0, 5).map(f => f.name))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    console.log('📁 Files selected:', files ? Array.from(files).map(f => f.name) : 'none')
    if (files && files.length > 0) {
      const fileArray = Array.from(files).filter(file => file.type === 'application/pdf')
      console.log('📁 PDF files filtered:', fileArray.map(f => f.name))
      setPreviewData(null)
      setParseError(null)
      setUploadedFiles(fileArray.slice(0, 5)) // Limit to 5 files
      console.log('📤 Set uploadedFiles to:', fileArray.slice(0, 5).map(f => f.name))
    }
  }

  const handleDownloadCSV = () => {
    if (previewData?.csvContent && uploadedFiles[0]) {
      const fileName = uploadedFiles[0].name.replace(/\.[^/.]+$/, '') + '_transactions.csv'
      const blob = new Blob([previewData.csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      console.log(`Downloaded CSV: ${fileName}`)
    }
  }

  const resetUpload = () => {
    setUploadedFiles([])
    setPreviewData(null)
    setParseError(null)
    setIsProcessing(false)
  }

  const handleBrowseClick = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    fileInput?.click()
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-uk-blue-600 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">Upload Files</h1>
            </div>

            <p className="text-gray-600 mb-8">
              While general AI tools are powerful, our precision-built AI specializes exclusively in bank statement conversion - delivering 99.6% accuracy where generic tools fall short.
            </p>

            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                isDragOver
                  ? 'border-uk-blue-400 bg-uk-blue-50'
                  : uploadedFiles.length > 0 && previewData
                  ? 'border-uk-green-300 bg-uk-green-50'
                  : uploadedFiles.length >= 5
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploadedFiles.length === 0 && (
                <input
                  type="file"
                  id="file-upload"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf"
                  multiple
                  onChange={handleFileChange}
                  disabled={uploadedFiles.length >= 5}
                />
              )}

              {uploadedFiles.length > 0 && previewData ? (
                // Preview Mode
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={resetUpload}
                      className="flex items-center text-gray-500 hover:text-gray-700 text-sm"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Upload different file
                    </button>
                    <div className="text-xs text-gray-600">
                      {previewData.bankName} • {previewData.total} transactions
                    </div>
                  </div>

                  <div className="w-12 h-12 bg-uk-green-500 rounded-xl flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Processing Complete!</h3>
                    <p className="text-gray-600 mb-4">
                      Successfully parsed {previewData.total} transactions from {uploadedFiles[0].name}
                    </p>
                  </div>

                  {/* Mini Transaction Preview */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Preview (first 3 transactions):</h4>
                    {previewData.preview.slice(0, 3).map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-md p-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            transaction.type === 'credit' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span className="font-medium truncate max-w-[120px]">
                            {transaction.description}
                          </span>
                        </div>
                        <span className={`font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}£{Math.abs(transaction.amount).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleDownloadCSV}
                    className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 w-full"
                  >
                    <Download className="w-4 h-4" />
                    Download CSV ({previewData.total} transactions)
                  </button>
                </div>
              ) : isProcessing ? (
                // Processing Mode
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-uk-blue-100 rounded-xl flex items-center justify-center mx-auto">
                    <Loader2 className="w-8 h-8 text-uk-blue-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Processing PDF...</h3>
                    <p className="text-gray-600">
                      Analyzing {uploadedFiles[0]?.name} for bank transactions
                    </p>
                  </div>
                </div>
              ) : parseError ? (
                // Error Mode
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-red-700 mb-2">Processing Failed</h3>
                    <p className="text-red-600 mb-4">{parseError}</p>
                    <button
                      onClick={resetUpload}
                      className="text-uk-blue-600 hover:text-uk-blue-700 underline font-medium"
                    >
                      Try a different file
                    </button>
                  </div>
                </div>
              ) : (
                // Upload Mode
                <div className="space-y-6">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto ${
                    uploadedFiles.length >= 5 ? 'bg-yellow-500' : 'bg-uk-blue-600'
                  }`}>
                    <FileText className="w-8 h-8 text-white" />
                  </div>

                  <div>
                    <h3 className={`text-xl font-medium mb-2 ${
                      uploadedFiles.length >= 5 ? 'text-yellow-700' : 'text-gray-900'
                    }`}>
                      {uploadedFiles.length >= 5 ? 'Free limit reached' : 'Drag & drop PDF files here'}
                    </h3>
                    {uploadedFiles.length >= 5 ? (
                      <p className="text-yellow-600">
                        Upgrade to process more than 5 files per month
                      </p>
                    ) : (
                      <p className="text-gray-600">
                        or{' '}
                        <button
                          onClick={handleBrowseClick}
                          className="text-uk-blue-600 hover:text-uk-blue-700 underline font-medium"
                        >
                          browse files
                        </button>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-500">
                    <p>Supported file types: PDF only</p>
                    <p className={uploadedFiles.length >= 5 ? 'text-yellow-600 font-medium' : ''}>
                      Maximum of 5 files allowed ({uploadedFiles.length}/5 used)
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer Text */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm italic">
              The Bank statement converter is provided by{' '}
              <span className="text-uk-blue-600 font-medium">convert-bankstatement.com</span>.{' '}
              We help companies convert statements smarter, process better, and manage financial data more efficiently.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}