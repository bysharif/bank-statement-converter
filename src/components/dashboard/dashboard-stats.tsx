'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileCheck, TrendingUp, Clock } from "lucide-react"
import { DashboardStats as DashboardStatsType } from "@/types/dashboard"

// Mock data - replace with real data later
const mockStats: DashboardStatsType = {
  monthlyConversions: 142,
  remainingQuota: 358,
  successRate: 99.6,
  avgProcessingTime: "12.4s"
}

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ComponentType<{ className?: string }>
  color?: "blue" | "green" | "gray" | "purple"
}

function StatsCard({ title, value, change, icon: Icon, color = "blue" }: StatsCardProps) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    gray: "text-gray-600 bg-gray-50",
    purple: "text-purple-600 bg-purple-50"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`h-4 w-4 ${colorClasses[color]} rounded p-1`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground">
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Monthly Conversions"
        value={mockStats.monthlyConversions}
        change="+12% from last month"
        icon={Upload}
        color="blue"
      />
      <StatsCard
        title="Remaining Quota"
        value={mockStats.remainingQuota}
        change="of 500 total"
        icon={FileCheck}
        color="green"
      />
      <StatsCard
        title="Success Rate"
        value={`${mockStats.successRate}%`}
        change="+0.1% from last month"
        icon={TrendingUp}
        color="purple"
      />
      <StatsCard
        title="Avg Processing Time"
        value={mockStats.avgProcessingTime}
        change="-2.3s from last month"
        icon={Clock}
        color="gray"
      />
    </div>
  )
}