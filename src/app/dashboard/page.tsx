'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileUpload } from '@/components/file-upload'
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

interface JobData {
  id: string
  fileName: string
  fileSize: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
  error?: string
  result?: {
    transactions: any[]
    summary: {
      totalTransactions: number
      totalCredits: number
      totalDebits: number
      dateRange: { from: string; to: string }
    }
  }
}

interface DashboardData {
  jobs: JobData[]
  stats: {
    totalJobs: number
    completedJobs: number
    failedJobs: number
    processingJobs: number
    totalFilesProcessed: number
  }
  limits: {
    canProcess: boolean
    daily: { used: number; limit: number | string }
    monthly: { used: number; limit: number | string }
  }
}

export default function Dashboard() {
  // Temporarily disable NextAuth session check - using simple auth instead
  // const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // For simple auth, assume user is authenticated if they reach this page (middleware handles it)
  const session = { user: { email: 'email@test.com', name: 'Demo User' } }
  const status = 'authenticated'

  useEffect(() => {
    // Skip NextAuth session check for now
    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/jobs')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const data = await response.json()
      setDashboardData(data.data)
    } catch (error) {
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'failed':
        return 'destructive'
      case 'processing':
        return 'secondary'
      default:
        return 'outline'
    }
  }


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Bank Statement Converter
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-4 px-4">
            <Badge variant="outline" className="capitalize">
              Free Plan
            </Badge>
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">📄</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.totalJobs}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">✅</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{dashboardData.stats.completedJobs}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">⏳</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{dashboardData.stats.processingJobs}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">❌</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{dashboardData.stats.failedJobs}</div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
              <CardDescription>Your current usage and plan limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Daily Usage</span>
                    <span className="text-sm text-gray-600">
                      {dashboardData.limits.daily.used}/{dashboardData.limits.daily.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: dashboardData.limits.daily.limit === 'unlimited'
                          ? '0%'
                          : `${Math.min(100, (dashboardData.limits.daily.used / (dashboardData.limits.daily.limit as number)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Monthly Usage</span>
                    <span className="text-sm text-gray-600">
                      {dashboardData.limits.monthly.used}/{dashboardData.limits.monthly.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: dashboardData.limits.monthly.limit === 'unlimited'
                          ? '0%'
                          : `${Math.min(100, (dashboardData.limits.monthly.used / (dashboardData.limits.monthly.limit as number)) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              {!dashboardData.limits.canProcess && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">
                    You've reached your plan limits. Upgrade to process more files.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Convert New Files</CardTitle>
              <CardDescription>Upload bank statements to convert to CSV or QIF format</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload />
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversions</CardTitle>
              <CardDescription>Your recent file conversion history</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.jobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No conversions yet. Upload your first bank statement above!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900">{job.fileName}</h3>
                          <Badge variant={getStatusBadgeVariant(job.status) as any}>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{formatFileSize(job.fileSize)}</span>
                          <span>•</span>
                          <span>{formatDate(job.createdAt)}</span>
                          {job.result && (
                            <>
                              <span>•</span>
                              <span>{job.result.summary.totalTransactions} transactions</span>
                            </>
                          )}
                        </div>
                        {job.error && (
                          <p className="text-red-600 text-sm mt-1">{job.error}</p>
                        )}
                      </div>
                      {job.status === 'completed' && job.result && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/api/download/${job.id}?format=csv`, '_blank')}
                          >
                            Download CSV
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/api/download/${job.id}?format=qif`, '_blank')}
                          >
                            Download QIF
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}