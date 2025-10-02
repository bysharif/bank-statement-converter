'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Eye, ArrowRight, CreditCard } from "lucide-react"

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
  balance?: number
}

interface TransactionPreviewProps {
  transactions: Transaction[]
  totalTransactions: number
  fileName: string
  onDownloadPreview: () => void
  onUpgrade: () => void
}

export function TransactionPreview({
  transactions,
  totalTransactions,
  fileName,
  onDownloadPreview,
  onUpgrade
}: TransactionPreviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(Math.abs(amount))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Eye className="w-5 h-5 text-uk-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Free Preview</h3>
        </div>
        <p className="text-gray-600">
          Showing first 3 transactions from <span className="font-medium">{fileName}</span>
        </p>
        <Badge variant="outline" className="text-sm">
          3 of {totalTransactions} transactions
        </Badge>
      </div>

      {/* Transactions Table */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {transactions.slice(0, 3).map((transaction, index) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.type === 'credit' ? 'bg-uk-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-xs">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-uk-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    {transaction.balance !== undefined && (
                      <p className="text-sm text-gray-500">
                        Bal: {formatCurrency(transaction.balance)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Download Preview of 3 transactions */}
        <Button
          onClick={onDownloadPreview}
          className="w-full bg-uk-blue-600 hover:bg-uk-blue-700 text-white py-3 text-base"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          Download preview CSV (3 transactions)
        </Button>

        {/* Get All Transactions */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-uk-blue-600 to-uk-green-600 rounded-lg p-[1px]">
            <Button
              onClick={onUpgrade}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border-0 py-3 text-base h-full rounded-[7px]"
              variant="outline"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Get all {totalTransactions} transactions
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Upgrade to access all transactions, unlimited conversions, and advanced features
        </p>
      </div>
    </div>
  )
}

