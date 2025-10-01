'use client'

import { useState, useCallback } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Upload, FileText, CheckCircle2, XCircle, Clock, Download, Trash2 } from "lucide-react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ProcessingJob } from '@/types/dashboard'

// Mock data for processing queue
const mockJobs: ProcessingJob[] = [
  {
    id: "1",
    fileName: "HSBC_Statement_March_2024.pdf",
    fileSize: 2.4,
    bank: "HSBC",
    status: "processing",
    progress: 65,
    createdAt: new Date(Date.now() - 1000 * 60 * 2)
  },
  {
    id: "2",
    fileName: "Lloyds_Feb_2024.pdf",
    fileSize: 1.8,
    bank: "Lloyds",
    status: "complete",
    progress: 100,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    completedAt: new Date(Date.now() - 1000 * 60 * 3)
  },
  {
    id: "3",
    fileName: "Unknown_Format.pdf",
    fileSize: 0.9,
    bank: "Unknown",
    status: "error",
    progress: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 8),
    completedAt: new Date(Date.now() - 1000 * 60 * 7),
    errorMessage: "Unsupported bank format detected"
  }
]

function FileUploadZone() {
  const [isDragging, setIsDragging] = useState(false)

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
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    console.log('Selected files:', files)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Upload Bank Statements</CardTitle>
        <CardDescription>
          Upload PDF or CSV files from major UK banks. Supported formats: HSBC, Lloyds, Barclays, Monzo, Starling, and more.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-uk-blue-600 bg-blue-50'
              : 'border-gray-300 hover:border-uk-blue-600 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {isDragging ? 'Drop files here' : 'Drag & drop your bank statements'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse your files
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.csv"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <Button asChild className="bg-uk-blue-600 hover:bg-uk-blue-700">
            <label htmlFor="file-upload" className="cursor-pointer">
              Choose Files
            </label>
          </Button>
          <div className="mt-4 text-xs text-muted-foreground">
            Supported formats: PDF, CSV • Max file size: 10MB per file
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProcessingQueue() {
  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date()
    const diff = endTime.getTime() - start.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)

    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const getStatusIcon = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-uk-blue-600 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'error':
        return <Badge variant="destructive">Failed</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-uk-blue-600">Processing</Badge>
      default:
        return <Badge variant="secondary">Queued</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Processing Queue</CardTitle>
          <CardDescription>
            Track the status of your file conversions
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          Clear Completed
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockJobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <p className="font-medium text-sm">{job.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{job.fileSize}</span>
                      {job.bank && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {job.bank}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(job.status)}
                  {job.status === 'complete' && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {job.status === 'processing' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                </div>
              )}

              {job.status === 'complete' && job.completedAt && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Processing completed</span>
                  <span>Completed in {formatDuration(job.createdAt, job.completedAt)}</span>
                </div>
              )}

              {job.status === 'error' && job.errorMessage && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                  <XCircle className="h-4 w-4" />
                  <span>{job.errorMessage}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ExportOptions() {
  const exportFormats = [
    { id: 'csv', name: 'CSV', description: 'Comma-separated values for Excel/Sheets' },
    { id: 'excel', name: 'Excel', description: 'Microsoft Excel format (.xlsx)' },
    { id: 'qif', name: 'QIF', description: 'Quicken Interchange Format' },
    { id: 'ofx', name: 'OFX', description: 'Open Financial Exchange' },
    { id: 'json', name: 'JSON', description: 'JavaScript Object Notation' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Export Options</CardTitle>
        <CardDescription>
          Choose your preferred format for converted files
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {exportFormats.map((format) => (
            <div key={format.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{format.name}</p>
                  <p className="text-xs text-muted-foreground">{format.description}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Batch Export</h4>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Export All as ZIP
            </Button>
            <Button className="flex-1 bg-uk-blue-600 hover:bg-uk-blue-700">
              <Download className="mr-2 h-4 w-4" />
              Custom Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ConvertPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <FileUploadZone />
              </div>

              <div className="grid gap-4 md:gap-6 lg:grid-cols-2 px-4 lg:px-6">
                <ProcessingQueue />
                <ExportOptions />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}