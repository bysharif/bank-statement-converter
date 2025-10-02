'use client'

import { type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface NavMainProps {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    planRequired?: string
  }[]
  currentPlan: string
}

export function NavMain({ items, currentPlan }: NavMainProps) {
  const pathname = usePathname()

  const isBusinessPlan = currentPlan === "business"

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isRestricted = item.planRequired === "business" && !isBusinessPlan
          const isActive = pathname === item.url

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild={!isRestricted}
                className={cn(
                  "relative",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                  isRestricted && "opacity-50 cursor-not-allowed"
                )}
                disabled={isRestricted}
              >
                {isRestricted ? (
                  <div className="flex items-center gap-2">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Pro
                    </Badge>
                  </div>
                ) : (
                  <Link href={item.url} className="flex items-center gap-2">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}