import PDFParser from 'pdf2json'

interface Transaction {
  id: string
  date: string
  description: string
  type: 'credit' | 'debit'
  amount: number
}

interface BankStatement {
  bankName: string
  accountNumber?: string
  sortCode?: string
  transactions: Transaction[]
  totalTransactions: number
  detectedFormat: string
}

// Serverless-compatible PDF parser using pdf2json
export async function parseServerlessBankStatement(buffer: Buffer, filename: string): Promise<BankStatement> {
  console.log('🔄 Starting serverless PDF parsing with pdf2json')

  try {
    const pdfParser = new PDFParser()

    // Parse PDF using pdf2json (no native dependencies)
    const pdfData = await new Promise<any>((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (error: any) => {
        console.error('pdf2json parsing error:', error)
        reject(error)
      })

      pdfParser.on('pdfParser_dataReady', (data: any) => {
        console.log('✅ pdf2json parsing successful')
        resolve(data)
      })

      pdfParser.parseBuffer(buffer)
    })

    // Extract text from PDF
    const extractedText = extractTextFromPDF(pdfData)
    console.log(`📄 Extracted ${extractedText.length} characters of text`)

    // Detect bank and parse transactions
    const bankName = detectBankFromText(extractedText, filename)
    console.log(`🏦 Detected bank: ${bankName}`)

    const transactions = parseTransactionsFromText(extractedText, bankName)
    console.log(`💰 Parsed ${transactions.length} transactions`)

    return {
      bankName,
      transactions,
      totalTransactions: transactions.length,
      detectedFormat: 'pdf2json-serverless',
      accountNumber: extractAccountNumber(extractedText),
      sortCode: extractSortCode(extractedText)
    }
  } catch (error) {
    console.error('❌ Serverless PDF parsing failed:', error)
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function extractTextFromPDF(pdfData: any): string {
  let fullText = ''

  if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
    for (const page of pdfData.Pages) {
      if (page.Texts && Array.isArray(page.Texts)) {
        for (const textItem of page.Texts) {
          if (textItem.R && Array.isArray(textItem.R)) {
            for (const run of textItem.R) {
              if (run.T) {
                // Decode URI-encoded text
                fullText += decodeURIComponent(run.T) + ' '
              }
            }
          }
        }
      }
    }
  }

  return fullText
}

function detectBankFromText(text: string, filename: string): string {
  const textLower = text.toLowerCase()
  const filenameLower = filename.toLowerCase()

  // Bank detection patterns
  const banks = [
    { name: 'Barclays', patterns: ['barclays', 'barclay'] },
    { name: 'HSBC', patterns: ['hsbc', 'hong kong', 'shanghai'] },
    { name: 'Lloyds Bank', patterns: ['lloyds', 'lloyds bank'] },
    { name: 'NatWest', patterns: ['natwest', 'nat west', 'national westminster'] },
    { name: 'Santander', patterns: ['santander'] },
    { name: 'TSB', patterns: ['tsb', 'trustee savings bank'] },
    { name: 'Halifax', patterns: ['halifax'] },
    { name: 'Nationwide', patterns: ['nationwide'] },
    { name: 'First Direct', patterns: ['first direct', 'firstdirect'] },
    { name: 'Monzo', patterns: ['monzo'] },
    { name: 'Starling Bank', patterns: ['starling', 'starling bank'] },
    { name: 'Revolut', patterns: ['revolut'] },
    { name: 'Metro Bank', patterns: ['metro bank', 'metrobank'] },
    { name: 'Virgin Money', patterns: ['virgin money', 'virgin'] },
    { name: 'Yorkshire Bank', patterns: ['yorkshire bank', 'yorkshire'] },
    { name: 'Clydesdale Bank', patterns: ['clydesdale', 'clydesdale bank'] },
    { name: 'RBS', patterns: ['rbs', 'royal bank of scotland'] },
    { name: 'Bank of Scotland', patterns: ['bank of scotland', 'bos'] },
    { name: 'Co-operative Bank', patterns: ['co-operative', 'coop', 'co-op'] }
  ]

  for (const bank of banks) {
    for (const pattern of bank.patterns) {
      if (textLower.includes(pattern) || filenameLower.includes(pattern)) {
        return bank.name
      }
    }
  }

  return 'Unknown Bank'
}

function parseTransactionsFromText(text: string, bankName: string): Transaction[] {
  const transactions: Transaction[] = []
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0)

  console.log(`📝 Processing ${lines.length} lines of text`)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Look for date patterns (various UK formats)
    const datePatterns = [
      /(\d{1,2})[\/\-\s](\d{1,2})[\/\-\s](\d{2,4})/,  // DD/MM/YY or DD-MM-YYYY
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,       // YYYY/MM/DD
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{2,4})/i // DD MMM YY
    ]

    let dateMatch = null
    for (const pattern of datePatterns) {
      dateMatch = line.match(pattern)
      if (dateMatch) break
    }

    if (dateMatch) {
      // Found a potential transaction line
      const transaction = parseTransactionLine(line, lines, i, bankName)
      if (transaction) {
        transactions.push(transaction)
      }
    }
  }

  return transactions
}

function parseTransactionLine(line: string, allLines: string[], lineIndex: number, bankName: string): Transaction | null {
  try {
    // Extract date
    const dateMatch = line.match(/(\d{1,2})[\/\-\s](\d{1,2})[\/\-\s](\d{2,4})/)
    if (!dateMatch) return null

    const [, day, month, year] = dateMatch
    const fullYear = year.length === 2 ? `20${year}` : year
    const date = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

    // Extract amount (look for money patterns)
    const amountPatterns = [
      /£?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,  // £1,234.56 or 1234.56
      /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*£?/   // 1234.56£
    ]

    let amount = 0
    let amountStr = ''

    // Look for amount in current line and surrounding lines
    const searchLines = [line]
    if (lineIndex + 1 < allLines.length) searchLines.push(allLines[lineIndex + 1])
    if (lineIndex > 0) searchLines.push(allLines[lineIndex - 1])

    for (const searchLine of searchLines) {
      for (const pattern of amountPatterns) {
        const amountMatch = searchLine.match(pattern)
        if (amountMatch) {
          amountStr = amountMatch[1].replace(/,/g, '')
          amount = parseFloat(amountStr)
          if (!isNaN(amount)) break
        }
      }
      if (amount > 0) break
    }

    if (amount === 0) return null

    // Determine transaction type
    let type: 'credit' | 'debit' = 'debit'
    const creditKeywords = ['credit', 'deposit', 'transfer in', 'salary', 'payment received', 'refund']
    const debitKeywords = ['debit', 'withdrawal', 'payment', 'direct debit', 'card payment', 'fee']

    const lowerLine = line.toLowerCase()
    if (creditKeywords.some(keyword => lowerLine.includes(keyword))) {
      type = 'credit'
    } else if (debitKeywords.some(keyword => lowerLine.includes(keyword))) {
      type = 'debit'
    } else {
      // Heuristic: smaller amounts are more likely debits
      type = amount > 500 ? 'credit' : 'debit'
    }

    // Extract description
    let description = line
      .replace(dateMatch[0], '')
      .replace(amountStr, '')
      .replace(/£/g, '')
      .trim()

    if (!description) {
      description = 'Transaction'
    }

    // Clean up description
    description = description.replace(/\s+/g, ' ').substring(0, 100)

    return {
      id: Math.random().toString(36).substr(2, 9),
      date,
      description,
      type,
      amount
    }

  } catch (error) {
    console.error('Error parsing transaction line:', error)
    return null
  }
}

function extractAccountNumber(text: string): string | undefined {
  const accountMatch = text.match(/(?:account|acc|a\/c)[:\s]*(\d{8})/i)
  return accountMatch ? accountMatch[1] : undefined
}

function extractSortCode(text: string): string | undefined {
  const sortCodeMatch = text.match(/(?:sort code|sort|sc)[:\s]*(\d{2}[-\s]?\d{2}[-\s]?\d{2})/i)
  return sortCodeMatch ? sortCodeMatch[1].replace(/[-\s]/g, '') : undefined
}