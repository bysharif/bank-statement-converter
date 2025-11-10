'use client'

import { Upload, Zap, Download, CheckCircle, BarChart, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function HowItWorksNew() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-uk-blue-50 to-uk-green-50 rounded-full border border-uk-blue-100 mb-4">
            <Zap className="w-4 h-4 text-uk-blue-600" />
            <span className="text-xs font-semibold text-uk-blue-700">How It Works</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-3">
            Three simple steps
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your bank statements with our AI-powered platform
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Step 1 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              {/* Dashboard Screenshot Mockup - Upload */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-uk-blue-50 to-uk-green-50 p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-uk-blue-600 rounded-lg flex items-center justify-center">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Upload Statement</h4>
                      <p className="text-xs text-gray-600">Step 1 of 3</p>
                    </div>
                  </div>
                </div>

                {/* Upload Area */}
                <div className="p-6">
                  <div className="border-2 border-dashed border-uk-blue-300 bg-uk-blue-50 rounded-xl p-8 text-center">
                    <div className="w-12 h-12 bg-uk-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-6 h-6 text-uk-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Drop your bank statement here</h3>
                    <p className="text-sm text-gray-600 mb-4">PDF, CSV, or Excel files supported</p>
                    <div className="flex justify-center gap-2">
                      <Badge variant="outline" className="text-xs">PDF</Badge>
                      <Badge variant="outline" className="text-xs">CSV</Badge>
                      <Badge variant="outline" className="text-xs">Excel</Badge>
                    </div>
                  </div>

                  {/* Supported Banks */}
                  <div className="mt-6">
                    <p className="text-xs font-medium text-gray-500 mb-3">Supported Banks</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">HSBC</Badge>
                      <Badge variant="secondary" className="text-xs">Barclays</Badge>
                      <Badge variant="secondary" className="text-xs">Lloyds</Badge>
                      <Badge variant="secondary" className="text-xs">Monzo</Badge>
                      <Badge variant="secondary" className="text-xs">+26 more</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative mb-8">
                <div className="w-16 h-16 bg-uk-blue-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-lg">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-uk-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 text-center lg:text-left">
                Upload Your Statement
              </h3>
              <p className="text-lg text-gray-600 mb-6 text-center lg:text-left">
                Simply drag and drop your bank statement into our secure portal. We support all major UK banks
                including HSBC, Lloyds, Barclays, and digital banks like Monzo and Starling.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-uk-green-600" />
                  <span>Bank-grade security</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-uk-green-600" />
                  <span>30+ bank formats</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="relative mb-8">
                <div className="w-16 h-16 bg-uk-blue-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-uk-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 text-center lg:text-left">
                AI Processing & Analysis
              </h3>
              <p className="text-lg text-gray-600 mb-6 text-center lg:text-left">
                Our advanced AI analyzes your statement with 99.6% accuracy. Watch as transactions are
                categorized, duplicates removed, and data cleaned in real-time.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-uk-green-600" />
                  <span>99.6% accuracy rate</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-uk-green-600" />
                  <span>Real-time processing</span>
                </div>
              </div>
            </div>

            <div>
              {/* Dashboard Screenshot Mockup - Processing */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-uk-blue-50 to-uk-green-50 p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-uk-blue-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">AI Processing</h4>
                        <p className="text-xs text-gray-600">HSBC Current Account - March 2024</p>
                      </div>
                    </div>
                    <Badge className="bg-uk-green-100 text-uk-green-800 text-xs">
                      Processing...
                    </Badge>
                  </div>
                </div>

                {/* Processing Content */}
                <div className="p-6">
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Processing Transactions</span>
                      <span className="text-sm text-gray-500">1,247 / 1,247</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-uk-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-uk-blue-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-uk-blue-600">1,247</div>
                      <div className="text-xs text-gray-600">Transactions</div>
                    </div>
                    <div className="bg-uk-green-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-uk-green-600">99.6%</div>
                      <div className="text-xs text-gray-600">Accuracy</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-700">12s</div>
                      <div className="text-xs text-gray-600">Time Left</div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-uk-green-600" />
                      <span className="text-gray-700">Categorized 1,189 transactions</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-uk-green-600" />
                      <span className="text-gray-700">Removed 23 duplicates</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-700">Validating data integrity...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              {/* Dashboard Screenshot Mockup - Download */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-uk-blue-50 to-uk-green-50 p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-uk-green-600 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Conversion Complete</h4>
                        <p className="text-xs text-gray-600">Ready for download</p>
                      </div>
                    </div>
                    <Badge className="bg-uk-green-100 text-uk-green-800 text-xs">
                      ✓ Complete
                    </Badge>
                  </div>
                </div>

                {/* Download Content */}
                <div className="p-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-uk-blue-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-uk-blue-600">1,247</div>
                      <div className="text-xs text-gray-600">Processed</div>
                    </div>
                    <div className="bg-uk-green-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-uk-green-600">£45,230</div>
                      <div className="text-xs text-gray-600">Total Value</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-gray-700">15s</div>
                      <div className="text-xs text-gray-600">Time Taken</div>
                    </div>
                  </div>

                  {/* Export Options */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm">Export Formats</h4>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-uk-blue-600" />
                        <span className="text-sm font-medium">CSV File</span>
                      </div>
                      <button className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-3 py-1 rounded text-xs font-medium">
                        Download
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-uk-green-600" />
                        <span className="text-sm font-medium">QIF File</span>
                      </div>
                      <button className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-3 py-1 rounded text-xs font-medium">
                        Download
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <BarChart className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium">Excel Report</span>
                      </div>
                      <button className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white px-3 py-1 rounded text-xs font-medium">
                        Download
                      </button>
                    </div>
                  </div>

                  {/* HMRC Compliance */}
                  <div className="mt-4 p-3 bg-uk-green-50 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-uk-green-600" />
                    <span className="text-sm text-uk-green-700 font-medium">HMRC Compliant</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative mb-8">
                <div className="w-16 h-16 bg-uk-blue-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-lg">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-uk-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 text-center lg:text-left">
                Download & Use
              </h3>
              <p className="text-lg text-gray-600 mb-6 text-center lg:text-left">
                Export your converted data in your preferred format. All exports are HMRC compliant
                and ready for your accounting software or tax submissions.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-uk-green-600" />
                  <span>HMRC compliant</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-uk-green-600" />
                  <span>Multiple formats</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}