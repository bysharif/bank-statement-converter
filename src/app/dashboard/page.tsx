'use client'

import { useEffect, useState } from "react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { DashboardUpload } from "@/components/dashboard/dashboard-upload"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { BanksResources } from "@/components/dashboard/banks-resources"
import { CategoriesOverview } from "@/components/dashboard/categories-overview"
import { SubscriptionUsage } from "@/components/dashboard/subscription-usage"
import { Upload, FileText, TrendingUp, Bot } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { getUserStats, UserStats } from "@/lib/supabase-queries"
import { DashboardRefreshProvider, useDashboardRefresh } from "@/context/DashboardRefreshContext"

function DashboardContent() {
  const { user } = useAuth()
  const { refreshKey, triggerRefresh } = useDashboardRefresh()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      if (user?.id) {
        setLoading(true)
        const userStats = await getUserStats(user.id)
        setStats(userStats)
        setLoading(false)
      }
    }

    fetchStats()
  }, [user?.id, refreshKey])

  // Check for pending subscription linking on dashboard load
  useEffect(() => {
    async function checkPendingSubscription() {
      if (user?.id) {
        try {
          const response = await fetch('/api/subscription/link-pending', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
          const result = await response.json()
          if (result.linked) {
            // Subscription was linked - refresh the page to show updated tier
            triggerRefresh()
          }
        } catch (error) {
          // Silent fail - don't disrupt user experience
          console.error('Failed to check pending subscription:', error)
        }
      }
    }

    checkPendingSubscription()
  }, [user?.id]) // Only run once on mount
  return (
    <>
      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Files Processed"
          value={loading ? "..." : stats?.totalConversions.toString() || "0"}
          change={stats && stats.conversionsToday > 0 ? `+${stats.conversionsToday} today` : undefined}
          icon={FileText}
        />
        <StatsCard
          title="Conversions Today"
          value={loading ? "..." : stats?.conversionsToday.toString() || "0"}
          icon={Upload}
        />
        <StatsCard
          title="Success Rate"
          value={loading ? "..." : `${stats?.successRate || 0}%`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Transactions"
          value={loading ? "..." : stats?.totalTransactions.toLocaleString() || "0"}
          subtitle={stats && stats.totalTransactions > 0 ? "All time" : "Upload your first statement"}
          icon={Bot}
        />
      </div>

      {/* Main Upload Section */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardUpload onUploadComplete={triggerRefresh} />
        </div>
        <div className="space-y-4">
          <SubscriptionUsage />
          <QuickActions />
          <BanksResources />
        </div>
      </div>

      {/* Secondary Content */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentActivity />
        <CategoriesOverview />
      </div>
    </>
  )
}

export default function DashboardPage() {
  return (
    <DashboardRefreshProvider>
      <DashboardContent />
    </DashboardRefreshProvider>
  )
}