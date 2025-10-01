'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Brain, Upload, Download, Zap, CheckCircle, AlertCircle } from 'lucide-react'

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
  category?: string
  subcategory?: string
  tax_category?: string
  business_relevance?: 'business' | 'personal' | 'mixed'
  confidence?: number
}

interface CategorisationResult {
  transactions: Transaction[]
  summary: {
    total_transactions: number
    business_expenses: number
    personal_expenses: number
    income: number
    tax_deductible: number
  }
  categories_used: string[]
}

export default function AICategorisation() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<CategorisationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [customInstructions, setCustomInstructions] = useState('')
  const [businessType, setBusinessType] = useState('')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setResult(null)
      setError(null)
    }
  }

  const handleCategorise = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('businessType', businessType)
      formData.append('customInstructions', customInstructions)

      const response = await fetch('/api/ai-categorise', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to categorise transactions')
      }

      const data = await response.json()
      setResult(data.result)
    } catch (error) {
      console.error('Categorisation failed:', error)
      setError(error instanceof Error ? error.message : 'Categorisation failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const exportResults = (format: 'csv' | 'excel') => {
    if (!result) return

    // Create downloadable file with categorised transactions
    const csvContent = [
      ['Date', 'Description', 'Amount', 'Type', 'Category', 'Subcategory', 'Tax Category', 'Business Relevance', 'Confidence'],
      ...result.transactions.map(t => [
        t.date,
        t.description,
        t.amount.toString(),
        t.type,
        t.category || '',
        t.subcategory || '',
        t.tax_category || '',
        t.business_relevance || '',
        t.confidence?.toString() || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `categorised_transactions_${new Date().toISOString().split('T')[0]}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'office_expenses': 'bg-blue-100 text-blue-800',
      'travel': 'bg-green-100 text-green-800',
      'marketing': 'bg-purple-100 text-purple-800',
      'professional_services': 'bg-orange-100 text-orange-800',
      'utilities': 'bg-yellow-100 text-yellow-800',
      'income': 'bg-emerald-100 text-emerald-800',
      'personal': 'bg-gray-100 text-gray-800',
      'default': 'bg-slate-100 text-slate-800'
    }
    return colors[category] || colors.default
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Bank Statement Converter
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>AI Categorisation</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-4 px-4">
            <Badge variant="outline" className="capitalize">
              Free Plan
            </Badge>
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-blue-600" />
                AI-Powered Transaction Categorisation
              </CardTitle>
              <CardDescription>
                Automatically categorise your bank transactions according to UK tax law and business accounting standards.
                Our AI analyzes transaction descriptions and amounts to provide accurate categorisation for tax returns and accounting.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Upload and Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Transaction Data</CardTitle>
                <CardDescription>
                  Upload your bank statement CSV or converted transaction file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Select File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>
                  Customise the categorisation for your specific business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="business-type">Business Type</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sole_trader">Sole Trader</SelectItem>
                      <SelectItem value="limited_company">Limited Company</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="freelancer">Freelancer/Consultant</SelectItem>
                      <SelectItem value="retail">Retail Business</SelectItem>
                      <SelectItem value="professional_services">Professional Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="custom-instructions">Custom Instructions (Optional)</Label>
                  <Textarea
                    id="custom-instructions"
                    placeholder="Any specific categorisation requirements for your business..."
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleCategorise}
                  disabled={!selectedFile || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Zap className="h-4 w-4 mr-2 animate-pulse" />
                      Categorising...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Categorise Transactions
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && (
            <>
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Categorisation Complete
                  </CardTitle>
                  <CardDescription>
                    {result.summary.total_transactions} transactions categorised with AI assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        £{result.summary.business_expenses.toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground">Business Expenses</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        £{result.summary.income.toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground">Income</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        £{result.summary.tax_deductible.toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground">Tax Deductible</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        £{result.summary.personal_expenses.toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground">Personal</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => exportResults('csv')} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button onClick={() => exportResults('excel')} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Transactions Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Categorised Transactions</CardTitle>
                  <CardDescription>
                    Review and adjust the AI categorisation before exporting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Description</th>
                          <th className="text-right p-2">Amount</th>
                          <th className="text-left p-2">Category</th>
                          <th className="text-left p-2">Business Type</th>
                          <th className="text-center p-2">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.transactions.slice(0, 20).map((transaction) => (
                          <tr key={transaction.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">{new Date(transaction.date).toLocaleDateString('en-GB')}</td>
                            <td className="p-2 max-w-xs truncate">{transaction.description}</td>
                            <td className="p-2 text-right font-mono">
                              <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                                {transaction.type === 'credit' ? '+' : '-'}£{Math.abs(transaction.amount).toFixed(2)}
                              </span>
                            </td>
                            <td className="p-2">
                              <Badge className={getCategoryColor(transaction.category || 'default')}>
                                {transaction.category?.replace('_', ' ') || 'Uncategorised'}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge variant="outline">
                                {transaction.business_relevance || 'Unknown'}
                              </Badge>
                            </td>
                            <td className="p-2 text-center">
                              <div className="flex items-center justify-center">
                                <div className={`h-2 w-12 rounded-full ${
                                  (transaction.confidence || 0) > 0.8 ? 'bg-green-500' :
                                  (transaction.confidence || 0) > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{
                                  background: `linear-gradient(to right, currentColor ${(transaction.confidence || 0) * 100}%, #e5e7eb ${(transaction.confidence || 0) * 100}%)`
                                }} />
                                <span className="ml-2 text-xs">{((transaction.confidence || 0) * 100).toFixed(0)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {result.transactions.length > 20 && (
                      <p className="text-center text-muted-foreground mt-4">
                        Showing first 20 transactions. Export to see all {result.transactions.length} transactions.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Features Info */}
          <Card>
            <CardHeader>
              <CardTitle>AI Categorisation Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">UK Tax Compliance</h4>
                  <p className="text-sm text-muted-foreground">
                    Categories aligned with HMRC guidelines and UK tax law for accurate reporting.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Business vs Personal</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically identifies business expenses vs personal spending for tax deduction purposes.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Confidence Scoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Each categorisation includes a confidence score so you can review uncertain classifications.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Custom Categories</h4>
                  <p className="text-sm text-muted-foreground">
                    Supports industry-specific categorisation based on your business type and requirements.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Export Ready</h4>
                  <p className="text-sm text-muted-foreground">
                    Export categorised data directly to your accounting software or tax preparation tools.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Privacy First</h4>
                  <p className="text-sm text-muted-foreground">
                    Your financial data is processed securely and never stored permanently.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}