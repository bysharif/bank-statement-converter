'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { ActivityItem } from "@/types/dashboard"

// Mock data - replace with real data later
const mockActivity: ActivityItem[] = [
  {
    id: "1",
    type: "conversion",
    title: "HSBC_Statement_March_2024.pdf",
    description: "Successfully converted • 1,247 transactions",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: "success",
    fileName: "HSBC_Statement_March_2024.pdf",
    bank: "HSBC"
  },
  {
    id: "2",
    type: "download",
    title: "Lloyds_Feb_2024.csv",
    description: "Downloaded CSV export",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: "success",
    fileName: "Lloyds_Feb_2024.csv",
    bank: "Lloyds"
  },
  {
    id: "3",
    type: "conversion",
    title: "Barclays_Statement_Jan_2024.pdf",
    description: "Successfully converted • 856 transactions",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    status: "success",
    fileName: "Barclays_Statement_Jan_2024.pdf",
    bank: "Barclays"
  },
  {
    id: "4",
    type: "error",
    title: "Unknown_Format.pdf",
    description: "Conversion failed - unsupported format",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    status: "error",
    fileName: "Unknown_Format.pdf"
  },
  {
    id: "5",
    type: "conversion",
    title: "Monzo_Statement_Dec_2023.csv",
    description: "Successfully converted • 324 transactions",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    status: "success",
    fileName: "Monzo_Statement_Dec_2023.csv",
    bank: "Monzo"
  }
]

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
          {mockActivity.map((activity) => {
            const Icon = getActivityIcon(activity.type, activity.status)

            return (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  activity.status === 'success' ? 'bg-green-100' :
                  activity.status === 'error' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <Icon className={`h-4 w-4 ${
                    activity.status === 'success' ? 'text-green-600' :
                    activity.status === 'error' ? 'text-red-600' : 'text-gray-600'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                  {activity.bank && (
                    <Badge variant="outline" className="text-xs">
                      {activity.bank}
                    </Badge>
                  )}
                </div>

                {activity.type === 'conversion' && activity.status === 'success' && (
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}