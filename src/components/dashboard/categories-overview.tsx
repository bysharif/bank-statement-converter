'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Briefcase,
  CreditCard,
  PiggyBank,
  Settings,
  Bot
} from "lucide-react"

// Mock data for transaction categories
const categoryData = [
  {
    id: "1",
    name: "Business Expenses",
    type: "expense",
    amount: 3247.80,
    percentage: 35.4,
    count: 23,
    icon: Briefcase,
    color: "bg-red-500",
    subcategories: ["Office Supplies", "Software", "Equipment"]
  },
  {
    id: "2",
    name: "Income",
    type: "income",
    amount: 8950.00,
    percentage: 97.6,
    count: 8,
    icon: TrendingUp,
    color: "bg-green-500",
    subcategories: ["Client Payments", "Freelance", "Interest"]
  },
  {
    id: "3",
    name: "Travel & Transport",
    type: "expense",
    amount: 892.45,
    percentage: 9.7,
    count: 15,
    icon: Car,
    color: "bg-blue-500",
    subcategories: ["Fuel", "Public Transport", "Parking"]
  },
  {
    id: "4",
    name: "Meals & Entertainment",
    type: "expense",
    amount: 567.30,
    percentage: 6.2,
    count: 12,
    icon: Utensils,
    color: "bg-orange-500",
    subcategories: ["Client Dinners", "Team Lunch", "Coffee"]
  },
  {
    id: "5",
    name: "Office & Utilities",
    type: "expense",
    amount: 445.90,
    percentage: 4.9,
    count: 6,
    icon: Home,
    color: "bg-purple-500",
    subcategories: ["Rent", "Internet", "Phone"]
  }
]

const totalExpenses = categoryData
  .filter(cat => cat.type === "expense")
  .reduce((sum, cat) => sum + cat.amount, 0)

const totalIncome = categoryData
  .filter(cat => cat.type === "income")
  .reduce((sum, cat) => sum + cat.amount, 0)

const netPosition = totalIncome - totalExpenses

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
        <Button size="sm" className="bg-gradient-to-r from-uk-blue-600 to-uk-blue-700 hover:from-uk-blue-700 hover:to-uk-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg">
          <Bot className="mr-2 h-4 w-4" />
          Auto-categorise
        </Button>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">Income</span>
            </div>
            <div className="text-lg font-bold text-green-700">£{totalIncome.toLocaleString()}</div>
          </div>

          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-sm font-medium text-red-600">Expenses</span>
            </div>
            <div className="text-lg font-bold text-red-700">£{totalExpenses.toLocaleString()}</div>
          </div>

          <div className="text-center p-3 bg-uk-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <PiggyBank className="h-4 w-4 text-uk-blue-600 mr-1" />
              <span className="text-sm font-medium text-uk-blue-600">Net</span>
            </div>
            <div className={`text-lg font-bold ${netPosition >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              £{netPosition.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Category Breakdown</h4>
            <Badge variant="outline" className="text-xs">
              Last 30 days
            </Badge>
          </div>

          <div className="space-y-3">
            {categoryData.map((category) => {
              const Icon = category.icon

              return (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`h-8 w-8 ${category.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{category.name}</span>
                        <Badge
                          variant={category.type === "income" ? "default" : "secondary"}
                          className={`text-xs ${
                            category.type === "income"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {category.count} transactions
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Progress
                          value={category.percentage}
                          className="h-1.5 flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-12">
                          {category.percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-semibold ${
                        category.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {category.type === "income" ? "+" : "-"}£{category.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI Insights */}
        <div className="mt-6 p-4 bg-uk-blue-50 rounded-lg border border-uk-blue-200">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 bg-uk-blue-600 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-uk-blue-900 mb-1">AI Insights</h4>
              <p className="text-sm text-uk-blue-700">
                Your business expenses are 15% lower than last month. Consider reviewing the
                "Office & Utilities" category - there might be opportunities for cost savings.
              </p>
              <Button size="sm" variant="outline" className="mt-2 text-uk-blue-600 border-uk-blue-600 hover:bg-uk-blue-50 transition-all duration-200 rounded-lg">
                <Settings className="mr-2 h-3 w-3" />
                Customise Categories
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}