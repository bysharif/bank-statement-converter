export interface Transaction {
  date: string
  description: string
  transactionId?: string
  amount: number
  balance: number
  type: 'Credit' | 'Debit'
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

// PDF processing interface
interface PDFParseResult {
  text: string
  error?: string
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

  protected static parseTransactions(content: string): Transaction[] {
    // Import parsers
    const { WiseParser } = require('./parsers/wise-parser')
    const { GenericParser } = require('./parsers/generic-parser')

    const PARSERS = [
      WiseParser,
      GenericParser // Must be last - it's the fallback
    ]

    console.log('=== BANK STATEMENT PARSER ===')
    console.log(`Content length: ${content.length} characters`)

    // Find appropriate parser
    const parser = PARSERS.find(p => p.identify(content))
    console.log(`Using parser: ${parser.name}`)

    // Parse transactions
    const transactions = parser.parse(content)
    console.log(`Parsed ${transactions.length} transactions with ${parser.name} parser`)

    return transactions
  }


  private static parseTransactionLine(line: string, format: string): Transaction | null {
    const fields = this.parseCSVLine(line)

    if (fields.length < 3) return null

    try {
      switch (format) {
        case 'wise':
          return this.parseWiseTransaction(fields)
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

  private static parseWiseTransaction(fields: string[]): Transaction | null {
    // Wise format: Description | Incoming | Outgoing | Balance
    // Multi-line format where next line may contain date and transaction ID
    if (fields.length < 4) return null

    const [description, incoming, outgoing, balance] = fields

    // Parse amounts (handle commas and empty fields)
    const incomingAmount = incoming ? parseFloat(incoming.replace(/[£,\s]/g, '')) : 0
    const outgoingAmount = outgoing ? parseFloat(outgoing.replace(/[£,\s-]/g, '')) : 0
    const balanceAmount = balance ? parseFloat(balance.replace(/[£,\s]/g, '')) : undefined

    // Determine the transaction amount and type
    let amount = 0
    let type: 'Debit' | 'Credit' = 'Debit'

    if (incomingAmount && incomingAmount > 0) {
      amount = incomingAmount
      type = 'Credit'
    } else if (outgoingAmount && outgoingAmount > 0) {
      amount = outgoingAmount
      type = 'Debit'
    } else {
      return null // Skip if no valid amount
    }

    // Clean description
    const cleanDescription = description.replace(/"/g, '').trim()

    // Use current date as fallback (will be updated by multi-line parser)
    const currentDate = new Date().toISOString().split('T')[0]

    return {
      date: currentDate,
      description: cleanDescription,
      amount: amount,
      balance: balanceAmount || 0,
      type: type
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
      balance: balanceStr ? parseFloat(balanceStr.replace(/[£,]/g, '')) : 0,
      type: amount < 0 ? 'Debit' : 'Credit'
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
      balance: balanceStr ? parseFloat(balanceStr.replace(/[£,]/g, '')) : 0,
      type: amount < 0 ? 'Debit' : 'Credit'
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
      balance: 0, // Barclays doesn't provide balance in this format
      type: amount < 0 ? 'Debit' : 'Credit'
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
      balance: balanceStr ? parseFloat(balanceStr.replace(/[£,]/g, '')) : 0,
      type: amount < 0 ? 'Debit' : 'Credit'
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
      balance: balanceStr ? parseFloat(balanceStr.replace(/[£,]/g, '')) : 0,
      type: amount < 0 ? 'Debit' : 'Credit'
    }
  }

  private static parseGenericTransaction(fields: string[]): Transaction | null {
    // Generic format: try to identify date, description, and amount fields
    if (fields.length < 3) return null

    let dateStr = ''
    let description = ''
    let amount = 0
    let foundAmount = false

    // Find the amount field (look for numeric values)
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i].replace(/[£,$,\s]/g, '')
      const numValue = parseFloat(field)
      if (!isNaN(numValue) && numValue !== 0) {
        amount = numValue
        foundAmount = true
        // Remove amount field and use remaining fields for date and description
        const remainingFields = fields.filter((_, index) => index !== i)
        if (remainingFields.length >= 2) {
          dateStr = remainingFields[0]
          description = remainingFields.slice(1).join(' ')
        }
        break
      }
    }

    if (!foundAmount) return null

    // Fallback to original format if amount detection fails
    if (!dateStr) {
      dateStr = fields[0]
      description = fields.slice(1, -1).join(' ')
      const lastField = fields[fields.length - 1].replace(/[£,$,\s]/g, '')
      amount = parseFloat(lastField)
    }

    if (isNaN(amount)) return null

    try {
      return {
        date: this.normalizeDate(dateStr),
        description: description.replace(/"/g, ''),
        amount: Math.abs(amount),
        balance: 0, // Generic parser doesn't provide balance
        type: amount < 0 ? 'Debit' : 'Credit'
      }
    } catch (error) {
      return null
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

  // PDF processing is handled server-side only
  private static async extractTextFromPDF(file: File): Promise<PDFParseResult> {
    return {
      text: '',
      error: 'PDF processing must be done server-side. Use the async upload endpoint instead.'
    }
  }

  public static async convertFile(file: File, outputFormat: 'csv' | 'excel' | 'qif' = 'csv'): Promise<ConversionResult> {
    try {
      let content: string

      // Check if file is PDF - client-side cannot process PDFs
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('PDF files must be processed using the server-side upload API. Please use the async upload feature.')
      }

      // Handle CSV and other text files only
      content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
          resolve(e.target?.result as string)
        }

        reader.onerror = () => {
          reject(new Error('Failed to read file'))
        }

        reader.readAsText(file)
      })

      const transactions = this.parseTransactions(content)

      if (transactions.length === 0) {
        throw new Error('No transactions found in the file. Please ensure the file contains valid bank statement data.')
      }

      // Calculate summary
      const totalCredits = transactions
        .filter(t => t.type === 'Credit')
        .reduce((sum, t) => sum + t.amount, 0)

      const totalDebits = transactions
        .filter(t => t.type === 'Debit')
        .reduce((sum, t) => Math.abs(sum + t.amount), 0)

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

      return result
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error occurred during file conversion')
    }
  }

  public static exportToCSV(result: ConversionResult): string {
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Balance']
    const rows = [headers.join(',')]

    result.transactions.forEach(transaction => {
      const row = [
        transaction.date,
        `"${transaction.description}"`,
        transaction.amount.toFixed(2),
        transaction.type,
        transaction.balance?.toFixed(2) || ''
      ]
      rows.push(row.join(','))
    })

    return rows.join('\n')
  }

  public static exportToQIF(result: ConversionResult): string {
    let qif = '!Type:Bank\n'

    result.transactions.forEach(transaction => {
      qif += `D${transaction.date}\n`
      qif += `T${transaction.type === 'Debit' ? '-' : ''}${transaction.amount.toFixed(2)}\n`
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