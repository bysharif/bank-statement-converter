'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { StatsCard } from "@/components/stats-card"
import { DashboardUpload } from "@/components/dashboard-upload"
import { RecentActivity } from "@/components/recent-activity"
import { QuickActions } from "@/components/quick-actions"
import { BanksResources } from "@/components/banks-resources"
import { CategoriesOverview } from "@/components/categories-overview"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Upload, FileText, TrendingUp, Bot } from "lucide-react"

export const iframeHeight = "800px"

export const description = "A sidebar with a header and a search form."

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-4">
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
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}