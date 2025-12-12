export interface Transaction {
  date: string
  description: string
  amount: number
  balance?: number
  type: 'debit' | 'credit'
}

export interface ConversionResult {
  transactions: Transaction[]
  summary: {
    totalTransactions: number
    totalCredits: number
    totalDebits: number
    dateRange: {
      from: string
      to: string
    }
  }
  format: 'csv' | 'excel' | 'qif'
  originalFile: string
}

export class BankStatementConverter {
  private static parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  private static detectBankFormat(content: string): string {
    const lines = content.split('\n').slice(0, 5) // Check first 5 lines
    const headers = lines.join(' ').toLowerCase()

    if (headers.includes('hsbc') || headers.includes('reference number')) {
      return 'hsbc'
    }
    if (headers.includes('lloyds') || headers.includes('sort code')) {
      return 'lloyds'
    }
    if (headers.includes('barclays') || headers.includes('account number')) {
      return 'barclays'
    }
    if (headers.includes('natwest') || headers.includes('transaction date')) {
      return 'natwest'
    }
    if (headers.includes('monzo') || headers.includes('merchant')) {
      return 'monzo'
    }

    return 'generic'
  }

  private static parseTransactions(content: string, format: string): Transaction[] {
    const lines = content.split('\n').filter(line => line.trim())
    const transactions: Transaction[] = []

    // Skip header rows (typically first 1-3 rows depending on bank)
    const dataStartIndex = format === 'monzo' ? 1 : 2

    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      try {
        const transaction = this.parseTransactionLine(line, format)
        if (transaction) {
          transactions.push(transaction)
        }
      } catch (error) {
        console.warn(`Failed to parse line ${i}: ${line}`, error)
      }
    }

    return transactions
  }

  private static parseTransactionLine(line: string, format: string): Transaction | null {
    const fields = this.parseCSVLine(line)

    if (fields.length < 3) return null

    try {
      switch (format) {
        case 'hsbc':
          return this.parseHSBCTransaction(fields)
        case 'lloyds':
          return this.parseLloydsTransaction(fields)
        case 'barclays':
          return this.parseBarclaysTransaction(fields)
        case 'natwest':
          return this.parseNatWestTransaction(fields)
        case 'monzo':
          return this.parseMonzoTransaction(fields)
        default:
          return this.parseGenericTransaction(fields)
      }
    } catch (error) {
      return null
    }
  }

  private static parseHSBCTransaction(fields: string[]): Transaction | null {
    // HSBC format: Date, Description, Amount, Balance
    if (fields.length < 3) return null

    const [dateStr, description, amountStr, balanceStr] = fields
    const amount = parseFloat(amountStr.replace(/[£,]/g, ''))

    return {
      date: this.normalizeDate(dateStr),
      description: description.replace(/"/g, ''),
      amount: Math.abs(amount),
      balance: balanceStr ? parseFloat(balanceStr.replace(/[£,]/g, '')) : undefined,
      type: amount < 0 ? 'debit' : 'credit'
    }
  }

  private static parseLloydsTransaction(fields: string[]): Transaction | null {
    // Lloyds format: Date, Type, Description, Amount, Balance
    if (fields.length < 4) return null

    const [dateStr, type, description, amountStr, balanceStr] = fields
    const amount = parseFloat(amountStr.replace(/[£,]/g, ''))

    return {
      date: this.normalizeDate(dateStr),
      description: `${type}: ${description}`.replace(/"/g, ''),
      amount: Math.abs(amount),
      balance: balanceStr ? parseFloat(balanceStr.replace(/[£,]/g, '')) : undefined,
      type: amount < 0 ? 'debit' : 'credit'
    }
  }

  private static parseBarclaysTransaction(fields: string[]): Transaction | null {
    // Barclays format: Date, Memo, Amount
    if (fields.length < 3) return null

    const [dateStr, description, amountStr] = fields
    const amount = parseFloat(amountStr.replace(/[£,]/g, ''))

    return {
      date: this.normalizeDate(dateStr),
      description: description.replace(/"/g, ''),
      amount: Math.abs(amount),
      type: amount < 0 ? 'debit' : 'credit'
    }
  }

  private static parseNatWestTransaction(fields: string[]): Transaction | null {
    // NatWest format: Date, Type, Description, Value, Balance
    if (fields.length < 4) return null

    const [dateStr, type, description, amountStr, balanceStr] = fields
    const amount = parseFloat(amountStr.replace(/[£,]/g, ''))

    return {
      date: this.normalizeDate(dateStr),
      description: `${type}: ${description}`.replace(/"/g, ''),
      amount: Math.abs(amount),
      balance: balanceStr ? parseFloat(balanceStr.replace(/[£,]/g, '')) : undefined,
      type: amount < 0 ? 'debit' : 'credit'
    }
  }

  private static parseMonzoTransaction(fields: string[]): Transaction | null {
    // Monzo format: Date, Time, Type, Name/Description, Amount, Balance
    if (fields.length < 5) return null

    const [dateStr, timeStr, type, description, amountStr, balanceStr] = fields
    const amount = parseFloat(amountStr.replace(/[£,]/g, ''))

    return {
      date: this.normalizeDate(dateStr),
      description: description.replace(/"/g, ''),
      amount: Math.abs(amount),
      balance: balanceStr ? parseFloat(balanceStr.replace(/[£,]/g, '')) : undefined,
      type: amount < 0 ? 'debit' : 'credit'
    }
  }

  private static parseGenericTransaction(fields: string[]): Transaction | null {
    // Generic format: assume Date, Description, Amount
    if (fields.length < 3) return null

    const [dateStr, description, amountStr] = fields
    const amount = parseFloat(amountStr.replace(/[£,$,]/g, ''))

    if (isNaN(amount)) return null

    return {
      date: this.normalizeDate(dateStr),
      description: description.replace(/"/g, ''),
      amount: Math.abs(amount),
      type: amount < 0 ? 'debit' : 'credit'
    }
  }

  private static normalizeDate(dateStr: string): string {
    // Handle various date formats
    const cleaned = dateStr.replace(/"/g, '').trim()

    // Try parsing different formats
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // DD/MM/YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
      /(\d{1,2})-(\d{1,2})-(\d{4})/, // DD-MM-YYYY
    ]

    for (const format of formats) {
      const match = cleaned.match(format)
      if (match) {
        const [, part1, part2, part3] = match

        // Determine if it's DD/MM/YYYY or YYYY-MM-DD
        if (part3.length === 4) {
          // DD/MM/YYYY or DD-MM-YYYY
          return `${part3}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`
        } else {
          // YYYY-MM-DD
          return `${part1}-${part2.padStart(2, '0')}-${part3.padStart(2, '0')}`
        }
      }
    }

    return cleaned // Return as-is if can't parse
  }

  public static async convertFile(file: File, outputFormat: 'csv' | 'excel' | 'qif' = 'csv'): Promise<ConversionResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const bankFormat = this.detectBankFormat(content)
          const transactions = this.parseTransactions(content, bankFormat)

          if (transactions.length === 0) {
            throw new Error('No transactions found in the file')
          }

          // Calculate summary
          const totalCredits = transactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0)

          const totalDebits = transactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0)

          const dates = transactions.map(t => t.date).sort()

          const result: ConversionResult = {
            transactions,
            summary: {
              totalTransactions: transactions.length,
              totalCredits,
              totalDebits,
              dateRange: {
                from: dates[0],
                to: dates[dates.length - 1]
              }
            },
            format: outputFormat,
            originalFile: file.name
          }

          resolve(result)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsText(file)
    })
  }

  public static exportToCSV(result: ConversionResult): string {
    const headers = ['Date', 'Description', 'Debit', 'Credit']
    const rows = [headers.join(',')]

    result.transactions.forEach(transaction => {
      const debit = transaction.type === 'debit' ? transaction.amount.toFixed(2) : ''
      const credit = transaction.type === 'credit' ? transaction.amount.toFixed(2) : ''
      const description = transaction.description.includes(',') 
        ? `"${transaction.description}"` 
        : transaction.description
      
      const row = [
        transaction.date,
        description,
        debit,
        credit
      ]
      rows.push(row.join(','))
    })

    return rows.join('\n')
  }

  public static exportToQIF(result: ConversionResult): string {
    let qif = '!Type:Bank\n'

    result.transactions.forEach(transaction => {
      qif += `D${transaction.date}\n`
      qif += `T${transaction.type === 'debit' ? '-' : ''}${transaction.amount.toFixed(2)}\n`
      qif += `P${transaction.description}\n`
      qif += '^\n'
    })

    return qif
  }

  public static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  }
}