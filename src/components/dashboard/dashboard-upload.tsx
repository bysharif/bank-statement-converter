'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Upload, FileText, CheckCircle2, XCircle, Clock, Download, AlertCircle } from "lucide-react"

interface FileProcessingJob {
  id: string
  file: File
  fileName: string
  fileSize: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  startTime?: number
  endTime?: number
  error?: string
  result?: {
    bankName?: string
    transactionCount: number
    csvContent?: string
    preview?: any[]
    download?: any[]
  }
}

interface BatchState {
  files: FileProcessingJob[]
  currentIndex: number
  allCompleted: boolean
  hasErrors: boolean
  combinedCsvContent?: string
}

interface DashboardUploadProps {
  onUploadComplete?: () => void
}

export function DashboardUpload({ onUploadComplete }: DashboardUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [batchState, setBatchState] = useState<BatchState | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const updateFileStatus = useCallback((
    fileId: string,
    updates: Partial<FileProcessingJob>
  ) => {
    setBatchState(prev => {
      if (!prev) return null
      return {
        ...prev,
        files: prev.files.map(f =>
          f.id === fileId ? { ...f, ...updates } : f
        )
      }
    })
  }, [])

  const processFilesSequentially = async (files: File[]) => {
    // Initialize batch state with all files as pending
    const fileJobs: FileProcessingJob[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      status: 'pending' as const,
      progress: 0,
    }))

    setBatchState({
      files: fileJobs,
      currentIndex: 0,
      allCompleted: false,
      hasErrors: false,
      combinedCsvContent: undefined,
    })

    try {
      // Mark all files as processing
      fileJobs.forEach(job => {
        updateFileStatus(job.id, {
          status: 'processing',
          progress: 10,
          startTime: Date.now()
        })
      })

      // Simulate realistic progress updates during processing
      let currentProgress = 10
      const progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + Math.random() * 12 + 3, 85)
        fileJobs.forEach(job => {
          updateFileStatus(job.id, {
            progress: Math.round(currentProgress)
          })
        })
      }, 800)

      // Create FormData with ALL files
      const formData = new FormData()
      fileJobs.forEach(job => {
        formData.append('files', job.file)
      })

      // Call API once to process all files
      const response = await fetch('/api/process-pdfs', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.message || 'Failed to process files')
      }

      const result = await response.json()

      // Store combined CSV content in batch state
      setBatchState(prev => prev ? { ...prev, combinedCsvContent: result.csvContent } : null)

      // Calculate transactions per file (distribute evenly)
      const transactionsPerFile = Math.floor(result.totalTransactions / fileJobs.length)
      const remainingTransactions = result.totalTransactions % fileJobs.length

      // Mark all files as completed with their share of transactions
      fileJobs.forEach((job, index) => {
        const fileTransactionCount = transactionsPerFile + (index < remainingTransactions ? 1 : 0)

        updateFileStatus(job.id, {
          status: 'completed',
          progress: 100,
          endTime: Date.now(),
          result: {
            bankName: 'AI-Detected',
            transactionCount: fileTransactionCount,
            csvContent: result.csvContent,
            preview: result.preview,
            download: result.download,
          }
        })
      })

    } catch (error: any) {
      console.error('Error processing batch:', error)

      // Mark all files as error
      fileJobs.forEach(job => {
        updateFileStatus(job.id, {
          status: 'error',
          progress: 0,
          error: error.message || 'Failed to process files',
          endTime: Date.now()
        })
      })

      setBatchState(prev => prev ? { ...prev, hasErrors: true } : null)
    }

    // Update current index to total
    setBatchState(prev => prev ? { ...prev, currentIndex: fileJobs.length } : null)

    // Mark all as completed
    setBatchState(prev => prev ? { ...prev, allCompleted: true } : null)

    // Trigger dashboard refresh
    onUploadComplete?.()
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
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf')
    if (files.length > 0) {
      if (files.length > 10) {
        alert('Maximum 10 files allowed at once')
        return
      }
      processFilesSequentially(files)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type === 'application/pdf')

    if (files.length === 0) {
      return
    }

    if (files.length > 10) {
      alert('Maximum 10 files allowed at once')
      return
    }

    // Start sequential processing
    processFilesSequentially(files)
  }, [])

  const handleDownloadAll = () => {
    if (!batchState?.combinedCsvContent) {
      alert('No data to download')
      return
    }

    const completedFiles = batchState.files.filter(f => f.status === 'completed')

    if (completedFiles.length === 0) {
      alert('No completed files to download')
      return
    }

    // Generate filename based on batch
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = completedFiles.length === 1
      ? completedFiles[0].fileName.replace('.pdf', '.csv')
      : `batch-export-${timestamp}.csv`

    // Download combined CSV
    const blob = new Blob([batchState.combinedCsvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setBatchState(null)
  }

  // File Row Component
  function FileRow({ file }: { file: FileProcessingJob }) {
    const getStatusIcon = () => {
      switch (file.status) {
        case 'completed':
          return <CheckCircle2 className="h-5 w-5 text-green-600" />
        case 'processing':
          return <Clock className="h-5 w-5 text-blue-600 animate-spin" />
        case 'error':
          return <XCircle className="h-5 w-5 text-red-600" />
        default:
          return <Clock className="h-5 w-5 text-gray-400" />
      }
    }

    const getStatusBadge = () => {
      switch (file.status) {
        case 'completed':
          return <Badge className="bg-green-100 text-green-600 hover:bg-green-100">Complete</Badge>
        case 'processing':
          return <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100">Processing</Badge>
        case 'error':
          return <Badge className="bg-red-100 text-red-600 hover:bg-red-100">Failed</Badge>
        default:
          return <Badge variant="outline">Pending</Badge>
      }
    }

    return (
      <TableRow className={
        file.status === 'completed' ? 'bg-green-50/50' :
        file.status === 'error' ? 'bg-red-50/50' :
        file.status === 'processing' ? 'bg-blue-50/50' :
        ''
      }>
        <TableCell className="w-[50px]">{getStatusIcon()}</TableCell>
        <TableCell>
          <div className="font-medium text-sm">{file.fileName}</div>
          {file.error && (
            <div className="text-xs text-red-600 mt-1 flex items-start gap-1">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>{file.error}</span>
            </div>
          )}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground w-[100px]">
          {formatFileSize(file.fileSize)}
        </TableCell>
        <TableCell className="w-[280px]">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{file.status === 'completed' ? 'Completed' : file.status === 'processing' ? 'Processing...' : 'Waiting'}</span>
              <span>{file.progress}%</span>
            </div>
            <Progress value={file.progress} className="h-2" />
          </div>
        </TableCell>
        <TableCell className="text-center w-[100px]">
          {file.status === 'completed' && file.result?.transactionCount ? (
            <Badge variant="outline" className="font-mono">
              {file.result.transactionCount}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
        </TableCell>
        <TableCell className="w-[80px]">
          {getStatusBadge()}
        </TableCell>
      </TableRow>
    )
  }

  // File Listing Table Component
  function FileListingTable({ files }: { files: FileProcessingJob[] }) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>File Name</TableHead>
              <TableHead className="w-[100px]">Size</TableHead>
              <TableHead className="w-[280px]">Progress</TableHead>
              <TableHead className="text-center w-[100px]">Transactions</TableHead>
              <TableHead className="w-[80px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <FileRow key={file.id} file={file} />
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Processing View
  if (batchState) {
    const { files, allCompleted, hasErrors } = batchState
    const completedCount = files.filter(f => f.status === 'completed').length
    const totalCount = files.length
    const hasAnyCompleted = completedCount > 0
    const totalTransactions = files.reduce((sum, f) => sum + (f.result?.transactionCount || 0), 0)

    return (
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                {allCompleted ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Batch Processing Complete
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-blue-600 animate-spin" />
                    Processing Files ({completedCount}/{totalCount})
                  </>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                {allCompleted
                  ? hasErrors
                    ? `Completed ${completedCount} of ${totalCount} files with some errors`
                    : `Successfully processed all ${totalCount} files`
                  : `Processing your bank statements sequentially...`
                }
              </CardDescription>
            </div>
            <Badge className={`text-sm px-3 py-1 ${
              allCompleted
                ? hasErrors ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : 'bg-green-100 text-green-700 hover:bg-green-100'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
            }`}>
              {completedCount}/{totalCount} Complete
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* File Listing Table */}
          <FileListingTable files={files} />

          {/* Overall Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Total Files</div>
              <div className="text-3xl font-bold text-gray-900">{totalCount}</div>
            </div>
            <div className="text-center border-l border-r">
              <div className="text-sm text-muted-foreground mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-600">{completedCount}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Total Transactions</div>
              <div className="text-3xl font-bold text-blue-600">{totalTransactions}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleReset}
              disabled={!allCompleted}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload More Files
            </Button>
            {hasAnyCompleted && (
              <Button
                className="flex-1 bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 hover:from-uk-blue-700 hover:to-uk-blue-800 text-white"
                onClick={handleDownloadAll}
              >
                <Download className="mr-2 h-4 w-4" />
                Download CSV
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
          Upload Your Bank Statements
        </CardTitle>
        <CardDescription className="text-lg">
          Upload one or multiple PDF bank statements to convert them to CSV format
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
            {isDragging ? 'Drop your files here' : 'Drag & drop your bank statements'}
          </h3>

          <p className="text-muted-foreground mb-6">
            or click to browse your files (max 10 files)
          </p>

          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="dashboard-file-upload"
          />

          <Button asChild size="lg" className="bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 hover:from-uk-blue-700 hover:to-uk-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-8 py-3 h-auto">
            <label htmlFor="dashboard-file-upload" className="cursor-pointer">
              <Upload className="mr-2 h-5 w-5" />
              Choose Files to Upload
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
            Supported formats: PDF • Max file size: 10MB per file • All UK banks supported
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
