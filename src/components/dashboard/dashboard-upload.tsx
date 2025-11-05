'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle2, XCircle, Clock, Download, ArrowRight, Eye, AlertCircle } from "lucide-react"
import Link from "next/link"
import { NoParserDetectedDialog } from "@/components/support/no-parser-detected-dialog"
import { SupportRequestForm } from "@/components/support/support-request-form"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { saveConversion } from '@/lib/supabase-queries'

interface ProcessingJob {
  id: string
  fileName: string
  fileSize: string
  file: File
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  result?: {
    bankName?: string
    transactionCount: number
    csvContent?: string
    preview?: any[]
    download?: any[]
  }
}

export function DashboardUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null)
  const [showNoParserDialog, setShowNoParserDialog] = useState(false)
  const [showSupportForm, setShowSupportForm] = useState(false)
  const [unsupportedBankData, setUnsupportedBankData] = useState<{
    bankName: string
    pdfUrl: string
    pdfStoragePath: string
    userEmail: string
  } | null>(null)

  // Lazy initialization of Supabase client - only create when needed
  const getSupabaseClient = () => {
    return createClientComponentClient()
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && files[0].type === 'application/pdf') {
      processFile(files[0])
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0 && files[0].type === 'application/pdf') {
      processFile(files[0])
    }
  }, [])

  const processFile = async (file: File) => {
    const job: ProcessingJob = {
      id: Date.now().toString(),
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      file,
      status: 'uploading',
      progress: 0,
    }

    setCurrentJob(job)

    try {
      // Start processing
      job.status = 'processing'
      job.progress = 25
      setCurrentJob({ ...job })

      console.log('📤 Uploading file to parser API:', file.name)

      const formData = new FormData()
      formData.append('file', file)

      job.progress = 50
      setCurrentJob({ ...job })

      // Use hybrid parser with Python fallback - always works!
      const response = await fetch('/api/parse-single-pdf', {
        method: 'POST',
        body: formData,
      })

      job.progress = 75
      setCurrentJob({ ...job })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || 'Failed to parse PDF')
      }

      const result = await response.json()
      console.log('✅ Parser API response:', result)

      job.status = 'completed'
      job.progress = 100
      job.result = {
        bankName: result.bankName,
        transactionCount: result.actualTransactionCount || result.shownTransactionCount,
        csvContent: result.csvContent,
        preview: result.preview,
        download: result.download,
      }
      setCurrentJob({ ...job })

      // Save conversion to database
      try {
        const supabase = getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const saveResult = await saveConversion({
            userId: session.user.id,
            filename: file.name,
            fileSize: file.size,
            fileType: file.type,
            bankDetected: result.bankName,
            status: 'completed',
            transactionsCount: result.actualTransactionCount || result.shownTransactionCount,
            processingTimeMs: result.metadata?.processingTime,
          })

          if (saveResult.success) {
            console.log('✅ Conversion saved to database:', saveResult.jobId)
          } else {
            console.error('❌ Failed to save conversion:', saveResult.error)
          }
        }
      } catch (saveError) {
        console.error('❌ Error saving conversion to database:', saveError)
        // Don't fail the entire upload if database save fails
      }

    } catch (error: any) {
      console.error('❌ Error processing file:', error)

      // Check if this is a bank detection failure (unsupported bank)
      const isBankDetectionError = error.message?.includes('Bank detection failed') ||
                                    error.message?.includes('not yet available') ||
                                    error.message?.includes('supported UK bank')

      if (isBankDetectionError) {
        // Upload PDF to Supabase storage for support request
        try {
          const supabase = getSupabaseClient()
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const userId = session.user.id
            const fileName = `${userId}/${Date.now()}_${file.name}`

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('statements')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
              })

            if (!uploadError && uploadData) {
              const { data: { publicUrl } } = supabase.storage
                .from('statements')
                .getPublicUrl(uploadData.path)

              // Store data for support request
              setUnsupportedBankData({
                bankName: 'Unknown Bank',
                pdfUrl: publicUrl,
                pdfStoragePath: uploadData.path,
                userEmail: session.user.email || ''
              })

              // Show dialog to user
              setShowNoParserDialog(true)

              // Reset the current job so error doesn't show
              setCurrentJob(null)
              return
            }
          }
        } catch (uploadError) {
          console.error('Error uploading to Supabase:', uploadError)
          // Fall through to show error normally
        }
      }

      // Show error normally if not a bank detection issue or upload failed
      job.status = 'error'
      job.progress = 0
      job.error = error.message || 'Failed to process file'
      setCurrentJob({ ...job })

      // Save failed conversion to database for tracking
      try {
        const supabase = getSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await saveConversion({
            userId: session.user.id,
            filename: file.name,
            fileSize: file.size,
            fileType: file.type,
            status: 'failed',
            errorMessage: error.message || 'Failed to process file',
          })
        }
      } catch (saveError) {
        console.error('❌ Error saving failed conversion:', saveError)
      }
    }
  }

  const handleRequestSupport = () => {
    setShowNoParserDialog(false)
    setShowSupportForm(true)
  }

  const handleTryUniversalParser = () => {
    setShowNoParserDialog(false)
    // TODO: Implement universal parser integration
    alert('Universal parser feature coming soon! For now, please use "Request Support" to get your bank added within 24-48 hours.')
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleDownload = () => {
    if (!currentJob?.result?.csvContent) return

    const blob = new Blob([currentJob.result.csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = currentJob.fileName.replace('.pdf', '.csv')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setCurrentJob(null)
  }

  // Processing/Completed State
  if (currentJob) {
    const isProcessing = currentJob.status === 'uploading' || currentJob.status === 'processing'
    const isCompleted = currentJob.status === 'completed'
    const isError = currentJob.status === 'error'

    return (
      <Card className={`border-2 min-h-[45vh] flex flex-col ${
        isError ? 'border-red-200 bg-red-50' :
        isCompleted ? 'border-green-200 bg-green-50' :
        'border-uk-blue-200 bg-uk-blue-50'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`text-xl font-bold flex items-center gap-2 ${
                isError ? 'text-red-600' :
                isCompleted ? 'text-green-600' :
                'text-uk-blue-600'
              }`}>
                {isError && <XCircle className="h-5 w-5" />}
                {isProcessing && <Clock className="h-5 w-5 animate-spin" />}
                {isCompleted && <CheckCircle2 className="h-5 w-5" />}
                {isError ? 'Processing Failed' :
                 isCompleted ? 'Conversion Complete' :
                 'Processing Your File'}
              </CardTitle>
              <CardDescription className={
                isError ? 'text-red-600' :
                isCompleted ? 'text-green-600' :
                'text-uk-blue-600'
              }>
                {isError ? currentJob.error :
                 isCompleted ? `Successfully extracted ${currentJob.result?.transactionCount} transactions` :
                 'Your bank statement is being converted. This usually takes 10-30 seconds.'}
              </CardDescription>
            </div>
            <Badge className={`text-sm px-3 py-1 ${
              isError ? 'bg-red-100 text-red-600' :
              isCompleted ? 'bg-green-100 text-green-600' :
              'bg-blue-100 text-uk-blue-600'
            }`}>
              {isError ? 'Failed' :
               isCompleted ? 'Step 3 of 3' :
               'Step 2 of 3'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
          {/* File Info */}
          <div className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  isError ? 'bg-red-600' :
                  isCompleted ? 'bg-green-600' :
                  'bg-uk-blue-600'
                }`}>
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{currentJob.fileName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{currentJob.fileSize}</span>
                    {currentJob.result?.bankName && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {currentJob.result.bankName}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{currentJob.progress}%</div>
                <div className={`text-xs ${
                  isError ? 'text-red-600' :
                  isCompleted ? 'text-green-600' :
                  'text-muted-foreground'
                }`}>
                  {isError ? 'Error' :
                   isCompleted ? 'Complete' :
                   'Processing...'}
                </div>
              </div>
            </div>

            {!isError && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {isCompleted ? 'Conversion complete!' : 'Extracting transactions...'}
                  </span>
                  <span>{currentJob.progress}%</span>
                </div>
                <Progress value={currentJob.progress} className="h-2" />
                {currentJob.result?.transactionCount && (
                  <div className="text-xs text-muted-foreground">
                    Found {currentJob.result.transactionCount} transactions
                  </div>
                )}
              </div>
            )}

            {isError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-600">
                    <p className="font-medium">Error Details:</p>
                    <p className="mt-1">{currentJob.error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white border">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium">Upload Complete</div>
                <div className="text-xs text-muted-foreground">File received</div>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg border ${
              isCompleted ? 'bg-white' :
              isError ? 'bg-red-50 border-red-200' :
              'bg-uk-blue-50 border-uk-blue-200'
            }`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-100' :
                isError ? 'bg-red-100' :
                'bg-uk-blue-600'
              }`}>
                {isCompleted ? <CheckCircle2 className="h-4 w-4 text-green-600" /> :
                 isError ? <XCircle className="h-4 w-4 text-red-600" /> :
                 <Clock className="h-4 w-4 text-white animate-spin" />}
              </div>
              <div>
                <div className={`text-sm font-medium ${
                  isCompleted ? '' :
                  isError ? 'text-red-600' :
                  'text-uk-blue-600'
                }`}>
                  {isError ? 'Processing Failed' : 'Processing'}
                </div>
                <div className={`text-xs ${
                  isCompleted ? 'text-muted-foreground' :
                  isError ? 'text-red-600' :
                  'text-uk-blue-600'
                }`}>
                  {isError ? 'Error occurred' : 'Converting data'}
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-lg border ${
              isCompleted ? 'bg-green-50 border-green-200' :
              'bg-gray-50'
            }`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-600' : 'bg-gray-200'
              }`}>
                <Download className={`h-4 w-4 ${
                  isCompleted ? 'text-white' : 'text-gray-400'
                }`} />
              </div>
              <div>
                <div className={`text-sm font-medium ${
                  isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>Download</div>
                <div className={`text-xs ${
                  isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {isCompleted ? 'Ready now!' : 'Ready soon'}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Transactions */}
          {isCompleted && currentJob.result?.preview && currentJob.result.preview.length > 0 && (
            <div className="border rounded-lg p-4 bg-white">
              <h3 className="font-semibold mb-3">Transaction Preview</h3>
              <div className="space-y-2 text-sm">
                {currentJob.result.preview.slice(0, 3).map((txn: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium">{txn.description}</div>
                      <div className="text-xs text-muted-foreground">{txn.date}</div>
                    </div>
                    <div className={`font-semibold ${
                      txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.type === 'credit' ? '+' : '-'}£{txn.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {isError && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleReset}
              >
                <Upload className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            {isCompleted && (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleReset}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Another
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 hover:from-uk-blue-700 hover:to-uk-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </>
            )}
            {isProcessing && (
              <Button
                variant="outline"
                className="flex-1"
                disabled
              >
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Upload State
  return (
    <Card className="border-2 border-dashed border-uk-blue-300 bg-gradient-to-br from-uk-blue-50 to-white min-h-[32vh] flex flex-col">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-uk-blue-600">
          Upload Your Bank Statement
        </CardTitle>
        <CardDescription className="text-lg">
          Start by uploading your PDF bank statement to convert it to CSV format
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            isDragging
              ? 'border-uk-blue-600 bg-uk-blue-100 scale-105'
              : 'border-uk-blue-300 hover:border-uk-blue-500 hover:bg-uk-blue-25'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mx-auto h-16 w-16 bg-uk-blue-600 rounded-full flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-white" />
          </div>

          <h3 className="text-xl font-semibold mb-2 text-uk-blue-600">
            {isDragging ? 'Drop your file here' : 'Drag & drop your bank statement'}
          </h3>

          <p className="text-muted-foreground mb-6">
            or click to browse your files
          </p>

          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="dashboard-file-upload"
          />

          <Button asChild size="lg" className="bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 hover:from-uk-blue-700 hover:to-uk-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-8 py-3 h-auto">
            <label htmlFor="dashboard-file-upload" className="cursor-pointer">
              <Upload className="mr-2 h-5 w-5" />
              Choose File to Upload
            </label>
          </Button>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="text-xs">HSBC</Badge>
            <Badge variant="outline" className="text-xs">Lloyds</Badge>
            <Badge variant="outline" className="text-xs">Barclays</Badge>
            <Badge variant="outline" className="text-xs">Monzo</Badge>
            <Badge variant="outline" className="text-xs">Starling</Badge>
            <Badge variant="outline" className="text-xs">+ More</Badge>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            Supported formats: PDF • Max file size: 10MB • All UK banks supported
          </div>
        </div>

      </CardContent>

      {/* Dialogs for unsupported banks */}
      {unsupportedBankData && (
        <>
          <NoParserDetectedDialog
            open={showNoParserDialog}
            onOpenChange={setShowNoParserDialog}
            bankName={unsupportedBankData.bankName}
            onRequestSupport={handleRequestSupport}
            onTryUniversalParser={handleTryUniversalParser}
          />

          <SupportRequestForm
            open={showSupportForm}
            onOpenChange={setShowSupportForm}
            bankName={unsupportedBankData.bankName}
            pdfUrl={unsupportedBankData.pdfUrl}
            pdfStoragePath={unsupportedBankData.pdfStoragePath}
            userEmail={unsupportedBankData.userEmail}
          />
        </>
      )}
    </Card>
  )
}
