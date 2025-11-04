'use client'

import * as React from "react"
import {
  Home,
  Upload,
  FileText,
  BarChart3,
  Settings,
  CreditCard,
  Code,
  Users,
  Zap,
  Bot,
} from "lucide-react"

import { NavMain } from "@/components/dashboard/nav-main"
import { NavUser } from "@/components/dashboard/nav-user"
import { TeamSwitcher } from "@/components/dashboard/team-switcher"
import { CompanyLogo } from "@/components/shared/company-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Mock user data
const user = {
  name: "Natasha Coventry-Marshall",
  email: "natasha@coventry-marshall.co.uk",
  plan: "professional" as const,
}

// Custom logo component for sidebar
const SidebarLogo = () => <CompanyLogo size="sm" />

// Mock team data
const teams = [
  {
    name: "convert-bankstatement.com",
    logo: SidebarLogo,
    plan: "Professional Plan",
  },
]

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    isActive: true,
  },
  {
    title: "History",
    url: "/dashboard/history",
    icon: FileText,
  },
  {
    title: "Starred",
    url: "/dashboard/starred",
    icon: Bot,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} currentPlan={user.plan} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}