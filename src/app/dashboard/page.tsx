'use client'

import { StatsCard } from "@/components/dashboard/stats-card"
import { DashboardUpload } from "@/components/dashboard/dashboard-upload"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { BanksResources } from "@/components/dashboard/banks-resources"
import { CategoriesOverview } from "@/components/dashboard/categories-overview"
import { Upload, FileText, TrendingUp, Bot } from "lucide-react"

export default function DashboardPage() {
  return (
    <>
      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Files Processed"
          value="247"
          change="+12%"
          icon={FileText}
        />
        <StatsCard
          title="Conversions Today"
          value="18"
          change="+4"
          icon={Upload}
        />
        <StatsCard
          title="Success Rate"
          value="98.5%"
          change="+2.1%"
          icon={TrendingUp}
        />
        <StatsCard
          title="Data Accuracy"
          value="96.2%"
          subtitle="Live accuracy for user"
          icon={Bot}
        />
      </div>

      {/* Main Upload Section */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardUpload />
        </div>
        <div className="space-y-4">
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