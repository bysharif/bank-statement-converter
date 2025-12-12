// CSV Utilities for Bank Statement Converter

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
  balance?: number
}

export interface ParsedBankStatement {
  transactions: Transaction[]
  fileName: string
  totalTransactions: number
}

/**
 * Generate CSV content with separate Debit and Credit columns
 * Format: Date, Description, Debit, Credit
 */
export function generateCSVContent(transactions: Transaction[]): string {
  const headers = ['Date', 'Description', 'Debit', 'Credit']

  const rows = transactions.map(transaction => {
    const debit = transaction.type === 'debit' ? transaction.amount.toFixed(2) : ''
    const credit = transaction.type === 'credit' ? transaction.amount.toFixed(2) : ''
    const description = transaction.description.includes(',')
      ? `"${transaction.description.replace(/"/g, '""')}"` 
      : transaction.description.replace(/"/g, '""')
    
    return [
      transaction.date,
      description,
      debit,
      credit
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
