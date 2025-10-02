'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, History, CreditCard, FileText } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card className="min-h-[16vh] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center pt-0">
        <div className="grid gap-2">
          <Link href="/dashboard/convert">
            <Button className="w-full justify-start bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 hover:from-uk-blue-700 hover:to-uk-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg">
              <Upload className="mr-2 h-4 w-4" />
              Upload New Statement
            </Button>
          </Link>

          <Link href="/dashboard/history">
            <Button variant="outline" className="w-full justify-start">
              <History className="mr-2 h-4 w-4" />
              View Conversion History
            </Button>
          </Link>

          <Link href="/dashboard/billing">
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          </Link>

          <Link href="/dashboard/api">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              API Documentation
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}