'use client'

import { useState } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Download,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  FileText,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ConvertedFile } from '@/types/dashboard'

// Mock data for converted files
const mockFiles: ConvertedFile[] = [
  {
    id: "1",
    originalName: "HSBC_Statement_March_2024.pdf",
    convertedName: "HSBC_Statement_March_2024.csv",
    bank: "HSBC",
    uploadDate: new Date("2024-03-15T10:30:00Z"),
    processingTime: "12.4s",
    transactionCount: 1247,
    fileSize: "2.4 MB",
    outputSize: "186 KB",
    status: "completed",
    downloadUrl: "/api/download/1"
  },
  {
    id: "2",
    originalName: "Lloyds_Feb_2024.pdf",
    convertedName: "Lloyds_Feb_2024.csv",
    bank: "Lloyds",
    uploadDate: new Date("2024-02-28T14:22:00Z"),
    processingTime: "8.7s",
    transactionCount: 623,
    fileSize: "1.8 MB",
    outputSize: "94 KB",
    status: "completed",
    downloadUrl: "/api/download/2"
  },
  {
    id: "3",
    originalName: "Barclays_Statement_Jan_2024.pdf",
    convertedName: "Barclays_Statement_Jan_2024.csv",
    bank: "Barclays",
    uploadDate: new Date("2024-01-31T09:15:00Z"),
    processingTime: "15.2s",
    transactionCount: 856,
    fileSize: "3.1 MB",
    outputSize: "128 KB",
    status: "completed",
    downloadUrl: "/api/download/3"
  },
  {
    id: "4",
    originalName: "Unknown_Format.pdf",
    bank: "Unknown",
    uploadDate: new Date("2024-01-28T16:45:00Z"),
    processingTime: "2.1s",
    fileSize: "0.9 MB",
    status: "failed",
    error: "Unsupported bank format detected"
  },
  {
    id: "5",
    originalName: "Monzo_Statement_Dec_2023.csv",
    convertedName: "Monzo_Statement_Dec_2023.csv",
    bank: "Monzo",
    uploadDate: new Date("2023-12-31T23:59:00Z"),
    processingTime: "3.8s",
    transactionCount: 324,
    fileSize: "245 KB",
    outputSize: "48 KB",
    status: "completed",
    downloadUrl: "/api/download/5"
  },
  {
    id: "6",
    originalName: "Starling_Nov_2023.pdf",
    convertedName: "Starling_Nov_2023.csv",
    bank: "Starling",
    uploadDate: new Date("2023-11-30T12:30:00Z"),
    processingTime: "6.9s",
    transactionCount: 445,
    fileSize: "1.2 MB",
    outputSize: "67 KB",
    status: "completed",
    downloadUrl: "/api/download/6"
  }
]

function FileHistoryTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredFiles = mockFiles.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.bank.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || file.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: ConvertedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-uk-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: ConvertedFile['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-uk-blue-600">Processing</Badge>
      default:
        return <Badge variant="secondary">Queued</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">Conversion History</CardTitle>
            <CardDescription>
              View and manage all your converted bank statements
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Files
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
                  Failed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("processing")}>
                  Processing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Processing Time</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{file.originalName}</p>
                        {file.convertedName && (
                          <p className="text-xs text-muted-foreground">→ {file.convertedName}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{file.bank}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(file.uploadDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(file.status)}
                      {getStatusBadge(file.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {file.transactionCount ? (
                      <span className="text-sm font-medium">{file.transactionCount.toLocaleString()}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{file.processingTime}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{file.fileSize}</div>
                      {file.outputSize && (
                        <div className="text-xs text-muted-foreground">→ {file.outputSize}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {file.status === 'completed' && file.downloadUrl && (
                          <>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredFiles.length === 0 && (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No files found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "Upload your first bank statement to get started"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function QuickStats() {
  const totalFiles = mockFiles.length
  const completedFiles = mockFiles.filter(f => f.status === 'completed').length
  const totalTransactions = mockFiles
    .filter(f => f.transactionCount)
    .reduce((sum, f) => sum + (f.transactionCount || 0), 0)
  const successRate = totalFiles > 0 ? ((completedFiles / totalFiles) * 100).toFixed(1) : '0'

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Files</p>
              <p className="text-2xl font-bold">{totalFiles}</p>
            </div>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{completedFiles}</p>
            </div>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold">{totalTransactions.toLocaleString()}</p>
            </div>
            <div className="h-4 w-4 bg-uk-blue-600 rounded" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">{successRate}%</p>
            </div>
            <div className="h-4 w-4 bg-green-600 rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function HistoryPage() {
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
              <QuickStats />

              <div className="px-4 lg:px-6">
                <FileHistoryTable />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}