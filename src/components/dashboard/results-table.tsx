'use client'

import { useState } from 'react'
import { Download, FileText, CheckCircle, Upload, BarChart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ResultsTableProps {
  data: {
    transactions: number
    totalValue: number
    timeProcessed: string
    accuracy: number
    duplicatesRemoved: number
    categorized: number
  }
  onNewUpload: () => void
}

export function ResultsTable({ data, onNewUpload }: ResultsTableProps) {
  const [selectedFormat, setSelectedFormat] = useState('csv')

  // Mock transaction data
  const sampleTransactions = [
    { id: 1, date: '2024-03-15', description: 'TESCO STORES 3456', amount: -45.67, category: 'Groceries', balance: 2543.21 },
    { id: 2, date: '2024-03-14', description: 'SALARY PAYMENT', amount: 2500.00, category: 'Income', balance: 2588.88 },
    { id: 3, date: '2024-03-14', description: 'AMAZON PAYMENT', amount: -29.99, category: 'Shopping', balance: 88.88 },
    { id: 4, date: '2024-03-13', description: 'SHELL PETROL', amount: -52.34, category: 'Transport', balance: 118.87 },
    { id: 5, date: '2024-03-12', description: 'TRANSFER FROM SAVINGS', amount: 500.00, category: 'Transfer', balance: 171.21 }
  ]

  const handleDownload = (format: string) => {
    // Mock download functionality
    const filename = `bank_statement_converted.${format}`
    console.log(`Downloading ${filename}`)
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-uk-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-uk-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Processing Complete!</h2>
              <p className="text-gray-600">Your bank statement has been successfully converted</p>
            </div>
          </div>
          <Button onClick={onNewUpload} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            New Upload
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-uk-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-uk-blue-600">{data.transactions.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Transactions</div>
          </div>
          <div className="bg-uk-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-uk-green-600">£{data.totalValue.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Total Value</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-700">{data.timeProcessed}</div>
            <div className="text-xs text-gray-600">Time Taken</div>
          </div>
          <div className="bg-uk-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-uk-green-600">{data.accuracy}%</div>
            <div className="text-xs text-gray-600">Accuracy</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{data.duplicatesRemoved}</div>
            <div className="text-xs text-gray-600">Duplicates</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{data.categorized}</div>
            <div className="text-xs text-gray-600">Categorized</div>
          </div>
        </div>

        {/* Export Options */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Your Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-uk-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-uk-blue-600" />
                  <span className="font-medium text-gray-900">CSV File</span>
                </div>
                <Badge variant="outline" className="text-xs">Recommended</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">Standard format compatible with Excel, Google Sheets, and most accounting software.</p>
              <Button
                onClick={() => handleDownload('csv')}
                className="w-full bg-uk-blue-600 hover:bg-uk-blue-700"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:border-uk-green-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-uk-green-600" />
                  <span className="font-medium text-gray-900">QIF File</span>
                </div>
                <Badge variant="success" className="text-xs">HMRC Ready</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">Quicken format ideal for QuickBooks, Sage, and tax preparation software.</p>
              <Button
                onClick={() => handleDownload('qif')}
                className="w-full bg-uk-green-600 hover:bg-uk-green-700"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download QIF
              </Button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <BarChart className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Excel Report</span>
                </div>
                <Badge variant="outline" className="text-xs">Analytics</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">Detailed Excel report with charts, summaries, and categorized breakdowns.</p>
              <Button
                onClick={() => handleDownload('xlsx')}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Excel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Transaction Preview</h3>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Showing 5 of {data.transactions} transactions</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Balance</th>
              </tr>
            </thead>
            <tbody>
              {sampleTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{transaction.date}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{transaction.description}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-xs">
                      {transaction.category}
                    </Badge>
                  </td>
                  <td className={`py-3 px-4 text-sm text-right font-medium ${
                    transaction.amount > 0 ? 'text-uk-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}£{Math.abs(transaction.amount).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900">
                    £{transaction.balance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-center">
          <Button variant="outline" size="sm">
            View All Transactions
          </Button>
        </div>
      </div>

      {/* HMRC Compliance Notice */}
      <div className="bg-uk-green-50 rounded-lg p-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-uk-green-600" />
        <div className="text-sm">
          <p className="font-medium text-uk-green-900">HMRC Compliant Export</p>
          <p className="text-uk-green-700">All export formats meet HMRC requirements for digital record keeping and tax submissions.</p>
        </div>
      </div>
    </div>
  )
}