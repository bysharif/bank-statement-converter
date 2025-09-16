'use client'

import { Upload, Zap, Download, MessageCircle, BarChart, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function HowItWorksSection() {
  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-uk-blue-50 to-uk-green-50 rounded-full border border-uk-blue-100 mb-4">
            <Zap className="w-4 h-4 text-uk-blue-600" />
            <span className="text-xs font-semibold text-uk-blue-700">How It Works</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">
            Three simple steps
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto whitespace-nowrap">
            Transform your bank statements with our AI-powered platform
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
                {/* Step 1 */}
                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 bg-uk-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-uk-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">1</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Upload Statement</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Drag and drop your bank statement into our secure portal. All major UK banks supported.
                    </p>
                    <div className="flex justify-center gap-2">
                      <Badge variant="outline" className="text-xs px-2 py-1">PDF</Badge>
                      <Badge variant="outline" className="text-xs px-2 py-1">CSV</Badge>
                      <Badge variant="outline" className="text-xs px-2 py-1">Excel</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 2 */}
                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 bg-uk-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-uk-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">2</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Processing</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Advanced AI analyzes with 99.6% accuracy. Preview data and get instant insights.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                        <MessageCircle className="w-3 h-3 text-uk-blue-600" />
                        <span>AI Assistant</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                        <BarChart className="w-3 h-3 text-uk-green-600" />
                        <span>Analytics</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 3 */}
                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 bg-uk-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <Download className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-uk-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">3</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Download & Use</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Export in your preferred format. All exports are HMRC compliant and software-ready.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                        <Shield className="w-3 h-3 text-uk-green-600" />
                        <span>HMRC Ready</span>
                      </div>
                      <div className="flex justify-center gap-2 mt-3">
                        <Badge className="text-xs px-2 py-1 bg-uk-green-100 text-uk-green-700">CSV</Badge>
                        <Badge className="text-xs px-2 py-1 bg-uk-green-100 text-uk-green-700">QIF</Badge>
                        <Badge className="text-xs px-2 py-1 bg-uk-green-100 text-uk-green-700">Excel</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              See Your Data Come to Life
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Intelligent dashboard provides insights and analytics for your financial data
            </p>
          </div>

          {/* Mock Dashboard */}
          <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Dashboard Header */}
            <div className="bg-gradient-to-r from-uk-blue-50 to-uk-green-50 p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-uk-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">📊</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Statement Analysis</h4>
                    <p className="text-sm text-gray-600">HSBC Current Account - March 2024</p>
                  </div>
                </div>
                <Badge className="bg-uk-green-100 text-uk-green-800">
                  ✓ Processed
                </Badge>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-uk-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-uk-blue-600">1,247</div>
                  <div className="text-sm text-gray-600">Transactions</div>
                </div>
                <div className="bg-uk-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-uk-green-600">£45,230</div>
                  <div className="text-sm text-gray-600">Total Income</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-700">£38,950</div>
                  <div className="text-sm text-gray-600">Total Expenses</div>
                </div>
              </div>

              {/* AI Chat Feature */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle className="w-5 h-5 text-uk-blue-600" />
                  <span className="font-medium text-gray-900">AI Assistant</span>
                </div>
                <div className="bg-white rounded p-3 text-sm">
                  <p className="text-gray-700">
                    "I found 23 recurring subscriptions totaling £156/month. Would you like me to categorize them?"
                  </p>
                </div>
              </div>

              {/* Export Options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Export as:</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">CSV</Badge>
                    <Badge variant="outline">QIF</Badge>
                    <Badge variant="outline">Excel</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-uk-green-600" />
                  <span>HMRC Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}