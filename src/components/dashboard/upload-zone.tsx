'use client'

import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { detectPDFPages, shouldRequireSignup } from '@/lib/pdf-utils'

interface UploadZoneProps {
  onFileUpload: (file: File) => void
}

export function UploadZone({ onFileUpload }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      await processFile(files[0])
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await processFile(files[0])
    }
  }

  const processFile = async (file: File) => {
    setSelectedFile(file)
    setPageCount(null)

    if (file.type === 'application/pdf') {
      setIsAnalyzing(true)
      try {
        const pages = await detectPDFPages(file)
        setPageCount(pages)
      } catch (error) {
        console.error('Error detecting PDF pages:', error)
        setPageCount(1) // fallback
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      // Check if signup is required for large PDFs
      if (pageCount && shouldRequireSignup(selectedFile, pageCount)) {
        window.location.href = '/signup'
        return
      }

      onFileUpload(selectedFile)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-uk-blue-400 bg-uk-blue-50'
            : selectedFile
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

        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="w-8 h-8 text-uk-green-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  {selectedFile.type === 'application/pdf' && (
                    <div className="flex items-center gap-2">
                      {isAnalyzing ? (
                        <>
                          <div className="w-3 h-3 border border-uk-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Analyzing pages...</span>
                        </>
                      ) : pageCount ? (
                        <>
                          <span>{pageCount} page{pageCount !== 1 ? 's' : ''}</span>
                          {pageCount > 5 && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                              Signup required
                            </Badge>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {pageCount && shouldRequireSignup(selectedFile, pageCount) ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Large PDF detected</p>
                    <p className="text-yellow-700">
                      This PDF has {pageCount} pages. Files with more than 5 pages require a free account.
                    </p>
                  </div>
                </div>
                <Button onClick={handleUpload} className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white">
                  Sign Up & Process Statement
                </Button>
              </div>
            ) : (
              <Button onClick={handleUpload} className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white">
                Process Statement
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-uk-blue-100 rounded-2xl flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-uk-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Drop your bank statement here
              </h3>
              <p className="text-gray-600 mb-4">
                Or click to browse and select a file from your computer
              </p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="text-xs">PDF</Badge>
                <Badge variant="outline" className="text-xs">CSV</Badge>
                <Badge variant="outline" className="text-xs">Excel</Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Supported Banks */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Supported Banks</h4>
        <div className="grid grid-cols-4 gap-3">
          {[
            'HSBC', 'Barclays', 'Lloyds', 'NatWest',
            'Santander', 'Monzo', 'Starling', 'Revolut',
            'Halifax', 'TSB', 'Nationwide', '+20 more'
          ].map((bank) => (
            <div key={bank} className="text-center">
              <div className="w-12 h-8 bg-white rounded border border-gray-200 flex items-center justify-center mb-1">
                <span className="text-xs font-medium text-gray-600">{bank}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-4 bg-uk-blue-50 rounded-lg">
        <div className="w-5 h-5 bg-uk-blue-600 rounded-full flex items-center justify-center mt-0.5">
          <CheckCircle className="w-3 h-3 text-white" />
        </div>
        <div className="text-sm">
          <p className="font-medium text-uk-blue-900">Your data is secure</p>
          <p className="text-uk-blue-700">
            Files are processed locally and automatically deleted after conversion.
            We never store your financial data.
          </p>
        </div>
      </div>
    </div>
  )
}