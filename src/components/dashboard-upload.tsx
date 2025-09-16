'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle2, XCircle, Clock, Download, ArrowRight, Eye } from "lucide-react"
import Link from "next/link"

// Mock processing job for demonstration
const mockProcessingJob = {
  id: "demo-1",
  fileName: "HSBC_Statement_March_2024.pdf",
  fileSize: "2.4 MB",
  bank: "HSBC",
  status: "processing" as const,
  progress: 75,
  startTime: new Date(Date.now() - 1000 * 60 * 1),
  transactionCount: 847
}

export function DashboardUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [hasActiveJob, setHasActiveJob] = useState(false) // Demo: show upload section by default

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
    console.log('Dropped files:', files)
    setHasActiveJob(true)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    console.log('Selected files:', files)
    setHasActiveJob(true)
  }, [])

  if (hasActiveJob) {
    return (
      <Card className="border-2 border-uk-blue-200 bg-uk-blue-50 min-h-[45vh] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-uk-blue-600 flex items-center gap-2">
                <Clock className="h-5 w-5 animate-spin" />
                Processing Your File
              </CardTitle>
              <CardDescription className="text-uk-blue-600">
                Your bank statement is being converted. This usually takes 10-30 seconds.
              </CardDescription>
            </div>
            <Badge className="bg-blue-100 text-uk-blue-600 text-sm px-3 py-1">
              Step 2 of 3
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
          {/* Processing Status */}
          <div className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-uk-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{mockProcessingJob.fileName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{mockProcessingJob.fileSize}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {mockProcessingJob.bank}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{mockProcessingJob.progress}%</div>
                <div className="text-xs text-muted-foreground">Processing...</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Extracting transactions...</span>
                <span>{mockProcessingJob.progress}%</span>
              </div>
              <Progress value={mockProcessingJob.progress} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Found {mockProcessingJob.transactionCount} transactions so far
              </div>
            </div>
          </div>

          {/* Next Steps */}
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

            <div className="flex items-center gap-3 p-3 rounded-lg bg-uk-blue-50 border border-uk-blue-200">
              <div className="h-8 w-8 bg-uk-blue-600 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-white animate-spin" />
              </div>
              <div>
                <div className="text-sm font-medium text-uk-blue-600">Processing</div>
                <div className="text-xs text-uk-blue-600">Converting data</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border">
              <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Download className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-400">Download</div>
                <div className="text-xs text-gray-400">Ready soon</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setHasActiveJob(false)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview Progress
            </Button>
            <Link href="/dashboard/convert" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 hover:from-uk-blue-700 hover:to-uk-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg">
                <ArrowRight className="mr-2 h-4 w-4" />
                View Full Queue
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-dashed border-uk-blue-300 bg-gradient-to-br from-uk-blue-50 to-white min-h-[32vh] flex flex-col">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-uk-blue-600">
          Upload Your Bank Statement
        </CardTitle>
        <CardDescription className="text-lg">
          Start by uploading your PDF or CSV bank statement to convert it to your preferred format
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
            or click to browse your files
          </p>

          <input
            type="file"
            multiple
            accept=".pdf,.csv"
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
            Supported formats: PDF, CSV • Max file size: 10MB per file • Bank statements from any UK bank
          </div>
        </div>

      </CardContent>
    </Card>
  )
}