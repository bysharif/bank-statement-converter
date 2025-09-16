'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, FileText } from "lucide-react"
import Link from "next/link"

export function BanksResources() {
  return (
    <Card className="min-h-[16vh] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Banks & Resources</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center pt-0">
        <div className="grid gap-2">
          <Link href="/dashboard/banks">
            <Button variant="outline" className="w-full justify-start">
              <Building2 className="mr-2 h-4 w-4" />
              View All Supported Banks
            </Button>
          </Link>

          <Link href="/dashboard/help">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Help & Documentation
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}