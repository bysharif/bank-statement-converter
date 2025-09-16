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
    bank: "HSBC",
    exportFormat: "csv" as const,
    downloadUrl: "/api/download/1",
    createdAt: new Date("2024-03-15T10:30:00Z"),
    expiresAt: new Date("2024-04-15T10:30:00Z"),
    fileSize: 2516582,
    transactionCount: 1247,
    status: "ready"
  },
  {
    id: "2",
    originalName: "Lloyds_Feb_2024.pdf",
    bank: "Lloyds",
    exportFormat: "csv" as const,
    downloadUrl: "/api/download/2",
    createdAt: new Date("2024-02-28T14:22:00Z"),
    expiresAt: new Date("2024-03-28T14:22:00Z"),
    fileSize: 1887437,
    transactionCount: 623,
    status: "ready"
  },
  {
    id: "3",
    originalName: "Barclays_Statement_Jan_2024.pdf",
    bank: "Barclays",
    exportFormat: "csv" as const,
    downloadUrl: "/api/download/3",
    createdAt: new Date("2024-01-31T09:15:00Z"),
    expiresAt: new Date("2024-02-28T09:15:00Z"),
    fileSize: 3251200,
    transactionCount: 856,
    status: "ready"
  },
  {
    id: "4",
    originalName: "Unknown_Format.pdf",
    bank: "Unknown",
    exportFormat: "csv" as const,
    downloadUrl: "/api/download/4",
    createdAt: new Date("2024-01-28T16:45:00Z"),
    expiresAt: new Date("2024-02-28T16:45:00Z"),
    fileSize: 943718,
    transactionCount: 0,
    status: "expired"
  },
  {
    id: "5",
    originalName: "Monzo_Statement_Dec_2023.csv",
    bank: "Monzo",
    exportFormat: "csv" as const,
    downloadUrl: "/api/download/5",
    createdAt: new Date("2023-12-31T23:59:00Z"),
    expiresAt: new Date("2024-01-31T23:59:00Z"),
    fileSize: 250880,
    transactionCount: 324,
    status: "ready"
  },
  {
    id: "6",
    originalName: "Starling_Nov_2023.pdf",
    bank: "Starling",
    exportFormat: "csv" as const,
    downloadUrl: "/api/download/6",
    createdAt: new Date("2023-11-30T12:30:00Z"),
    expiresAt: new Date("2023-12-30T12:30:00Z"),
    fileSize: 1258291,
    transactionCount: 445,
    status: "ready"
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
      case 'ready':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-uk-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: ConvertedFile['status']) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
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
                        <p className="text-xs text-muted-foreground">→ {file.exportFormat.toUpperCase()}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{file.bank}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(file.createdAt)}</span>
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
                    <span className="text-sm">-</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{(file.fileSize / 1024 / 1024).toFixed(1)} MB</div>
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
                        {file.status === 'ready' && file.downloadUrl && (
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
  const completedFiles = mockFiles.filter(f => f.status === 'ready').length
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