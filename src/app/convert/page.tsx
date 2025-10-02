'use client'

import React, { useState } from 'react'
import { FileText, Upload } from 'lucide-react'
import { Navigation } from '@/components/landing/navigation'

export default function ConvertPage() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

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
    const files = Array.from(e.dataTransfer.files)
    setUploadedFiles(files)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setUploadedFiles(Array.from(files))
    }
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
                  : uploadedFiles.length >= 5
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                disabled={uploadedFiles.length >= 5}
              />

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
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files:</h4>
                <div className="space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                      <FileText className="w-5 h-5 text-uk-blue-600" />
                      <span className="flex-1 text-sm text-gray-900">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>

                {uploadedFiles.length >= 5 ? (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h5 className="font-medium text-yellow-800 mb-2">Upgrade Required</h5>
                    <p className="text-sm text-yellow-700 mb-3">
                      You've reached the free limit of 5 files per month. Upgrade to Professional for unlimited conversions.
                    </p>
                    <button className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Upgrade to Professional
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 p-4 bg-uk-blue-50 border border-uk-blue-200 rounded-lg">
                    <h5 className="font-medium text-uk-blue-800 mb-2">Ready to Convert</h5>
                    <p className="text-sm text-uk-blue-700 mb-3">
                      Sign up for free to start converting your bank statements with 99.6% accuracy.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => window.location.href = '/signup'}
                        className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Sign Up Free
                      </button>
                      <button
                        onClick={() => window.location.href = '/login'}
                        className="border border-uk-blue-600 text-uk-blue-600 hover:bg-uk-blue-50 px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Log In
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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