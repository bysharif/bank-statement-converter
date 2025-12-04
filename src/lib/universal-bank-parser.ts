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
  bankName: string
  accountNumber?: string
  sortCode?: string
  detectedFormat: string
}

export interface BankDetectionResult {
  bankName: string
  confidence: number
  format: string
  indicators: string[]
}

// Bank detection patterns with confidence scoring
const BANK_PATTERNS = {
  wise: {
    name: 'Wise',
    indicators: [
      { pattern: /Wise Payments Ltd/i, weight: 10 },
      { pattern: /TRWI[A-Z0-9]+/i, weight: 8 },
      { pattern: /Sent money to|Received money from/i, weight: 6 },
      { pattern: /Transaction: TRANSFER-/i, weight: 8 },
      { pattern: /Card ending in \d{4}/i, weight: 7 },
      { pattern: /Swift\/BIC/i, weight: 5 }
    ]
  },
  barclays: {
    name: 'Barclays',
    indicators: [
      { pattern: /Barclays Bank/i, weight: 10 },
      { pattern: /BUKBGB/i, weight: 8 },
      { pattern: /Direct Debit|Standing Order/i, weight: 6 },
      { pattern: /\d{2} [A-Z]{3} \d{4}/i, weight: 5 }, // Date format: 03 APR 2023
      { pattern: /Balance B\/F|Balance C\/F/i, weight: 7 },
      { pattern: /BACS|FPI|BGC/i, weight: 6 }
    ]
  },
  hsbc: {
    name: 'HSBC',
    indicators: [
      { pattern: /HSBC Bank/i, weight: 10 },
      { pattern: /MIDLGB/i, weight: 8 },
      { pattern: /Sort Code/i, weight: 5 },
      { pattern: /HSBC UK Bank plc/i, weight: 9 },
      { pattern: /Debit Card|Credit Card/i, weight: 4 },
      { pattern: /\d{2}-\d{2}-\d{2}/i, weight: 6 } // Sort code format
    ]
  },
  lloyds: {
    name: 'Lloyds',
    indicators: [
      { pattern: /Lloyds Bank/i, weight: 10 },
      { pattern: /LOYDGB/i, weight: 8 },
      { pattern: /Halifax|Bank of Scotland/i, weight: 9 },
      { pattern: /TSB Bank/i, weight: 9 },
      { pattern: /Club Lloyds/i, weight: 7 },
      { pattern: /FASTER PAYMENT/i, weight: 6 }
    ]
  },
  natwest: {
    name: 'NatWest',
    indicators: [
      { pattern: /NatWest Bank/i, weight: 10 },
      { pattern: /Royal Bank of Scotland|RBS/i, weight: 10 },
      { pattern: /NWBKGB/i, weight: 8 },
      { pattern: /Ulster Bank/i, weight: 9 },
      { pattern: /Chip & PIN/i, weight: 5 },
      { pattern: /CPM|CPA|DEB/i, weight: 6 }
    ]
  },
  santander: {
    name: 'Santander',
    indicators: [
      { pattern: /Santander/i, weight: 10 },
      { pattern: /ABBYGB/i, weight: 8 },
      { pattern: /Abbey National/i, weight: 9 },
      { pattern: /SANTANDER UK/i, weight: 9 },
      { pattern: /Cash withdrawal/i, weight: 4 },
      { pattern: /123 Account/i, weight: 7 }
    ]
  },
  monzo: {
    name: 'Monzo',
    indicators: [
      { pattern: /Monzo Bank/i, weight: 10 },
      { pattern: /MONZGB/i, weight: 8 },
      { pattern: /Current Account|Joint Account/i, weight: 5 },
      { pattern: /Pot transfer|Round up/i, weight: 8 },
      { pattern: /monzo\.com/i, weight: 7 },
      { pattern: /Sort code: 04-00-/i, weight: 9 }
    ]
  },
  starling: {
    name: 'Starling',
    indicators: [
      { pattern: /Starling Bank/i, weight: 10 },
      { pattern: /SRLGGB/i, weight: 8 },
      { pattern: /Personal Current Account/i, weight: 6 },
      { pattern: /Sort code: 60-83-/i, weight: 9 },
      { pattern: /starlingbank\.com/i, weight: 7 },
      { pattern: /Goals|Spaces/i, weight: 6 }
    ]
  },
  revolut: {
    name: 'Revolut',
    indicators: [
      { pattern: /Revolut Ltd/i, weight: 10 },
      { pattern: /REVOGB/i, weight: 8 },
      { pattern: /revolut\.com/i, weight: 7 },
      { pattern: /Sort code: 04-01-/i, weight: 9 },
      { pattern: /Card payment|Top up/i, weight: 5 },
      { pattern: /Exchange|Vault/i, weight: 6 }
    ]
  },
  firstdirect: {
    name: 'First Direct',
    indicators: [
      { pattern: /First Direct/i, weight: 10 },
      { pattern: /firstdirect/i, weight: 9 },
      { pattern: /MIDLGB2L/i, weight: 8 },
      { pattern: /40-40-/i, weight: 7 }, // Sort code prefix
      { pattern: /Online Banking|Internet Banking/i, weight: 5 },
      { pattern: /Debit Card Payment/i, weight: 6 }
    ]
  },
  metrobank: {
    name: 'Metro Bank',
    indicators: [
      { pattern: /Metro Bank/i, weight: 10 },
      { pattern: /METRGB/i, weight: 8 },
      { pattern: /23-05-/i, weight: 7 }, // Sort code prefix
      { pattern: /PCM|BACS|FPS/i, weight: 6 },
      { pattern: /Contactless/i, weight: 5 },
      { pattern: /Store Card|Commercial Card/i, weight: 4 }
    ]
  },
  cooperative: {
    name: 'Co-operative Bank',
    indicators: [
      { pattern: /Co-operative Bank|Co-op Bank/i, weight: 10 },
      { pattern: /CPBKGB/i, weight: 8 },
      { pattern: /Unity Trust Bank/i, weight: 8 },
      { pattern: /08-92-/i, weight: 7 }, // Sort code prefix
      { pattern: /Ethical Banking/i, weight: 6 },
      { pattern: /VISA Debit/i, weight: 5 }
    ]
  },
  tsbbank: {
    name: 'TSB Bank',
    indicators: [
      { pattern: /TSB Bank/i, weight: 10 },
      { pattern: /TSBSGB/i, weight: 8 },
      { pattern: /77-/i, weight: 6 }, // Sort code prefix
      { pattern: /Local Banking/i, weight: 5 },
      { pattern: /TSB Classic Account/i, weight: 7 },
      { pattern: /Debit Card Transaction/i, weight: 4 }
    ]
  },
  nationwide: {
    name: 'Nationwide Building Society',
    indicators: [
      { pattern: /Nationwide Building Society/i, weight: 10 },
      { pattern: /Nationwide/i, weight: 8 },
      { pattern: /NAIAGB/i, weight: 8 },
      { pattern: /07-01-/i, weight: 7 }, // Sort code prefix
      { pattern: /Building Society/i, weight: 6 },
      { pattern: /FlexAccount|FlexDirect/i, weight: 7 }
    ]
  },
  virginmoney: {
    name: 'Virgin Money',
    indicators: [
      { pattern: /Virgin Money/i, weight: 10 },
      { pattern: /VMUKGB/i, weight: 8 },
      { pattern: /Northern Rock/i, weight: 9 },
      { pattern: /82-62-/i, weight: 7 }, // Sort code prefix
      { pattern: /Clydesdale Bank/i, weight: 8 },
      { pattern: /Yorkshire Bank/i, weight: 8 }
    ]
  },
  mbna: {
    name: 'MBNA',
    indicators: [
      { pattern: /MBNA Limited/i, weight: 10 },
      { pattern: /MBNA/i, weight: 8 },
      { pattern: /Credit Card Statement/i, weight: 9 },
      { pattern: /Purchase|Cash Advance/i, weight: 6 },
      { pattern: /Available Credit/i, weight: 7 },
      { pattern: /Minimum Payment/i, weight: 8 }
    ]
  },
  amex: {
    name: 'American Express',
    indicators: [
      { pattern: /American Express/i, weight: 10 },
      { pattern: /AMEX/i, weight: 8 },
      { pattern: /Card Member/i, weight: 7 },
      { pattern: /Membership Rewards/i, weight: 8 },
      { pattern: /Payment Due Date/i, weight: 6 },
      { pattern: /Reference Number:/i, weight: 5 }
    ]
  },
  tescobank: {
    name: 'Tesco Bank',
    indicators: [
      { pattern: /Tesco Bank/i, weight: 10 },
      { pattern: /TESCGB/i, weight: 8 },
      { pattern: /77-86-/i, weight: 7 }, // Sort code prefix
      { pattern: /Clubcard Points/i, weight: 8 },
      { pattern: /Current Account|Credit Card/i, weight: 5 },
      { pattern: /Every Little Helps/i, weight: 6 }
    ]
  },
  marcus: {
    name: 'Marcus by Goldman Sachs',
    indicators: [
      { pattern: /Marcus by Goldman Sachs/i, weight: 10 },
      { pattern: /Goldman Sachs/i, weight: 8 },
      { pattern: /GSGBGB/i, weight: 8 },
      { pattern: /Online Savings/i, weight: 7 },
      { pattern: /Easy Access Saver/i, weight: 8 },
      { pattern: /No fees, no minimum/i, weight: 6 }
    ]
  },
  caf: {
    name: 'CAF Bank',
    indicators: [
      { pattern: /Charities Aid Foundation/i, weight: 10 },
      { pattern: /CAF Bank/i, weight: 10 },
      { pattern: /CAF Account/i, weight: 9 },
      { pattern: /CAFBGB/i, weight: 8 }, // BIC code
      { pattern: /40-52-40/i, weight: 9 }, // CAF sort code
      { pattern: /charity|charitable/i, weight: 5 },
      { pattern: /Grant|Donation/i, weight: 6 },
      { pattern: /Kings Hill|West Malling/i, weight: 7 }, // CAF address
      { pattern: /25 Kings Hill Avenue/i, weight: 9 },
      { pattern: /CAF Current Account|CAF Cash Account/i, weight: 9 },
      { pattern: /BACS Credit|BACS Debit/i, weight: 5 },
      { pattern: /Faster Payment/i, weight: 4 }
    ]
  }
}

// Enhanced bank detection with confidence scoring
export function detectBankType(text: string): BankDetectionResult {
  const results: Array<{ bank: string; score: number; indicators: string[] }> = []

  for (const [bankKey, bankData] of Object.entries(BANK_PATTERNS)) {
    let score = 0
    const matchedIndicators: string[] = []

    for (const indicator of bankData.indicators) {
      if (indicator.pattern.test(text)) {
        score += indicator.weight
        matchedIndicators.push(indicator.pattern.source)
      }
    }

    if (score > 0) {
      results.push({
        bank: bankKey,
        score,
        indicators: matchedIndicators
      })
    }
  }

  // Sort by confidence score
  results.sort((a, b) => b.score - a.score)

  if (results.length === 0) {
    return {
      bankName: 'unknown',
      confidence: 0,
      format: 'generic',
      indicators: []
    }
  }

  const topResult = results[0]
  const bankData = BANK_PATTERNS[topResult.bank as keyof typeof BANK_PATTERNS]

  return {
    bankName: bankData.name,
    confidence: topResult.score,
    format: topResult.bank,
    indicators: topResult.indicators
  }
}

// Generic transaction extraction patterns
const TRANSACTION_PATTERNS = {
  // Date patterns for different banks
  dates: [
    /(\d{1,2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+(\d{4})/gi,
    /(\d{4})-(\d{2})-(\d{2})/g,
    /(\d{2})\/(\d{2})\/(\d{4})/g,
    /(\d{1,2})\s+([A-Z]{3})\s+(\d{2,4})/gi
  ],

  // Amount patterns
  amounts: [
    /[-+]?(?:£)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    /(\d+\.\d{2})\s*(?:CR|DR)?/gi,
    /(?:£|GBP)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi
  ],

  // Balance patterns
  balances: [
    /(?:Balance|Bal)\s*:?\s*(?:£)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
    /(?:£)?(\d{1,3}(?:,\d{3})*(?:\.\d{2}))\s*(?:Balance|Bal)/gi
  ]
}

// Wise-specific parser (enhanced from existing)
function parseWiseTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let transactionId = 1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Look for Wise transaction patterns
    const wisePatterns = [
      /^(Sent money to|Received money from|Card transaction|Converted|Topped up|No information)/i,
      /Transaction: (TRANSFER-|CARD-|BANK_DETAILS)/i
    ]

    if (wisePatterns.some(pattern => pattern.test(line))) {
      // Extract transaction details from current and next few lines
      const transactionBlock = lines.slice(i, i + 5).join(' ')

      // Extract date
      const dateMatch = transactionBlock.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i)
      if (!dateMatch) continue

      const day = dateMatch[1].padStart(2, '0')
      const month = getMonthNumber(dateMatch[2])
      const year = dateMatch[3]
      const date = `${year}-${month}-${day}`

      // Extract amount and type
      const amountMatch = transactionBlock.match(/[-+]?(\d{1,3}(?:,\d{3})*(?:\.\d{2}))/g)
      if (!amountMatch) continue

      // Determine if debit or credit
      const isDebit = transactionBlock.includes('-') ||
                     line.includes('Sent money') ||
                     line.includes('Card transaction') ||
                     line.includes('No information')

      const amount = parseFloat(amountMatch[0].replace(/[,-]/g, ''))
      const type = isDebit ? 'debit' : 'credit'

      // Extract description
      let description = line.replace(/Transaction:.*$/i, '').trim()
      if (description.length > 100) {
        description = description.substring(0, 100) + '...'
      }

      transactions.push({
        id: transactionId.toString(),
        date,
        description,
        amount,
        type,
        balance: undefined
      })

      transactionId++
      i += 2 // Skip processed lines
    }
  }

  return transactions
}

// Barclays-specific parser - Complete multi-page extraction
function parseBarclaysTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  console.log(`🏦 Processing Barclays PDF with ${lines.length} lines`)
  console.log('First 20 lines of Barclays PDF:')
  lines.slice(0, 20).forEach((line, i) => console.log(`${i + 1}: "${line}"`))

  // Log lines that might indicate pages or sections
  console.log('\n📄 Looking for page indicators:')
  const pageIndicators = lines.filter(line =>
    line.includes('Page ') ||
    line.includes('Continued') ||
    line.includes('SWIFTBIC') ||
    line.includes('End balance') ||
    line.includes('Sort code')
  )
  pageIndicators.forEach((line, i) => console.log(`Page indicator ${i + 1}: "${line}"`))

  // Sample lines from different sections to understand the structure
  console.log('\n📋 Sampling lines from different sections:')
  const sampleSections = [
    { start: 0, end: 50, name: 'Beginning' },
    { start: Math.floor(lines.length * 0.25), end: Math.floor(lines.length * 0.25) + 20, name: 'Quarter' },
    { start: Math.floor(lines.length * 0.5), end: Math.floor(lines.length * 0.5) + 20, name: 'Middle' },
    { start: Math.floor(lines.length * 0.75), end: Math.floor(lines.length * 0.75) + 20, name: 'Three-quarters' },
    { start: lines.length - 50, end: lines.length, name: 'End' }
  ]

  sampleSections.forEach(section => {
    console.log(`\n--- ${section.name} section (lines ${section.start}-${section.end}) ---`)
    const sectionLines = lines.slice(section.start, section.end)
    sectionLines.forEach((line, i) => {
      if (line.trim().length > 0) {
        console.log(`${section.start + i + 1}: "${line}"`)

        // Check if this line looks like a potential transaction we're missing
        if (line.match(/\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i) ||
            line.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/) ||
            line.match(/(debit|credit|payment|transfer|deposit)/i)) {
          console.log(`   ⚠️ POTENTIAL TRANSACTION PATTERN: "${line}"`)
        }
      }
    })
  })

  let transactionId = 1
  // Extract year from statement header (look for date ranges like "01 - 28 Apr 2023")
  let currentYear = 2023
  for (const line of lines.slice(0, 50)) { // Check first 50 lines for statement year
    const yearMatch = line.match(/\b(20\d{2})\b/)
    if (yearMatch) {
      currentYear = parseInt(yearMatch[1])
      console.log(`📅 Extracted statement year: ${currentYear}`)
      break
    }
  }

  // Enhanced processing to handle ALL pages and ALL transactions
  for (let i = 0; i < lines.length - 3; i++) {
    const currentLine = lines[i]

    // Skip obvious header/footer lines but don't stop processing
    if (isHeaderFooterLine(currentLine)) {
      continue
    }

    // Look for various date + description patterns across different pages
    const dateDescPatterns = [
      // Standard format: "DD MMM Description" (e.g., "03 Apr Direct Debit...")
      /^(\d{1,2})\s+([A-Z][a-z]{2})\s+(.+)$/i,

      // Year included: "DD MMM YYYY Description" (e.g., "03 Apr 2023 Direct Debit...")
      /^(\d{1,2})\s+([A-Z][a-z]{2})\s+(\d{4})\s+(.+)$/i,

      // Full month name: "DD Month Description" (e.g., "03 April Direct Debit...")
      /^(\d{1,2})\s+([A-Z][a-z]+)\s+(.+)$/i,

      // Different format: "YYYY-MM-DD Description"
      /^(\d{4})-(\d{2})-(\d{2})\s+(.+)$/i,

      // UK format: "DD/MM/YYYY Description"
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(.+)$/i,

      // With year: "DD MMM YY Description" (e.g., "03 Apr 23 Direct Debit...")
      /^(\d{1,2})\s+([A-Z][a-z]{2})\s+(\d{2})\s+(.+)$/i,

      // Reversed format: "Description On DD MMM" (e.g., "Card Payment to Shell Yeading On 23 Apr")
      /^(.+?)\s+On\s+(\d{1,2})\s+([A-Z][a-z]{2})$/i,

      // Alternative reversed: "Description DD MMM" (e.g., "Card Payment to LH Trading 24 Apr")
      /^(.+?)\s+(\d{1,2})\s+([A-Z][a-z]{2})$/i,

      // Just numbers and month: "DD MMM" (e.g., "23 Apr", "25 Apr")
      /^(\d{1,2})\s+([A-Z][a-z]{2})$/i
    ]

    let dateDescMatch = null
    let matchedPattern = -1

    for (let p = 0; p < dateDescPatterns.length; p++) {
      const match = currentLine.match(dateDescPatterns[p])
      if (match) {
        dateDescMatch = match
        matchedPattern = p
        break
      }
    }

    if (dateDescMatch) {
      let day: string, monthStr: string, yearStr: string = '', description: string

      // Parse based on which pattern matched
      switch (matchedPattern) {
        case 0: // "DD MMM Description"
          [, day, monthStr, description] = dateDescMatch
          break
        case 1: // "DD MMM YYYY Description"
          [, day, monthStr, yearStr, description] = dateDescMatch
          break
        case 2: // "DD Month Description"
          [, day, monthStr, description] = dateDescMatch
          break
        case 3: // "YYYY-MM-DD Description"
          [, yearStr, monthStr, day, description] = dateDescMatch
          break
        case 4: // "DD/MM/YYYY Description"
          [, day, monthStr, yearStr, description] = dateDescMatch
          break
        case 5: // "DD MMM YY Description"
          [, day, monthStr, yearStr, description] = dateDescMatch
          break
        case 6: // "Description On DD MMM" (reversed)
          [, description, day, monthStr] = dateDescMatch
          break
        case 7: // "Description DD MMM" (reversed)
          [, description, day, monthStr] = dateDescMatch
          break
        case 8: // "DD MMM" (just date)
          [, day, monthStr] = dateDescMatch
          description = "Transaction" // Default description for date-only matches
          break
        default:
          continue
      }

      // Skip balance lines and summary lines - they're not transactions
      if (description.includes('balance') ||
          description.includes('Start balance') ||
          description.includes('End balance')) {
        continue
      }

      console.log(`🔍 Potential transaction (pattern ${matchedPattern}): "${currentLine}"`)

      // Look for amount in the next several lines and collect description fragments
      let amountLine = ''
      let refLine = ''
      let amountLineIndex = -1
      let descriptionFragments: string[] = []

      // Always try to build complete descriptions from surrounding lines
      // Look backward for transaction type prefixes and merchant name fragments
      // Extended range for multi-page statements where context may be further away
      for (let k = Math.max(0, i - 10); k < i; k++) {
        const prevLine = lines[k].trim()
        if (prevLine && !isHeaderFooterLine(prevLine) &&
            !prevLine.match(/^\d+\.\d{2}$/) && // Not just an amount
            !prevLine.match(/^Page \d+/i) &&
            !prevLine.match(/^Sort code|^Account|^Statement|^Barclays/i)) {

          // Prioritize transaction type prefixes
          if (prevLine.match(/^(Card Payment to|Direct Debit to|Standing Order to|Transfer to|Transfer from|Received from|Payment to)/i)) {
            descriptionFragments.unshift(prevLine)
          }
          // Look for clear merchant names and location indicators
          else if (prevLine.match(/^[A-Z][a-zA-Z\s&\.'-]+$/) ||
                   prevLine.match(/^[A-Z][a-zA-Z]+\*[A-Z0-9]+$/i) || // Amazon*, Prime*, etc.
                   prevLine.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+/) || // "Tesco Stores", "Costa Coffee"
                   prevLine.match(/^\w+\s+\d{4,}$/i) || // "Stores 6817", "PFS 3442"
                   prevLine.match(/^[A-Z][a-z]+\s+(FS|PFS)\d+/i) || // "Hayes FS102"
                   prevLine.match(/^[A-Z][a-z]+\s+(On|At|From)\s/i)) { // "Tesco On", "Amazon At"
            descriptionFragments.unshift(prevLine)
          }
        }
      }

      for (let j = 1; j <= 12; j++) { // Extended search range for multi-page statements
        if (i + j >= lines.length) break

        const checkLine = lines[i + j]

        // Skip obvious non-amount lines but DON'T break on them
        if (isHeaderFooterLine(checkLine)) {
          continue
        }

        // Skip page break indicators but continue searching
        if (checkLine.match(/^Page \d+|^Continued|^Statement|^Account Number/i)) {
          continue
        }

        // Collect additional description fragments before finding amount
        if (!amountLine && checkLine.trim() && !checkLine.match(/^\d+\.\d{2}$/)) {
          const trimmedLine = checkLine.trim()

          // Check if this line could be part of the description - be more selective
          if (trimmedLine.match(/^(Card Payment to|Direct Debit to|Standing Order to|Transfer|Received from|Payment to)/i) ||
              trimmedLine.match(/^[A-Z][a-zA-Z]+\*[A-Z0-9]+$/i) || // Amazon*, Prime*, etc.
              trimmedLine.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+/) || // "Tesco Stores", "Costa Coffee"
              trimmedLine.match(/^\w+\s+\d{4,}$/i) || // "Stores 6817", "PFS 3442"
              trimmedLine.match(/^[A-Z][a-z]+\s+(FS|PFS)\d+/i) || // "Hayes FS102"
              trimmedLine.match(/^[A-Z][a-z]+\s+(On|At|From)\s/i) || // "Tesco On", "Amazon At" with space after
              (trimmedLine.match(/^[A-Z][a-zA-Z\s&\.'-]+$/) && trimmedLine.length > 3 &&
               !['On', 'Win', 'PLC', 'Shopping', 'From', 'To', 'At', 'Ltd'].includes(trimmedLine))) {
            descriptionFragments.push(trimmedLine)
          }
        }

        // Collect reference lines
        if (checkLine.match(/^(Ref:|Reference:|Transaction:|TXN:)/i)) {
          if (!refLine) refLine = checkLine
          continue
        }

        // DON'T stop at other transaction headers - look for amounts first
        // Only stop if we find a clear page break
        if (checkLine.includes('Page ') || checkLine.includes('SWIFTBIC')) {
          break
        }

        // Look for amount patterns - be more flexible
        let amountMatch = checkLine.match(/^([\d,]+\.\d{2})(?:\s+(CR|DR))?$/i)

        // Also try amounts with currency symbols or embedded in text
        if (!amountMatch) {
          amountMatch = checkLine.match(/£?([\d,]+\.\d{2})/i)
        }

        // Try negative amounts
        if (!amountMatch) {
          amountMatch = checkLine.match(/^-([\d,]+\.\d{2})$/i)
        }

        if (amountMatch) {
          amountLine = checkLine
          amountLineIndex = j
          break
        }
      }

      if (amountLine) {
        console.log(`✅ Found complete transaction:`)
        console.log(`   Date+Desc: "${currentLine}"`)
        console.log(`   Amount: "${amountLine}" (found ${amountLineIndex} lines later)`)
        if (refLine) console.log(`   Ref: "${refLine}"`)

        // Parse amount - handle various formats
        let amount: number
        let isNegative = false

        if (amountLine.startsWith('-')) {
          amount = parseFloat(amountLine.substring(1).replace(/[,£]/g, ''))
          isNegative = true
        } else {
          const amountMatch = amountLine.match(/([\d,]+\.\d{2})/i)
          if (amountMatch) {
            amount = parseFloat(amountMatch[1].replace(/,/g, ''))
            // Check for DR indicator or negative context
            isNegative = amountLine.includes('DR') || description.toLowerCase().includes('to ')
          } else {
            console.log(`   ❌ Could not parse amount: "${amountLine}"`)
            continue
          }
        }

        // Handle date parsing based on format
        let month: string, year: string

        if (matchedPattern === 3) {
          // "YYYY-MM-DD Description" - monthStr is already numeric
          month = monthStr
          year = yearStr
        } else if (matchedPattern === 4) {
          // "DD/MM/YYYY Description" - monthStr is already numeric
          month = monthStr
          year = yearStr
        } else {
          // Convert month name to number for text-based months
          month = getMonthNumber(monthStr)

          // Determine year
          if (yearStr) {
            // Year was provided in the date
            if (yearStr.length === 2) {
              // Convert 2-digit year to 4-digit
              const yearNum = parseInt(yearStr)
              year = (yearNum <= 30) ? `20${yearStr}` : `19${yearStr}`
            } else {
              year = yearStr
            }
          } else {
            // Use the consistent year from statement header
            year = currentYear.toString()
          }
        }

        const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

        // Determine transaction type based on description
        const isDebit = isNegative ||
                       description.toLowerCase().includes('debit') ||
                       description.toLowerCase().includes('payment') ||
                       description.toLowerCase().includes('withdrawal') ||
                       description.toLowerCase().includes('transfer to') ||
                       description.toLowerCase().includes('direct debit') ||
                       description.toLowerCase().includes('standing order') ||
                       description.toLowerCase().includes('card payment') ||
                       description.toLowerCase().includes('dd ') ||
                       description.toLowerCase().includes(' to ')

        // Build full description using reconstructed fragments
        let fullDescription = description.trim()

        // Reconstruct description from collected fragments
        if (descriptionFragments.length > 0) {
          let reconstructedDesc = descriptionFragments.join(' ').trim()

          // Clean up common issues in reconstructed description
          reconstructedDesc = reconstructedDesc
            .replace(/\s+/g, ' ') // Multiple spaces to single space
            .replace(/\b(On|At|From)\s+(\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))/gi, 'On $2') // "On 01 Apr" -> "On 01 Apr"
            .replace(/\b(FS|PFS)\s*(\d+)/gi, 'FS$2') // "FS 102" -> "FS102"
            .replace(/\s+(Ltd|PLC|Limited)\s*/gi, ' $1') // Clean up company suffixes

          // Use reconstructed description if it's more informative
          if (reconstructedDesc.length > fullDescription.length &&
              reconstructedDesc.length > 3 &&
              !reconstructedDesc.match(/^(On|Win|PLC|Shopping|From|To|At)$/)) {
            fullDescription = reconstructedDesc
          }
        }

        // Clean up common description issues
        fullDescription = fullDescription
          .replace(/\s+/g, ' ') // Multiple spaces to single space
          .replace(/^(Card Payment to|Direct Debit to|Standing Order to|Transfer to|Transfer from|Received from|Payment to)\s*/i, (match) => match.trim() + ' ')
          .trim()

        // Detect and fix generic date-only descriptions like "On 01 Apr"
        const isGenericDateDescription = fullDescription.match(/^(On|At|From)\s+\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/i)

        if (isGenericDateDescription || fullDescription.length < 3 ||
            ['On', 'Win', 'PLC', 'Shopping', 'From', 'To', 'At', 'Transaction'].includes(fullDescription)) {

          // For generic date descriptions, do an extensive search for the actual merchant name
          let foundMerchantName = null

          // Search backward more extensively for merchant names (extended range for multi-page)
          for (let backSearch = Math.max(0, i - 15); backSearch < i; backSearch++) {
            const searchLine = lines[backSearch].trim()
            if (searchLine && !isHeaderFooterLine(searchLine) &&
                !searchLine.match(/^\d+\.\d{2}$/) &&
                !searchLine.match(/^(On|At|From)\s+\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)) {

              // Look for clear merchant patterns
              const transactionMatch = searchLine.match(/^(Card Payment to|Direct Debit to|Standing Order to|Transfer to|Transfer from|Received from|Payment to)\s+(.+)/i)
              if (transactionMatch) {
                foundMerchantName = transactionMatch[0] // Include the full transaction type + merchant
                break
              }
              // Look for merchant names (not just generic words)
              else if (searchLine.match(/^[A-Z][a-zA-Z\s&\.'\-]+$/) &&
                       searchLine.length > 3 &&
                       !['On', 'Win', 'PLC', 'Shopping', 'From', 'To', 'At', 'Limited', 'Ltd'].includes(searchLine) &&
                       !searchLine.match(/^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)) {
                // Additional check - must look like a merchant name
                if (searchLine.match(/^(Amazon|Tesco|Paypal|Apple|Google|Shell|Spotify|Netflix)/i) ||
                    searchLine.match(/^[A-Z][a-z]+\s+(Stores?|Coffee|Trading|Appliances|Food|News|Centre|Borough)/i) ||
                    searchLine.match(/^[A-Z][a-z]+\*[A-Z0-9]+/i) || // Amazon*, Prime*, etc.
                    searchLine.match(/^\w+\s+\d{4,}/i)) { // "Stores 6817"
                  foundMerchantName = searchLine
                  break
                }
              }
            }
          }

          // Search forward for merchant names if not found backward
          if (!foundMerchantName) {
            for (let forwardSearch = i + 1; forwardSearch < Math.min(i + 5, lines.length); forwardSearch++) {
              const searchLine = lines[forwardSearch].trim()
              if (searchLine && !isHeaderFooterLine(searchLine) &&
                  !searchLine.match(/^\d+\.\d{2}$/) &&
                  !searchLine.match(/^(On|At|From)\s+\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)) {

                // Look for merchant patterns
                if (searchLine.match(/^(Amazon|Tesco|Paypal|Apple|Google|Shell|Spotify|Netflix)/i) ||
                    searchLine.match(/^[A-Z][a-z]+\s+(Stores?|Coffee|Trading|Appliances|Food|News|Centre|Borough)/i) ||
                    searchLine.match(/^[A-Z][a-z]+\*[A-Z0-9]+/i) ||
                    searchLine.match(/^\w+\s+\d{4,}/i)) {
                  foundMerchantName = searchLine
                  break
                }
              }
            }
          }

          // Use found merchant name or fallback
          if (foundMerchantName) {
            fullDescription = foundMerchantName
          } else {
            // Try to use the original current line if it has more context
            const lineText = currentLine.replace(/^\d{1,2}\s+[A-Z][a-z]{2}\s*/, '').trim()
            if (lineText.length > 3 && !['On', 'Win', 'PLC', 'Shopping', 'From', 'To', 'At'].includes(lineText)) {
              fullDescription = lineText
            } else {
              // Keep the date but make it clearer
              if (isGenericDateDescription) {
                fullDescription = `Transaction ${fullDescription}`
              } else {
                fullDescription = 'Bank Transaction'
              }
            }
          }
        }

        if (refLine) {
          fullDescription += ` (${refLine.trim()})`
        }

        // Avoid duplicate transactions by checking if we already have this exact transaction
        const isDuplicate = transactions.some(t =>
          t.date === date &&
          t.description === fullDescription &&
          t.amount === amount
        )

        if (!isDuplicate) {
          transactions.push({
            id: transactionId.toString(),
            date,
            description: fullDescription,
            amount,
            type: isDebit ? 'debit' : 'credit',
            balance: undefined
          })

          transactionId++
          console.log(`   📝 Added transaction #${transactions.length}: ${date} ${fullDescription.substring(0, 30)}... £${amount}`)

          // Skip the processed lines to avoid re-processing
          i += Math.max(1, amountLineIndex - 1)
        } else {
          console.log(`   🔄 Skipping duplicate transaction`)
        }
      } else {
        console.log(`   ❌ No amount found for: "${currentLine}"`)
      }
    }
  }

  console.log(`\n📊 FINAL RESULTS:`)
  console.log(`   Total transactions extracted: ${transactions.length}`)
  console.log(`   Date range: ${transactions[0]?.date} to ${transactions[transactions.length - 1]?.date}`)

  if (transactions.length > 0) {
    console.log('   First transaction:', {
      date: transactions[0].date,
      description: transactions[0].description.substring(0, 50),
      amount: transactions[0].amount
    })
    console.log('   Last transaction:', {
      date: transactions[transactions.length - 1].date,
      description: transactions[transactions.length - 1].description.substring(0, 50),
      amount: transactions[transactions.length - 1].amount
    })
  }

  // 🔍 SECOND PASS: Enhanced scanner for missed transactions (multi-page aware)
  console.log(`\n🔍 SECOND PASS: Scanning for missed transaction fragments...`)

  // Track processed amounts to avoid duplicate detection
  const processedAmounts = new Set<string>()
  transactions.forEach(t => processedAmounts.add(`${t.date}-${t.amount}`))

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip obvious non-transactions but be less aggressive
    if (isHeaderFooterLine(line) ||
        line.match(/^(Page \d|Statement|Account|Sort Code|SWIFTBIC|Registered)/i) ||
        line.match(/^(Start|End|Opening|Closing)\s+balance/i) ||
        line.length < 5) {
      continue
    }

    // Look for any line with date pattern OR transaction keywords
    const hasDate = line.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)
    const hasTransactionKeyword = line.match(/(Payment|Debit|Transfer|Direct|Card|Purchase|Standing Order|BACS|FPS|BGC)/i)
    const hasAmount = line.match(/([\d,]+\.\d{2})/i)

    if (hasDate || hasTransactionKeyword || hasAmount) {
      // Try to extract date information
      let day: string | null = null, monthStr: string | null = null

      if (hasDate) {
        day = hasDate[1]
        monthStr = hasDate[2]
      } else {
        // Look in surrounding lines for date (extended range)
        for (let j = Math.max(0, i - 5); j <= Math.min(lines.length - 1, i + 5); j++) {
          const nearbyDate = lines[j].match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)
          if (nearbyDate) {
            day = nearbyDate[1]
            monthStr = nearbyDate[2]
            break
          }
        }
      }

      // Look for amount in surrounding lines (extended range)
      let amount: number | null = null
      for (let j = Math.max(0, i - 5); j <= Math.min(lines.length - 1, i + 5); j++) {
        const amountMatch = lines[j].match(/([\d,]+\.\d{2})/i)
        if (amountMatch) {
          const candidateAmount = parseFloat(amountMatch[1].replace(/,/g, ''))
          // Skip balance-like large amounts and check reasonable range
          if (candidateAmount > 0 && candidateAmount < 50000) {
            amount = candidateAmount
            break
          }
        }
      }

      if (day && monthStr && amount) {
        const month = getMonthNumber(monthStr)
        const date = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

        // Check if we already have this transaction (avoid duplicates)
        const amountKey = `${date}-${amount}`
        const exists = processedAmounts.has(amountKey) || transactions.some(t =>
          t.date === date && Math.abs(t.amount - amount) < 0.01
        )

        if (!exists) {
          // Build description from context
          let description = line.trim()

          // If line is just a date or amount, look for description in nearby lines
          if (description.match(/^\d{1,2}\s+[A-Z][a-z]{2}$/) || description.match(/^[\d,]+\.\d{2}$/)) {
            for (let k = Math.max(0, i - 3); k <= Math.min(lines.length - 1, i + 3); k++) {
              const nearbyLine = lines[k].trim()
              if (nearbyLine.match(/(Payment|Debit|Transfer|Direct|Card|Purchase|Standing Order)/i)) {
                description = nearbyLine
                break
              }
            }
          }

          // Determine type based on description keywords
          const lowerDesc = description.toLowerCase()
          const isCredit = lowerDesc.includes('received') || lowerDesc.includes('credit') ||
                          lowerDesc.includes('refund') || lowerDesc.includes('interest') ||
                          lowerDesc.includes('transfer from')

          const transaction: Transaction = {
            id: transactionId.toString(),
            date,
            description: description.substring(0, 100).trim() || 'Bank Transaction',
            amount: amount,
            type: isCredit ? 'credit' : 'debit',
            balance: undefined
          }

          transactions.push(transaction)
          processedAmounts.add(amountKey)
          console.log(`   ➕ Added missed transaction #${transactionId}: ${date} ${description.substring(0, 30)}... £${amount}`)
          transactionId++
        }
      }
    }
  }

  // Sort transactions by date
  transactions.sort((a, b) => a.date.localeCompare(b.date))

  console.log(`\n📊 FINAL RESULTS AFTER SECOND PASS:`)
  console.log(`   Total transactions extracted: ${transactions.length}`)

  return transactions
}

// Helper function to identify header/footer lines that should be skipped
function isHeaderFooterLine(line: string): boolean {
  const skipPatterns = [
    /^Barclays Bank/i,
    /^Call \d+/i,
    /^Click barclays\.co\.uk/i,
    /^Come in to a branch/i,
    /^Financial Conduct Authority/i,
    /^banking$/i,
    /^Your accounts at a glance/i,
    /^To get your most up to date/i,
    /^\s*$/,
    /^Page \d+ of \d+$/i,
    /^Statement \d+-[A-Z]+-\d+/i
  ]

  return skipPatterns.some(pattern => pattern.test(line)) || line.length < 3
}

// Helper function to extract year from statement context
function extractYearFromContext(lines: string[], currentIndex: number): number | null {
  // Look for year indicators near the current line - be more selective
  const searchRange = Math.max(0, currentIndex - 10)
  const searchEnd = Math.min(lines.length, currentIndex + 10)

  for (let i = searchRange; i < searchEnd; i++) {
    const line = lines[i]

    // Look for date patterns that include year - be more specific
    // Only match years in proper date contexts
    const yearMatch = line.match(/\b(\d{1,2})\s+([A-Z][a-z]{2})\s+(20\d{2})\b/i) ||
                     line.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/) ||
                     line.match(/(\d{1,2})\/(\d{1,2})\/(20\d{2})/)

    if (yearMatch) {
      const year = parseInt(yearMatch[3] || yearMatch[1])
      // Only accept reasonable years (2020-2030)
      if (year >= 2020 && year <= 2030) {
        return year
      }
    }
  }

  return null
}

// HSBC-specific parser
function parseHSBCTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let transactionId = 1

  for (const line of lines) {
    // HSBC format variations
    const hsbcMatch = line.match(/(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s*(DR|CR)?/)

    if (hsbcMatch) {
      const [, dateStr, description, amountStr, drCr] = hsbcMatch
      const [day, month, year] = dateStr.split('/')
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

      const amount = parseFloat(amountStr.replace(/,/g, ''))
      const type = drCr === 'DR' ? 'debit' : 'credit'

      transactions.push({
        id: transactionId.toString(),
        date,
        description: description.trim(),
        amount,
        type,
        balance: undefined
      })

      transactionId++
    }
  }

  return transactions
}

// Lloyds/Halifax-specific parser
function parseLloydsTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let transactionId = 1

  for (const line of lines) {
    // Lloyds format similar to other traditional banks
    const lloydsMatch = line.match(/(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/)

    if (lloydsMatch) {
      const [, dateStr, description, amountStr, balanceStr] = lloydsMatch
      const [day, month, year] = dateStr.split('/')
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

      const amount = parseFloat(amountStr.replace(/,/g, ''))
      const balance = parseFloat(balanceStr.replace(/,/g, ''))

      // Determine type by comparing amounts or description
      const isDebit = description.toLowerCase().includes('debit') ||
                     description.toLowerCase().includes('payment') ||
                     description.toLowerCase().includes('dd')

      transactions.push({
        id: transactionId.toString(),
        date,
        description: description.trim(),
        amount,
        type: isDebit ? 'debit' : 'credit',
        balance
      })

      transactionId++
    }
  }

  return transactions
}

// Santander-specific parser
function parseSantanderTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let transactionId = 1

  for (const line of lines) {
    // Santander format similar to other traditional banks
    const santanderMatch = line.match(/(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s*(DR|CR)?/)

    if (santanderMatch) {
      const [, dateStr, description, amountStr, drCr] = santanderMatch
      const [day, month, year] = dateStr.split('/')
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

      const amount = parseFloat(amountStr.replace(/,/g, ''))
      const type = drCr === 'DR' || description.toLowerCase().includes('debit') ? 'debit' : 'credit'

      transactions.push({
        id: transactionId.toString(),
        date,
        description: description.trim(),
        amount,
        type,
        balance: undefined
      })

      transactionId++
    }
  }

  return transactions
}

// NatWest/RBS-specific parser
function parseNatWestTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let transactionId = 1

  for (const line of lines) {
    // NatWest format
    const natwestMatch = line.match(/(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/)

    if (natwestMatch) {
      const [, dateStr, description, amountStr, balanceStr] = natwestMatch
      const [day, month, year] = dateStr.split('/')
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

      const amount = parseFloat(amountStr.replace(/,/g, ''))
      const balance = parseFloat(balanceStr.replace(/,/g, ''))

      // Determine type based on description patterns
      const isDebit = description.toLowerCase().includes('debit') ||
                     description.toLowerCase().includes('payment') ||
                     description.toLowerCase().includes('withdrawal') ||
                     description.toLowerCase().includes('deb')

      transactions.push({
        id: transactionId.toString(),
        date,
        description: description.trim(),
        amount,
        type: isDebit ? 'debit' : 'credit',
        balance
      })

      transactionId++
    }
  }

  return transactions
}

// Monzo-specific parser
function parseMonzoTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let transactionId = 1

  for (const line of lines) {
    // Monzo format (modern app-based format)
    const monzoMatch = line.match(/(\d{4}-\d{2}-\d{2})\s+(.+?)\s+([-+]?[\d,]+\.\d{2})/)

    if (monzoMatch) {
      const [, date, description, amountStr] = monzoMatch
      const amount = Math.abs(parseFloat(amountStr.replace(/[,+]/g, '')))
      const type = amountStr.startsWith('-') ? 'debit' : 'credit'

      transactions.push({
        id: transactionId.toString(),
        date,
        description: description.trim(),
        amount,
        type,
        balance: undefined
      })

      transactionId++
    }
  }

  return transactions
}

// Starling-specific parser
function parseStarlingTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let transactionId = 1

  for (const line of lines) {
    // Starling format (similar to Monzo)
    const starlingMatch = line.match(/(\d{4}-\d{2}-\d{2})\s+(.+?)\s+([-+]?[\d,]+\.\d{2})/)

    if (starlingMatch) {
      const [, date, description, amountStr] = starlingMatch
      const amount = Math.abs(parseFloat(amountStr.replace(/[,+]/g, '')))
      const type = amountStr.startsWith('-') ? 'debit' : 'credit'

      transactions.push({
        id: transactionId.toString(),
        date,
        description: description.trim(),
        amount,
        type,
        balance: undefined
      })

      transactionId++
    }
  }

  return transactions
}

// Revolut-specific parser
function parseRevolutTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let transactionId = 1

  for (const line of lines) {
    // Revolut format (app-based with detailed descriptions)
    const revolutMatch = line.match(/(\d{4}-\d{2}-\d{2})\s+(.+?)\s+([-+]?[\d,]+\.\d{2})\s*([A-Z]{3})?/)

    if (revolutMatch) {
      const [, date, description, amountStr, currency] = revolutMatch
      const amount = Math.abs(parseFloat(amountStr.replace(/[,+]/g, '')))
      const type = amountStr.startsWith('-') ? 'debit' : 'credit'

      let cleanDescription = description.trim()
      if (currency && currency !== 'GBP') {
        cleanDescription += ` (${currency})`
      }

      transactions.push({
        id: transactionId.toString(),
        date,
        description: cleanDescription,
        amount,
        type,
        balance: undefined
      })

      transactionId++
    }
  }

  return transactions
}

// Enhanced parser with tabula integration for better table extraction
async function parseWithTabulaFallback(text: string, buffer?: Buffer, bankName?: string): Promise<Transaction[]> {
  try {
    // Try tabula-js for structured table extraction if buffer is available
    if (buffer && bankName) {
      console.log(`🔧 Attempting tabula extraction for ${bankName}...`)
      const tabula = await import('tabula-js').then(mod => (mod as any).default || mod)
      const options = {
        pages: 'all',
        area: ['0,0,100,100'], // Full page area
        columns: true,
        silent: true
      }

      try {
        const tables = await tabula(buffer, options)
        if (tables && tables.length > 0) {
          console.log(`📊 Tabula extracted ${tables.length} tables`)
          return parseTabularData(tables, bankName)
        }
      } catch (tabulaError) {
        console.log(`⚠️ Tabula extraction failed, falling back to text parsing:`, tabulaError)
      }
    }
  } catch (error) {
    console.log(`⚠️ Tabula not available, using text parsing only`)
  }

  // Fallback to text-based parsing
  return []
}

// Parse tabular data from tabula extraction
function parseTabularData(tables: any[], bankName: string): Transaction[] {
  const transactions: Transaction[] = []
  let transactionId = 1

  for (const table of tables) {
    if (!table || !Array.isArray(table)) continue

    for (const row of table) {
      if (!row || !Array.isArray(row) || row.length < 3) continue

      // Look for date patterns in the first few columns
      let dateCol = -1
      let descCol = -1
      let amountCol = -1

      for (let i = 0; i < Math.min(row.length, 5); i++) {
        const cell = String(row[i] || '').trim()

        // Date detection
        if (dateCol === -1 && cell.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)) {
          dateCol = i
        }

        // Amount detection
        if (amountCol === -1 && cell.match(/^[-+]?[\d,]+\.\d{2}$/)) {
          amountCol = i
        }
      }

      // Find description column (usually between date and amount)
      if (dateCol !== -1 && amountCol !== -1) {
        for (let i = dateCol + 1; i < amountCol; i++) {
          const cell = String(row[i] || '').trim()
          if (cell.length > 3 && !cell.match(/^[\d\s\-\.\/]+$/)) {
            descCol = i
            break
          }
        }
      }

      // Extract transaction if we found all required columns
      if (dateCol !== -1 && descCol !== -1 && amountCol !== -1) {
        const dateStr = String(row[dateCol]).trim()
        const description = String(row[descCol]).trim()
        const amountStr = String(row[amountCol]).trim()

        if (dateStr && description && amountStr) {
          const date = normalizeDate(dateStr)
          const amount = Math.abs(parseFloat(amountStr.replace(/[£,\s]/g, '')))
          const type = amountStr.includes('-') || row.some(cell =>
            String(cell).toLowerCase().includes('debit') ||
            String(cell).toLowerCase().includes('dr')
          ) ? 'debit' : 'credit'

          if (date && amount > 0) {
            transactions.push({
              id: transactionId.toString(),
              date,
              description,
              amount,
              type,
              balance: undefined
            })
            transactionId++
          }
        }
      }
    }
  }

  return transactions
}

// Normalize different date formats to YYYY-MM-DD
function normalizeDate(dateStr: string): string {
  const cleaned = dateStr.replace(/[^\d\/\-\.\w\s]/g, '')

  // DD/MM/YYYY or DD-MM-YYYY
  let match = cleaned.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/)
  if (match) {
    const [, day, month, year] = match
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // DD MMM YYYY
  match = cleaned.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*(\d{4})?/i)
  if (match) {
    const [, day, monthName, year] = match
    const monthMap: { [key: string]: string } = {
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
      'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    }
    const month = monthMap[monthName.toLowerCase().substring(0, 3)]
    const fullYear = year || '2023' // Default to current year if not provided
    return `${fullYear}-${month}-${day.padStart(2, '0')}`
  }

  // YYYY-MM-DD (already normalized)
  if (cleaned.match(/\d{4}-\d{2}-\d{2}/)) {
    return cleaned
  }

  return ''
}

// First Direct parser (HSBC subsidiary)
function parseFirstDirectTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  let transactionId = 1

  for (const line of lines) {
    // First Direct format: DD/MM/YYYY Description Amount
    const match = line.match(/(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s*(DR|CR)?/)

    if (match) {
      const [, dateStr, description, amountStr, drCr] = match
      const [day, month, year] = dateStr.split('/')
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      const amount = parseFloat(amountStr.replace(/,/g, ''))
      const type = drCr === 'DR' ? 'debit' : 'credit'

      transactions.push({
        id: transactionId.toString(),
        date,
        description: description.trim(),
        amount,
        type,
        balance: undefined
      })
      transactionId++
    }
  }

  return transactions
}

// Metro Bank parser
function parseMetroBankTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  let transactionId = 1

  for (const line of lines) {
    // Metro Bank format variations
    const match = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s*(OUT|IN)?/)

    if (match) {
      const [, dateStr, description, amountStr, inOut] = match
      const [day, month, year] = dateStr.split('/')
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      const amount = parseFloat(amountStr.replace(/,/g, ''))
      const type = inOut === 'OUT' ? 'debit' : 'credit'

      transactions.push({
        id: transactionId.toString(),
        date,
        description: description.trim(),
        amount,
        type,
        balance: undefined
      })
      transactionId++
    }
  }

  return transactions
}

// Co-operative Bank parser
function parseCooperativeTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  let transactionId = 1

  for (const line of lines) {
    // Co-op format: DD MMM Description Amount
    const match = line.match(/(\d{1,2}\s+[A-Z]{3})\s+(.+?)\s+([\d,]+\.\d{2})\s*(DR|CR)?/)

    if (match) {
      const [, dateStr, description, amountStr, drCr] = match
      const date = normalizeDate(dateStr + ' 2023') // Add current year
      const amount = parseFloat(amountStr.replace(/,/g, ''))
      const type = drCr === 'DR' ? 'debit' : 'credit'

      if (date) {
        transactions.push({
          id: transactionId.toString(),
          date,
          description: description.trim(),
          amount,
          type,
          balance: undefined
        })
        transactionId++
      }
    }
  }

  return transactions
}

// TSB Bank parser
function parseTSBTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  let transactionId = 1

  for (const line of lines) {
    // TSB format similar to Lloyds
    const match = line.match(/(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s*(D|C)?/)

    if (match) {
      const [, dateStr, description, amountStr, dC] = match
      const [day, month, year] = dateStr.split('/')
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      const amount = parseFloat(amountStr.replace(/,/g, ''))
      const type = dC === 'D' ? 'debit' : 'credit'

      transactions.push({
        id: transactionId.toString(),
        date,
        description: description.trim(),
        amount,
        type,
        balance: undefined
      })
      transactionId++
    }
  }

  return transactions
}

// Nationwide Building Society parser
function parseNationwideTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  let transactionId = 1

  for (const line of lines) {
    // Nationwide format: DD MMM YY Description Amount
    const match = line.match(/(\d{1,2}\s+[A-Z]{3}\s+\d{2})\s+(.+?)\s+([\d,]+\.\d{2})\s*(DR|CR)?/)

    if (match) {
      const [, dateStr, description, amountStr, drCr] = match
      const date = normalizeDate(dateStr.replace(/(\d{2})$/, '20$1')) // Convert YY to 20YY
      const amount = parseFloat(amountStr.replace(/,/g, ''))
      const type = drCr === 'DR' ? 'debit' : 'credit'

      if (date) {
        transactions.push({
          id: transactionId.toString(),
          date,
          description: description.trim(),
          amount,
          type,
          balance: undefined
        })
        transactionId++
      }
    }
  }

  return transactions
}

// Virgin Money parser
function parseVirginMoneyTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  let transactionId = 1

  for (const line of lines) {
    // Virgin Money format
    const match = line.match(/(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s*(DR|CR)?/)

    if (match) {
      const [, dateStr, description, amountStr, drCr] = match
      const [day, month, year] = dateStr.split('/')
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      const amount = parseFloat(amountStr.replace(/,/g, ''))
      const type = drCr === 'DR' ? 'debit' : 'credit'

      transactions.push({
        id: transactionId.toString(),
        date,
        description: description.trim(),
        amount,
        type,
        balance: undefined
      })
      transactionId++
    }
  }

  return transactions
}

// MBNA parser (credit card statements)
function parseMBNATransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  let transactionId = 1

  for (const line of lines) {
    // MBNA credit card format: DD MMM Description Amount
    const match = line.match(/(\d{1,2}\s+[A-Z]{3})\s+(.+?)\s+([\d,]+\.\d{2})/)

    if (match) {
      const [, dateStr, description, amountStr] = match
      const date = normalizeDate(dateStr + ' 2023')
      const amount = parseFloat(amountStr.replace(/,/g, ''))
      // Most credit card transactions are debits (purchases)
      const type = description.toLowerCase().includes('payment') ? 'credit' : 'debit'

      if (date) {
        transactions.push({
          id: transactionId.toString(),
          date,
          description: description.trim(),
          amount,
          type,
          balance: undefined
        })
        transactionId++
      }
    }
  }

  return transactions
}

// American Express parser
function parseAmexTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  let transactionId = 1

  for (const line of lines) {
    // Amex format: DD/MM Description Amount
    const match = line.match(/(\d{2}\/\d{2})\s+(.+?)\s+([\d,]+\.\d{2})/)

    if (match) {
      const [, dateStr, description, amountStr] = match
      const date = normalizeDate(dateStr + '/2023') // Add current year
      const amount = parseFloat(amountStr.replace(/,/g, ''))
      const type = description.toLowerCase().includes('payment') ? 'credit' : 'debit'

      if (date) {
        transactions.push({
          id: transactionId.toString(),
          date,
          description: description.trim(),
          amount,
          type,
          balance: undefined
        })
        transactionId++
      }
    }
  }

  return transactions
}

// Tesco Bank parser
function parseTescoBankTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  let transactionId = 1

  for (const line of lines) {
    // Tesco Bank format
    const match = line.match(/(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s*(DR|CR)?/)

    if (match) {
      const [, dateStr, description, amountStr, drCr] = match
      const [day, month, year] = dateStr.split('/')
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      const amount = parseFloat(amountStr.replace(/,/g, ''))
      const type = drCr === 'DR' ? 'debit' : 'credit'

      transactions.push({
        id: transactionId.toString(),
        date,
        description: description.trim(),
        amount,
        type,
        balance: undefined
      })
      transactionId++
    }
  }

  return transactions
}

// Marcus by Goldman Sachs parser (savings account)
function parseMarcusTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  let transactionId = 1

  for (const line of lines) {
    // Marcus format (simple savings account)
    const match = line.match(/(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})/)

    if (match) {
      const [, dateStr, description, amountStr] = match
      const [day, month, year] = dateStr.split('/')
      const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      const amount = parseFloat(amountStr.replace(/,/g, ''))
      // Savings accounts: deposits are credits, withdrawals are debits
      const type = description.toLowerCase().includes('withdrawal') ? 'debit' : 'credit'

      transactions.push({
        id: transactionId.toString(),
        date,
        description: description.trim(),
        amount,
        type,
        balance: undefined
      })
      transactionId++
    }
  }

  return transactions
}

// CAF Bank (Charities Aid Foundation) parser
function parseCAFTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  let transactionId = 1

  // Extract year from statement header (e.g., "Statement Period: 01 Jan 2024 - 31 Jan 2024")
  let statementYear = new Date().getFullYear().toString()
  const yearMatch = text.match(/(?:Statement Period|Statement Date|Period)[:\s]+.*?(\d{4})/i)
  if (yearMatch) {
    statementYear = yearMatch[1]
  }

  // CAF-specific transaction patterns
  const cafPatterns = [
    // Pattern 1: DD MMM YYYY Description Amount (standard format)
    /^(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s*(CR|DR)?$/i,
    // Pattern 2: DD MMM Description Amount (no year)
    /^(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\s+(.+?)\s+([\d,]+\.\d{2})\s*(CR|DR)?$/i,
    // Pattern 3: DD/MM/YYYY Description Amount
    /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s*(CR|DR)?$/,
    // Pattern 4: YYYY-MM-DD Description Amount (ISO format)
    /^(\d{4}-\d{2}-\d{2})\s+(.+?)\s+([\d,]+\.\d{2})\s*(CR|DR)?$/,
    // Pattern 5: Flexible - Date Description Amount Balance
    /^(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+\d{2,4})?)\s+(.+?)\s+([\d,]+\.\d{2})\s+[\d,]+\.\d{2}\s*(CR|DR)?$/i
  ]

  // Keywords indicating credit (money coming in)
  const creditKeywords = [
    'grant', 'donation', 'income', 'received', 'deposit', 'interest',
    'transfer in', 'credit', 'refund', 'bacs credit', 'faster payment in',
    'standing order in', 'gift aid', 'funding', 'settlement'
  ]

  // Keywords indicating debit (money going out)
  const debitKeywords = [
    'payment', 'direct debit', 'withdrawal', 'transfer out', 'charge',
    'fee', 'bacs debit', 'faster payment out', 'standing order out',
    'card payment', 'chq', 'cheque', 'debit'
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip header lines and non-transaction lines
    if (line.match(/^(Date|Description|Amount|Balance|Transaction|Account|Statement|Page|\d{2}-\d{2}-\d{2}$|Sort Code)/i)) {
      continue
    }

    // Skip lines that are just numbers (likely balance columns)
    if (line.match(/^[\d,]+\.\d{2}$/)) {
      continue
    }

    for (const pattern of cafPatterns) {
      const match = line.match(pattern)
      if (match) {
        let dateStr = match[1]
        const description = match[2].trim()
        const amountStr = match[3]
        const explicitType = match[4]?.toUpperCase()

        // Skip balance lines or summary lines
        if (description.match(/^(balance|brought forward|carried forward|opening|closing|total)/i)) {
          continue
        }

        // Normalize date to YYYY-MM-DD format
        let date: string | null = null

        if (dateStr.includes('/')) {
          // DD/MM/YYYY format
          const [day, month, year] = dateStr.split('/')
          date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        } else if (dateStr.includes('-')) {
          // Already YYYY-MM-DD
          date = dateStr
        } else {
          // DD MMM or DD MMM YYYY format
          const dateParts = dateStr.split(/\s+/)
          const day = dateParts[0].padStart(2, '0')
          const monthStr = dateParts[1].toLowerCase()
          const year = dateParts[2] || statementYear

          const monthMap: Record<string, string> = {
            jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
            jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
          }
          const month = monthMap[monthStr]

          if (month) {
            const fullYear = year.length === 2 ? `20${year}` : year
            date = `${fullYear}-${month}-${day}`
          }
        }

        if (!date) continue

        const amount = parseFloat(amountStr.replace(/,/g, ''))

        // Determine transaction type
        let type: 'debit' | 'credit'
        if (explicitType === 'CR') {
          type = 'credit'
        } else if (explicitType === 'DR') {
          type = 'debit'
        } else {
          // Infer from description
          const lowerDesc = description.toLowerCase()
          if (creditKeywords.some(kw => lowerDesc.includes(kw))) {
            type = 'credit'
          } else if (debitKeywords.some(kw => lowerDesc.includes(kw))) {
            type = 'debit'
          } else {
            // Default to debit if unclear (most charity transactions are payments)
            type = 'debit'
          }
        }

        // Check for duplicates
        const isDuplicate = transactions.some(
          t => t.date === date && t.amount === amount && t.description === description
        )

        if (!isDuplicate) {
          transactions.push({
            id: transactionId.toString(),
            date,
            description,
            amount,
            type,
            balance: undefined
          })
          transactionId++
        }

        break // Found a match, move to next line
      }
    }
  }

  // If no transactions found with strict patterns, try a more flexible approach
  if (transactions.length === 0) {
    console.log('CAF: Strict patterns found no transactions, trying flexible parsing...')
    return parseCAFTransactionsFlexible(text, statementYear)
  }

  return transactions
}

// Flexible CAF parser for non-standard formats
function parseCAFTransactionsFlexible(text: string, statementYear: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  let transactionId = 1

  // Look for any line with a date and amount
  const datePattern = /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+\d{2,4})?|\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/i
  const amountPattern = /([\d,]+\.\d{2})/g

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip obviously non-transaction lines
    if (line.length < 10 || line.match(/^(Page|Statement|Account|Sort Code|Date|Balance|Total)/i)) {
      continue
    }

    const dateMatch = line.match(datePattern)
    if (!dateMatch) continue

    // Find all amounts on the line
    const amounts: string[] = []
    let amountMatch
    const amountRegex = /([\d,]+\.\d{2})/g
    while ((amountMatch = amountRegex.exec(line)) !== null) {
      amounts.push(amountMatch[1])
    }

    if (amounts.length === 0) continue

    // Extract the first amount as the transaction amount (second is usually balance)
    const amountStr = amounts[0]
    const amount = parseFloat(amountStr.replace(/,/g, ''))

    // Extract description (text between date and first amount)
    let dateStr = dateMatch[1]
    const dateEndPos = (dateMatch.index || 0) + dateMatch[0].length
    const amountPos = line.indexOf(amountStr)
    let description = line.substring(dateEndPos, amountPos).trim()

    // If description is empty, try to get it from surrounding context
    if (!description || description.length < 3) {
      // Look at next line for description continuation
      if (i + 1 < lines.length && !lines[i + 1].match(datePattern)) {
        description = lines[i + 1].trim()
      }
    }

    if (!description || description.length < 2) {
      description = 'Transaction'
    }

    // Normalize date
    let date: string | null = null
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/')
      date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    } else if (dateStr.includes('-')) {
      date = dateStr
    } else {
      const dateParts = dateStr.split(/\s+/)
      const day = dateParts[0].padStart(2, '0')
      const monthStr = dateParts[1]?.toLowerCase()
      const year = dateParts[2] || statementYear

      const monthMap: Record<string, string> = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
      }
      const month = monthMap[monthStr]
      if (month) {
        const fullYear = year.length === 2 ? `20${year}` : year
        date = `${fullYear}-${month}-${day}`
      }
    }

    if (!date) continue

    // Determine type from description
    const lowerDesc = description.toLowerCase()
    let type: 'debit' | 'credit' = 'debit'
    if (lowerDesc.match(/grant|donation|income|received|credit|refund|interest|gift aid/)) {
      type = 'credit'
    }
    if (line.toUpperCase().includes('CR')) {
      type = 'credit'
    }
    if (line.toUpperCase().includes('DR')) {
      type = 'debit'
    }

    const isDuplicate = transactions.some(
      t => t.date === date && t.amount === amount
    )

    if (!isDuplicate) {
      transactions.push({
        id: transactionId.toString(),
        date,
        description,
        amount,
        type,
        balance: undefined
      })
      transactionId++
    }
  }

  return transactions
}

// Universal parser that routes to specific bank parsers
export async function parseUniversalBankStatement(buffer: Buffer, fileName: string): Promise<ParsedBankStatement> {
  try {
    console.log(`Starting universal parsing of: ${fileName}`)

    // Extract text from PDF
    const pdfParse = await import('pdf-parse').then(mod => (mod as any).default || mod)
    const pdfData = await pdfParse(buffer)

    console.log(`PDF contains ${pdfData.numpages} pages with ${pdfData.text.length} characters`)

    // Detect bank type
    const detection = detectBankType(pdfData.text)
    console.log(`Detected bank: ${detection.bankName} (confidence: ${detection.confidence})`)
    console.log(`Matched indicators: ${detection.indicators.join(', ')}`)

    let transactions: Transaction[] = []

    // Route to appropriate parser based on detection
    switch (detection.format) {
      case 'wise':
        transactions = parseWiseTransactions(pdfData.text)
        break
      case 'barclays':
        // Try tabula first for Barclays (fixes multi-page extraction issue)
        const tabulaTransactions = await parseWithTabulaFallback(pdfData.text, buffer, detection.bankName)
        if (tabulaTransactions.length > 0) {
          console.log(`✅ Tabula extraction successful: ${tabulaTransactions.length} transactions`)
          transactions = tabulaTransactions
        } else {
          console.log(`⚠️ Tabula extraction failed, using enhanced text parser`)
          transactions = parseBarclaysTransactions(pdfData.text)
        }
        break
      case 'hsbc':
        // Enhanced HSBC parsing with tabula fallback
        const hsbcTabula = await parseWithTabulaFallback(pdfData.text, buffer, detection.bankName)
        transactions = hsbcTabula.length > 0 ? hsbcTabula : parseHSBCTransactions(pdfData.text)
        break
      case 'lloyds':
        // Enhanced Lloyds parsing with tabula fallback
        const lloydsTabula = await parseWithTabulaFallback(pdfData.text, buffer, detection.bankName)
        transactions = lloydsTabula.length > 0 ? lloydsTabula : parseLloydsTransactions(pdfData.text)
        break
      case 'santander':
        // Enhanced Santander parsing with tabula fallback
        const santanderTabula = await parseWithTabulaFallback(pdfData.text, buffer, detection.bankName)
        transactions = santanderTabula.length > 0 ? santanderTabula : parseSantanderTransactions(pdfData.text)
        break
      case 'natwest':
        // Enhanced NatWest parsing with tabula fallback
        const natwestTabula = await parseWithTabulaFallback(pdfData.text, buffer, detection.bankName)
        transactions = natwestTabula.length > 0 ? natwestTabula : parseNatWestTransactions(pdfData.text)
        break
      case 'monzo':
        transactions = parseMonzoTransactions(pdfData.text)
        break
      case 'starling':
        transactions = parseStarlingTransactions(pdfData.text)
        break
      case 'revolut':
        transactions = parseRevolutTransactions(pdfData.text)
        break
      case 'firstdirect':
        transactions = parseFirstDirectTransactions(pdfData.text)
        break
      case 'metrobank':
        transactions = parseMetroBankTransactions(pdfData.text)
        break
      case 'cooperative':
        transactions = parseCooperativeTransactions(pdfData.text)
        break
      case 'tsbbank':
        transactions = parseTSBTransactions(pdfData.text)
        break
      case 'nationwide':
        transactions = parseNationwideTransactions(pdfData.text)
        break
      case 'virginmoney':
        transactions = parseVirginMoneyTransactions(pdfData.text)
        break
      case 'mbna':
        transactions = parseMBNATransactions(pdfData.text)
        break
      case 'amex':
        transactions = parseAmexTransactions(pdfData.text)
        break
      case 'tescobank':
        transactions = parseTescoBankTransactions(pdfData.text)
        break
      case 'marcus':
        transactions = parseMarcusTransactions(pdfData.text)
        break
      case 'caf':
        // CAF Bank (Charities Aid Foundation) parsing with tabula fallback
        const cafTabula = await parseWithTabulaFallback(pdfData.text, buffer, detection.bankName)
        transactions = cafTabula.length > 0 ? cafTabula : parseCAFTransactions(pdfData.text)
        break
      default:
        // Try generic parsing for unknown banks
        transactions = parseGenericTransactions(pdfData.text)
        break
    }

    console.log(`Successfully extracted ${transactions.length} transactions`)

    if (transactions.length === 0) {
      throw new Error(`No transactions found in ${detection.bankName} statement format. Please ensure this is a valid bank statement PDF.`)
    }

    return {
      transactions,
      fileName,
      totalTransactions: transactions.length,
      bankName: detection.bankName,
      detectedFormat: detection.format
    }

  } catch (error) {
    console.error('Error in universal bank parser:', error)
    throw new Error(`Failed to parse bank statement: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Generic parser for unknown bank formats
function parseGenericTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let transactionId = 1

  for (const line of lines) {
    // Try to match common transaction patterns
    const patterns = [
      // Date + Description + Amount
      /(\d{1,2}\/\d{1,2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})/,
      /(\d{4}-\d{2}-\d{2})\s+(.+?)\s+([\d,]+\.\d{2})/,
      /(\d{1,2}\s+[A-Z]{3}\s+\d{4})\s+(.+?)\s+([\d,]+\.\d{2})/i
    ]

    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match) {
        const [, dateStr, description, amountStr] = match

        let date: string
        if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/')
          date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        } else if (dateStr.includes('-')) {
          date = dateStr
        } else {
          // Handle "DD MMM YYYY" format
          const parts = dateStr.split(/\s+/)
          if (parts.length === 3) {
            const [day, monthAbbr, year] = parts
            const month = getMonthNumber(monthAbbr)
            date = `${year}-${month}-${day.padStart(2, '0')}`
          } else {
            continue
          }
        }

        const amount = parseFloat(amountStr.replace(/,/g, ''))

        // Basic type detection
        const isDebit = description.toLowerCase().includes('debit') ||
                       description.toLowerCase().includes('payment') ||
                       description.toLowerCase().includes('withdrawal') ||
                       description.toLowerCase().includes('purchase')

        transactions.push({
          id: transactionId.toString(),
          date,
          description: description.trim(),
          amount,
          type: isDebit ? 'debit' : 'credit',
          balance: undefined
        })

        transactionId++
        break
      }
    }
  }

  return transactions
}

// Helper function to convert month names to numbers
function getMonthNumber(monthStr: string): string {
  // If already numeric, return as-is
  if (/^\d{1,2}$/.test(monthStr)) {
    return monthStr.padStart(2, '0')
  }

  const months: { [key: string]: string } = {
    'jan': '01', 'january': '01',
    'feb': '02', 'february': '02',
    'mar': '03', 'march': '03',
    'apr': '04', 'april': '04',
    'may': '05',
    'jun': '06', 'june': '06',
    'jul': '07', 'july': '07',
    'aug': '08', 'august': '08',
    'sep': '09', 'september': '09',
    'oct': '10', 'october': '10',
    'nov': '11', 'november': '11',
    'dec': '12', 'december': '12'
  }

  return months[monthStr.toLowerCase()] || '01'
}