import { NextRequest, NextResponse } from 'next/server'
import { parseUniversalBankStatement } from '@/lib/universal-bank-parser'
import { parseServerlessBankStatement } from '@/lib/serverless-bank-parser'
import { parseTextFallback } from '@/lib/text-fallback-parser'
import { generateCSVContent } from '@/lib/csv-utils'
import { parseMonzoStatement, isMonzoStatement } from '@/lib/monzo-parser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    console.log(`📥 Processing single PDF: ${file.name}`)

    // Convert file to buffer for server-side parsing
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Three-layer fallback system for maximum reliability
    let statement
    let parseMethod = ''
    
    try {
      console.log('🚀 Attempting main PDF parser (pdf-parse)')
      statement = await parseUniversalBankStatement(buffer, file.name)
      parseMethod = 'universal'
      
      // Special handling for Monzo - the universal parser might not catch everything
      if (statement.bankName === 'Monzo' || statement.detectedFormat === 'monzo') {
        console.log('🏦 Detected Monzo statement, using specialized Monzo parser')
        const pdfParse = await import('pdf-parse').then(mod => (mod as any).default || mod)
        const pdfData = await pdfParse(buffer)
        
        if (isMonzoStatement(pdfData.text)) {
          const monzoData = parseMonzoStatement(pdfData.text)
          if (monzoData.transactions.length > 0) {
            console.log(`✅ Monzo parser extracted ${monzoData.transactions.length} transactions`)
            statement = {
              ...statement,
              transactions: monzoData.transactions,
              totalTransactions: monzoData.transactions.length,
              accountNumber: monzoData.accountNumber || statement.accountNumber,
              sortCode: monzoData.sortCode || statement.sortCode,
              bankName: 'Monzo',
              detectedFormat: 'monzo'
            }
            parseMethod = 'monzo-specialized'
          }
        }
      }
    } catch (mainParserError) {
      console.log('⚠️ Main parser failed, trying serverless fallback (pdf2json)')
      console.error('Main parser error:', mainParserError)
      try {
        statement = await parseServerlessBankStatement(buffer, file.name)
        parseMethod = 'serverless'
      } catch (serverlessError) {
        console.log('⚠️ Serverless parser failed, using text fallback (guaranteed to work)')
        console.error('Serverless parser error:', serverlessError)
        statement = await parseTextFallback(buffer, file.name)
        parseMethod = 'text-fallback'
      }
    }

    console.log(`✅ Parsed ${statement.totalTransactions} transactions from ${statement.bankName} statement using ${parseMethod} parser`)

    // Validate that we actually parsed transactions
    if (statement.transactions.length === 0) {
      return NextResponse.json(
        {
          error: `No transactions found in ${statement.bankName} PDF statement. Please ensure this is a valid ${statement.bankName} bank statement PDF.`,
          bankName: statement.bankName,
          detectedFormat: statement.detectedFormat
        },
        { status: 400 }
      )
    }

    // Sort transactions by date (newest first for display)
    statement.transactions.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    // Generate preview data (first 5 transactions for display)
    const preview = statement.transactions.slice(0, 5)

    // For download, include ALL transactions (not just 50)
    const download = statement.transactions

    // Generate CSV content with the new format (separate Debit/Credit columns)
    const csvContent = generateCSVContent(download)

    return NextResponse.json({
      success: true,
      fileName: file.name,
      preview,
      download,
      csvContent,
      totalTransactions: statement.totalTransactions,
      actualTransactionCount: statement.transactions.length,
      bankName: statement.bankName,
      detectedFormat: statement.detectedFormat,
      accountNumber: statement.accountNumber,
      sortCode: statement.sortCode,
      parseMethod // Include this for debugging
    })

  } catch (error) {
    console.error('❌ Error parsing single PDF:', error)
    return NextResponse.json(
      { 
        error: 'Failed to parse PDF', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
