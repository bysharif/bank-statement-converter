import { NextRequest, NextResponse } from 'next/server'
import { parseUniversalBankStatement } from '@/lib/universal-bank-parser'
import { parseServerlessBankStatement } from '@/lib/serverless-bank-parser'
import { generateCSVContent } from '@/lib/csv-utils'

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

    console.log(`Processing single PDF: ${file.name}`)

    // Convert file to buffer for server-side parsing
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Try main parser first, fall back to serverless parser
    let statement
    try {
      console.log('🚀 Attempting main PDF parser (pdf-parse)')
      statement = await parseUniversalBankStatement(buffer, file.name)
    } catch (mainParserError) {
      console.log('⚠️ Main parser failed, trying serverless fallback (pdf2json)')
      console.error('Main parser error:', mainParserError)
      statement = await parseServerlessBankStatement(buffer, file.name)
    }

    console.log(`Parsed ${statement.totalTransactions} transactions from ${statement.bankName} statement: ${file.name}`)

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

    // Generate preview data (first 3 transactions)
    const preview = statement.transactions.slice(0, 3)

    // Generate download data (first 50 transactions for free users)
    const download = statement.transactions.slice(0, 50)

    // Generate CSV content for the download
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
      sortCode: statement.sortCode
    })

  } catch (error) {
    console.error('Error parsing single PDF:', error)
    return NextResponse.json(
      { error: 'Failed to parse PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}