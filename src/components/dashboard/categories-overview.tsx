'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Bot,
  Sparkles
} from "lucide-react"

export function CategoriesOverview() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">Transaction Categories</CardTitle>
          <CardDescription>
            AI-powered categorisation for UK business expenses
          </CardDescription>
        </div>
        <Button size="sm" className="bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 hover:from-uk-blue-700 hover:to-uk-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg" disabled>
          <Bot className="mr-2 h-4 w-4" />
          Auto-categorise
        </Button>
      </CardHeader>
      <CardContent>
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-16 w-16 bg-gradient-to-br from-uk-blue-100 to-uk-blue-200 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-uk-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">AI Categorisation Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-4">
            Upload bank statements to unlock AI-powered transaction categorisation.
            Our intelligent system will automatically sort your income and expenses into meaningful categories.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              Income Tracking
            </div>
            <div className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
              Expense Analysis
            </div>
            <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              Smart Insights
            </div>
            <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
              Tax Ready
            </div>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="mt-6 p-4 bg-uk-blue-50 rounded-lg border border-uk-blue-200">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 bg-uk-blue-600 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-uk-blue-900 mb-1">What's Coming</h4>
              <p className="text-sm text-uk-blue-700">
                Our AI will automatically categorise your transactions into income and expense categories,
                provide spending insights, and help you identify tax-deductible expenses for your UK business.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}