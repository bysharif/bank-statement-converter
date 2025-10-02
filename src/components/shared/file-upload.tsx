'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BankStatementConverter, ConversionResult } from '@/lib/converter'

interface UploadedFile {
  file: File
  id: string
  result?: ConversionResult
}

export function FileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentlyProcessing, setCurrentlyProcessing] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9)
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt']
    },
    multiple: true
  })

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleConvert = async () => {
    if (uploadedFiles.length === 0) return

    setIsProcessing(true)

    try {
      for (const uploadedFile of uploadedFiles) {
        if (uploadedFile.result) continue // Skip already processed files

        setCurrentlyProcessing(uploadedFile.id)

        // Convert the file
        const result = await BankStatementConverter.convertFile(uploadedFile.file, 'csv')

        // Update the file with the result
        setUploadedFiles(prev => prev.map(f =>
          f.id === uploadedFile.id
            ? { ...f, result }
            : f
        ))

        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error('Conversion failed:', error)
      alert('Conversion failed: ' + (error as Error).message)
    } finally {
      setIsProcessing(false)
      setCurrentlyProcessing(null)
    }
  }

  const handleDownload = (uploadedFile: UploadedFile, format: 'csv' | 'qif' = 'csv') => {
    if (!uploadedFile.result) return

    let content: string
    let filename: string
    let mimeType: string

    if (format === 'csv') {
      content = BankStatementConverter.exportToCSV(uploadedFile.result)
      filename = `${uploadedFile.file.name.replace(/\.[^/.]+$/, '')}_converted.csv`
      mimeType = 'text/csv'
    } else {
      content = BankStatementConverter.exportToQIF(uploadedFile.result)
      filename = `${uploadedFile.file.name.replace(/\.[^/.]+$/, '')}_converted.qif`
      mimeType = 'application/qif'
    }

    BankStatementConverter.downloadFile(content, filename, mimeType)
  }

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragActive
          ? 'border-uk-blue-500 bg-uk-blue-50'
          : 'border-gray-300 hover:border-uk-blue-400'
      }`}>
        <CardContent className="p-12">
          <div {...getRootProps()} className="cursor-pointer text-center">
            <input {...getInputProps()} />
            <div className="space-y-6">
              <div className="w-16 h-16 bg-uk-blue-600 rounded-xl flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              {isDragActive ? (
                <div>
                  <h3 className="text-xl font-medium text-uk-blue-700 mb-2">Drop your files here</h3>
                  <p className="text-uk-blue-600">Release to upload your bank statements</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Drag & drop PDF files here
                  </h3>
                  <p className="text-gray-600">
                    or{' '}
                    <button
                      onClick={() => document.getElementById('dropzone-file')?.click()}
                      className="text-uk-blue-600 hover:text-uk-blue-700 underline font-medium"
                    >
                      browse files
                    </button>
                  </p>
                </div>
              )}
              <div className="space-y-2 text-sm text-gray-500">
                <p>Supported file types: PDF only</p>
                <p>Maximum of 5 files allowed ({uploadedFiles.length}/5 used)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    uploadedFile.result
                      ? 'bg-uk-green-50 border-uk-green-200'
                      : currentlyProcessing === uploadedFile.id
                      ? 'bg-uk-blue-50 border-uk-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-8 h-8 rounded flex items-center justify-center text-xs ${
                        uploadedFile.result
                          ? 'bg-uk-green-100 text-uk-green-700'
                          : currentlyProcessing === uploadedFile.id
                          ? 'bg-uk-blue-100 text-uk-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {uploadedFile.result ? '✓' : currentlyProcessing === uploadedFile.id ? '⟳' : '📄'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">
                            {uploadedFile.file.name}
                          </p>
                          {uploadedFile.result && (
                            <Badge variant="success" className="text-xs">
                              Converted
                            </Badge>
                          )}
                          {currentlyProcessing === uploadedFile.id && (
                            <Badge variant="secondary" className="text-xs">
                              Processing...
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{formatFileSize(uploadedFile.file.size)}</span>
                          {uploadedFile.result && (
                            <>
                              <span>•</span>
                              <span>{uploadedFile.result.summary.totalTransactions} transactions</span>
                              <span>•</span>
                              <span>{uploadedFile.result.summary.dateRange.from} to {uploadedFile.result.summary.dateRange.to}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadedFile.result ? (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(uploadedFile, 'csv')}
                            className="text-xs"
                          >
                            CSV
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(uploadedFile, 'qif')}
                            className="text-xs"
                          >
                            QIF
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadedFile.id)}
                          className="text-gray-500 hover:text-red-600"
                          disabled={currentlyProcessing === uploadedFile.id}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Conversion Summary */}
                  {uploadedFile.result && (
                    <div className="mt-3 pt-3 border-t border-uk-green-200">
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div className="text-center">
                          <div className="font-medium text-uk-green-800">
                            £{uploadedFile.result.summary.totalCredits.toFixed(2)}
                          </div>
                          <div className="text-uk-green-600">Total Credits</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-uk-green-800">
                            £{uploadedFile.result.summary.totalDebits.toFixed(2)}
                          </div>
                          <div className="text-uk-green-600">Total Debits</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-uk-green-800">
                            £{(uploadedFile.result.summary.totalCredits - uploadedFile.result.summary.totalDebits).toFixed(2)}
                          </div>
                          <div className="text-uk-green-600">Net Change</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Convert Button */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {uploadedFiles.every(f => f.result)
                    ? `All ${uploadedFiles.length} file${uploadedFiles.length !== 1 ? 's' : ''} converted successfully`
                    : `Ready to convert ${uploadedFiles.filter(f => !f.result).length} file${uploadedFiles.filter(f => !f.result).length !== 1 ? 's' : ''}`
                  }
                </div>
                {!uploadedFiles.every(f => f.result) && (
                  <Button
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className="bg-uk-blue-600 hover:bg-uk-blue-700"
                  >
                    {isProcessing ? 'Converting...' : 'Convert Files'}
                  </Button>
                )}
                {uploadedFiles.every(f => f.result) && uploadedFiles.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => uploadedFiles.forEach(f => handleDownload(f, 'csv'))}
                      size="sm"
                    >
                      Download All CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => uploadedFiles.forEach(f => handleDownload(f, 'qif'))}
                      size="sm"
                    >
                      Download All QIF
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
          <div className="w-4 h-4 text-uk-green-600">🔒</div>
          Your files are processed locally and never leave your device
        </div>
      </div>
    </div>
  )
}