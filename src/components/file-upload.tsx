'use client'

import { useState, useCallback, useRef, useEffect, type DragEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, File as FileIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
// Temporarily comment out client-side converter to fix pdf2json bundling issue
// import { BankStatementConverter, ConversionResult } from '@/lib/converter'

interface ConversionResult {
  transactions: any[]
  summary: {
    totalTransactions: number
    totalCredits: number
    totalDebits: number
    dateRange: { from: string; to: string }
  }
}

interface UploadedFile {
  file: File
  id: string
  result?: ConversionResult
}

type FileStatus = "idle" | "dragging" | "uploading" | "error"

interface FileError {
  message: string
  code: string
}

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const UPLOAD_STEP_SIZE = 5

const formatBytes = (bytes: number, decimals = 2): string => {
  if (!+bytes) return "0 Bytes"
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}

const UploadIllustration = () => (
  <div className="relative w-16 h-16">
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label="Upload illustration"
    >
      <title>Upload File Illustration</title>
      <circle
        cx="50"
        cy="50"
        r="45"
        className="stroke-gray-200 dark:stroke-gray-700"
        strokeWidth="2"
        strokeDasharray="4 4"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          dur="60s"
          repeatCount="indefinite"
        />
      </circle>

      <path
        d="M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z"
        className="fill-blue-100 dark:fill-blue-900/30 stroke-blue-500 dark:stroke-blue-400"
        strokeWidth="2"
      >
        <animate
          attributeName="d"
          dur="2s"
          repeatCount="indefinite"
          values="
            M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z;
            M30 38H70C75 38 75 43 75 43V68C75 73 70 73 70 73H30C25 73 25 68 25 68V43C25 38 30 38 30 38Z;
            M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z"
        />
      </path>

      <path
        d="M30 35C30 35 35 35 40 35C45 35 45 30 50 30C55 30 55 35 60 35C65 35 70 35 70 35"
        className="stroke-blue-500 dark:stroke-blue-400"
        strokeWidth="2"
        fill="none"
      />

      <g className="transform translate-y-2">
        <line
          x1="50"
          y1="45"
          x2="50"
          y2="60"
          className="stroke-blue-500 dark:stroke-blue-400"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <animate
            attributeName="y2"
            values="60;55;60"
            dur="2s"
            repeatCount="indefinite"
          />
        </line>
        <polyline
          points="42,52 50,45 58,52"
          className="stroke-blue-500 dark:stroke-blue-400"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <animate
            attributeName="points"
            values="42,52 50,45 58,52;42,47 50,40 58,47;42,52 50,45 58,52"
            dur="2s"
            repeatCount="indefinite"
          />
        </polyline>
      </g>
    </svg>
  </div>
)

const UploadingAnimation = ({ progress }: { progress: number }) => (
  <div className="relative w-16 h-16">
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label={`Upload progress: ${Math.round(progress)}%`}
    >
      <title>Upload Progress Indicator</title>
      <circle
        cx="50"
        cy="50"
        r="45"
        className="stroke-gray-200"
        strokeWidth="8"
        fill="none"
      />
      <circle
        cx="50"
        cy="50"
        r="45"
        className="stroke-blue-500"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${(progress / 100) * 283}, 283`}
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dasharray 0.3s ease' }}
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dy="0.3em"
        className="text-sm font-medium fill-gray-900"
      >
        {Math.round(progress)}%
      </text>
    </svg>
  </div>
)

export function FileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentlyProcessing, setCurrentlyProcessing] = useState<string | null>(null)
  const [status, setStatus] = useState<FileStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<FileError | null>(null)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current)
      }
    }
  }, [])

  const validateFileSize = useCallback(
    (file: File): FileError | null => {
      // Remove file size restrictions for testing
      return null
    },
    []
  )

  const validateFileType = useCallback(
    (file: File): FileError | null => {
      const acceptedTypes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain']
      const fileType = file.type.toLowerCase()
      if (!acceptedTypes.some((type) => fileType.includes(type))) {
        return {
          message: `File type must be PDF, CSV, Excel, or TXT`,
          code: "INVALID_FILE_TYPE",
        }
      }
      return null
    },
    []
  )

  const handleError = useCallback(
    (error: FileError) => {
      setError(error)
      setStatus("error")
      setTimeout(() => {
        setError(null)
        setStatus("idle")
      }, 3000)
    },
    []
  )

  const simulateUpload = useCallback(
    (uploadingFile: File) => {
      let currentProgress = 0
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current)
      }

      uploadIntervalRef.current = setInterval(() => {
        currentProgress += UPLOAD_STEP_SIZE
        if (currentProgress >= 100) {
          if (uploadIntervalRef.current) {
            clearInterval(uploadIntervalRef.current)
          }
          setProgress(0)
          setStatus("idle")
          setCurrentFile(null)
          // Add to uploaded files list
          const newFile: UploadedFile = {
            file: uploadingFile,
            id: Math.random().toString(36).substr(2, 9)
          }
          setUploadedFiles(prev => [...prev, newFile])
        } else {
          setProgress(currentProgress)
        }
      }, 50) // 50ms intervals for smooth animation
    },
    []
  )

  const handleFileSelect = useCallback(
    (selectedFile: File | null) => {
      if (!selectedFile) return

      setError(null)

      const sizeError = validateFileSize(selectedFile)
      if (sizeError) {
        handleError(sizeError)
        return
      }

      const typeError = validateFileType(selectedFile)
      if (typeError) {
        handleError(typeError)
        return
      }

      setCurrentFile(selectedFile)
      setStatus("uploading")
      setProgress(0)
      simulateUpload(selectedFile)
    },
    [simulateUpload, validateFileSize, validateFileType, handleError]
  )

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setStatus((prev) => (prev !== "uploading" ? "dragging" : prev))
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setStatus((prev) => (prev === "dragging" ? "idle" : prev))
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (status === "uploading") return
      setStatus("idle")
      const droppedFile = e.dataTransfer.files?.[0]
      if (droppedFile) handleFileSelect(droppedFile)
    },
    [status, handleFileSelect]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      handleFileSelect(selectedFile || null)
      if (e.target) e.target.value = ""
    },
    [handleFileSelect]
  )

  const triggerFileInput = useCallback(() => {
    if (status === "uploading") return
    fileInputRef.current?.click()
  }, [status])


  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }


  const handleConvert = async () => {
    if (uploadedFiles.length === 0) return

    setIsProcessing(true)

    try {
      // Process each uploaded file
      for (const uploadedFile of uploadedFiles) {
        const formData = new FormData()
        formData.append('file', uploadedFile.file)
        formData.append('outputFormat', 'csv') // Default to CSV

        const response = await fetch('/api/convert', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to convert ${uploadedFile.file.name}`)
        }

        const result = await response.json()

        // Update the uploaded file with the conversion result
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === uploadedFile.id
              ? { ...f, result: result.data }
              : f
          )
        )
      }

      // Refresh the dashboard data
      window.location.reload()
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

    // TODO: Replace with server-side export functionality
    alert('Download functionality temporarily disabled while fixing PDF processing.')
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Animated Dropzone */}
      <div className="relative w-full max-w-full">
        <div className="group relative w-full rounded-xl bg-white dark:bg-black ring-1 ring-gray-200 dark:ring-white/10 p-0.5">
          <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

          <div className="relative w-full rounded-[10px] bg-gray-50/50 dark:bg-white/[0.02] p-1.5">
            <div
              className={cn(
                "relative mx-auto w-full overflow-hidden rounded-lg border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-black/50",
                error ? "border-red-500/50" : ""
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 transition-opacity duration-300",
                  status === "dragging"
                    ? "opacity-100"
                    : "opacity-0"
                )}
              >
                <div className="absolute inset-x-0 top-0 h-[20%] bg-gradient-to-b from-blue-500/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-t from-blue-500/10 to-transparent" />
                <div className="absolute inset-y-0 left-0 w-[20%] bg-gradient-to-r from-blue-500/10 to-transparent" />
                <div className="absolute inset-y-0 right-0 w-[20%] bg-gradient-to-l from-blue-500/10 to-transparent" />
                <div className="absolute inset-[20%] bg-blue-500/5 rounded-lg transition-all duration-300 animate-pulse" />
              </div>

              <div className="absolute -right-4 -top-4 h-8 w-8 bg-gradient-to-br from-blue-500/20 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative h-[240px]">
                <AnimatePresence mode="wait">
                  {status === "idle" || status === "dragging" ? (
                    <motion.div
                      key="dropzone"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: status === "dragging" ? 0.8 : 1,
                        y: 0,
                        scale: status === "dragging" ? 0.98 : 1,
                      }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-6"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="mb-4">
                        <UploadIllustration />
                      </div>

                      <div className="text-center space-y-1.5 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
                          Drag and drop or
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF, CSV, Excel, TXT up to {formatBytes(DEFAULT_MAX_FILE_SIZE)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="w-4/5 flex items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-white/10 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white transition-all duration-200 hover:bg-gray-200 dark:hover:bg-white/20 group"
                      >
                        <span>Upload File</span>
                        <UploadCloud className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      </button>

                      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        or drag and drop your bank statement here
                      </p>

                      <input
                        ref={fileInputRef}
                        type="file"
                        className="sr-only"
                        onChange={handleFileInputChange}
                        accept=".pdf,.csv,.xls,.xlsx,.txt"
                        aria-label="File input"
                      />
                    </motion.div>
                  ) : status === "uploading" ? (
                    <motion.div
                      key="uploading"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-6"
                    >
                      <div className="mb-4">
                        <UploadingAnimation progress={progress} />
                      </div>

                      <div className="text-center space-y-1.5 mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {currentFile?.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <span className="text-gray-500 dark:text-gray-400">
                            {formatBytes(currentFile?.size || 0)}
                          </span>
                          <span className="font-medium text-blue-500">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (uploadIntervalRef.current) {
                            clearInterval(uploadIntervalRef.current)
                          }
                          setStatus("idle")
                          setProgress(0)
                          setCurrentFile(null)
                        }}
                        type="button"
                        className="w-4/5 flex items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-white/10 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white transition-all duration-200 hover:bg-gray-200 dark:hover:bg-white/20"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <p className="text-sm text-red-500 dark:text-red-400">
                      {error.message}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

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
                          <span>{formatBytes(uploadedFile.file.size)}</span>
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