'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { ActivityItem } from "@/types/dashboard"
import { useAuth } from "@/context/AuthContext"
import { getRecentActivity, RecentActivity as RecentActivityType } from "@/lib/supabase-queries"
import { useDashboardRefresh } from "@/context/DashboardRefreshContext"

function formatTimeAgo(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return "Just now"
}

function getActivityIcon(type: ActivityItem['type'], status: ActivityItem['status']) {
  if (status === 'error') return AlertCircle
  if (type === 'download') return Download
  if (type === 'conversion') return CheckCircle2
  return FileText
}

function getStatusBadge(status: ActivityItem['status']) {
  switch (status) {
    case 'success':
      return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>
    case 'error':
      return <Badge variant="destructive">Error</Badge>
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>
    default:
      return null
  }
}

export function RecentActivity() {
  const { user } = useAuth()
  const { refreshKey } = useDashboardRefresh()
  const [activity, setActivity] = useState<RecentActivityType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivity() {
      if (user?.id) {
        setLoading(true)
        const recentActivity = await getRecentActivity(user.id, 5)
        setActivity(recentActivity)
        setLoading(false)
      }
    }

    fetchActivity()
  }, [user?.id, refreshKey])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">Loading activity...</p>
            </div>
          ) : activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No conversions yet</p>
              <p className="text-xs text-muted-foreground">Upload your first bank statement to get started</p>
            </div>
          ) : (
            activity.map((item) => {
              // Map status to component badge format
              const badgeStatus = item.status === 'success' ? 'success' : item.status === 'failed' ? 'error' : 'pending'
              const Icon = getActivityIcon('conversion', badgeStatus)

              return (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    item.status === 'success' ? 'bg-green-100' :
                    item.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      item.status === 'success' ? 'text-green-600' :
                      item.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{item.filename}</p>
                      {getStatusBadge(badgeStatus)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.transactionCount ? `${item.transactionCount.toLocaleString()} transactions processed` : 'Processing...'}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(new Date(item.timestamp))}
                    </span>
                    {item.bank && (
                      <Badge variant="outline" className="text-xs">
                        {item.bank}
                      </Badge>
                    )}
                  </div>

                  {item.status === 'success' && (
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}