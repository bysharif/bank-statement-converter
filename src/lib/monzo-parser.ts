/**
 * Monzo Bank Statement Parser
 * Handles Monzo's specific PDF format with proper transaction extraction
 */

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
  balance?: number
}

export interface ParsedMonzoStatement {
  transactions: Transaction[]
  accountNumber?: string
  sortCode?: string
  accountHolder?: string
  statementPeriod?: string
}

/**
 * Parse Monzo bank statement from extracted PDF text
 * Monzo format: Date (DD/MM/YYYY), Description, Amount (GBP), Balance
 */
export function parseMonzoStatement(text: string): ParsedMonzoStatement {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  console.log('🏦 Starting Monzo statement parsing...')
  console.log(`📄 Total lines to process: ${lines.length}`)

  const transactions: Transaction[] = []
  const metadata: ParsedMonzoStatement = { transactions: [] }

  // Extract account metadata
  for (let i = 0; i < Math.min(50, lines.length); i++) {
    const line = lines[i]
    
    // Sort code: 04-00-04
    if (line.includes('Sort code:')) {
      const sortCodeMatch = line.match(/Sort code:\s*(\d{2}-\d{2}-\d{2})/)
      if (sortCodeMatch) {
        metadata.sortCode = sortCodeMatch[1]
        console.log(`🔢 Sort code: ${metadata.sortCode}`)
      }
    }
    
    // Account number: 29194441
    if (line.includes('Account number:')) {
      const accountMatch = line.match(/Account number:\s*(\d+)/)
      if (accountMatch) {
        metadata.accountNumber = accountMatch[1]
        console.log(`🔢 Account number: ${metadata.accountNumber}`)
      }
    }

    // Statement period
    if (line.match(/\d{2}\/\d{2}\/\d{4}\s*-\s*\d{2}\/\d{2}\/\d{4}/)) {
      metadata.statementPeriod = line
      console.log(`📅 Statement period: ${metadata.statementPeriod}`)
    }
  }

  let transactionId = 1
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip header/footer lines
    if (shouldSkipLine(line)) {
      i++
      continue
    }

    // Look for transaction lines starting with a date: DD/MM/YYYY
    const dateMatch = line.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
    
    if (dateMatch) {
      const [, day, month, year] = dateMatch
      const date = `${year}-${month}-${day}`
      
      // The description is on the same line after the date
      let description = line.substring(10).trim() // Skip the date part
      
      // Look ahead for the amount (usually on the next line or same line)
      let amount: number | null = null
      let balance: number | null = null
      let isCredit = false
      
      // Check if amount is on the same line
      const sameLine = line.match(/(-?\d+\.\d{2})\s+(-?\d+\.\d{2})$/)
      if (sameLine) {
        amount = parseFloat(sameLine[1])
        balance = parseFloat(sameLine[2])
        // Remove amount from description
        description = line.substring(10, line.lastIndexOf(sameLine[0])).trim()
      } else {
        // Look in next few lines for amount and balance
        for (let j = 1; j <= 3 && (i + j) < lines.length; j++) {
          const nextLine = lines[i + j]
          
          // Skip lines that look like dates (another transaction)
          if (nextLine.match(/^\d{2}\/\d{2}\/\d{4}/)) {
            break
          }
          
          // Look for amount pattern: -12.00 or 10.00
          const amountMatch = nextLine.match(/^(-?\d+\.\d{2})\s+(-?\d+\.\d{2})$/)
          if (amountMatch) {
            amount = parseFloat(amountMatch[1])
            balance = parseFloat(amountMatch[2])
            break
          }
          
          // If no amount yet, this might be part of description
          if (!amount && !shouldSkipLine(nextLine)) {
            description += ' ' + nextLine
          }
        }
      }

      if (amount !== null) {
        // Determine transaction type
        // Negative amounts are debits, positive are credits
        isCredit = amount > 0
        const absAmount = Math.abs(amount)

        // Clean up description
        description = cleanDescription(description)

        transactions.push({
          id: transactionId.toString(),
          date,
          description,
          amount: absAmount,
          type: isCredit ? 'credit' : 'debit',
          balance: balance ?? undefined
        })

        console.log(`✅ Transaction #${transactionId}: ${date} | ${description.substring(0, 40)}... | ${isCredit ? '+' : '-'}£${absAmount.toFixed(2)}`)
        transactionId++
      }
    }

    i++
  }

  console.log(`\n📊 Monzo parsing complete:`)
  console.log(`   Total transactions: ${transactions.length}`)
  console.log(`   Account: ${metadata.sortCode} / ${metadata.accountNumber}`)
  
  if (transactions.length > 0) {
    console.log(`   First transaction: ${transactions[0].date} - ${transactions[0].description.substring(0, 30)}`)
    console.log(`   Last transaction: ${transactions[transactions.length - 1].date} - ${transactions[transactions.length - 1].description.substring(0, 30)}`)
  }

  metadata.transactions = transactions
  return metadata
}

/**
 * Clean up transaction description
 */
function cleanDescription(desc: string): string {
  return desc
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/\s*\(GBP\)\s*/g, '') // Remove (GBP) markers
    .replace(/\s*Amount\s*\(GBP\)\s*/g, '') // Remove column headers
    .replace(/\s*Balance\s*/g, '')
    .substring(0, 200) // Limit length
}

/**
 * Check if a line should be skipped during parsing
 */
function shouldSkipLine(line: string): boolean {
  if (!line || line.length < 3) return true
  
  const skipPatterns = [
    /^Monzo Bank/i,
    /^Personal Account statement/i,
    /^Sort code:/i,
    /^Account number:/i,
    /^BIC:/i,
    /^IBAN:/i,
    /^Registered Office:/i,
    /^Financial Services/i,
    /^Date\s+Description/i,
    /^Total balance/i,
    /^Total outgoings/i,
    /^Total deposits/i,
    /^Page \d+/i,
    /^monzo\.com/i,
    /^Flat \d/i,
    /^London/i,
    /^United Kingdom/i,
    /^W\d{1,2}\s+\d[A-Z]{2}$/i, // Postcodes
    /^\d{2}\/\d{2}\/\d{4}\s*-\s*\d{2}\/\d{2}\/\d{4}$/, // Date ranges
    /^-?£[\d,]+\.\d{2}$/i, // Just amounts
    /^Pot statement/i,
    /^There were no transactions/i
  ]

  return skipPatterns.some(pattern => pattern.test(line))
}

/**
 * Detect if text is from a Monzo statement
 */
export function isMonzoStatement(text: string): boolean {
  const monzoIndicators = [
    /Monzo Bank/i,
    /MONZGB2L/i,
    /Sort code: 04-00-/i,
    /monzo\.com/i,
    /Personal Account statement/i
  ]

  return monzoIndicators.some(pattern => pattern.test(text))
}
