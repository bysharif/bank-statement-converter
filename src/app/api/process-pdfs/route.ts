import { NextRequest, NextResponse } from 'next/server'
import { parsePDFBankStatement, consolidateTransactions, generateCSVContent } from '@/lib/csv-utils'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Limit to 10 files for performance
    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 files allowed' },
        { status: 400 }
      )
    }

    // Process each PDF file
    const statements = []
    const errors = []

    for (const file of files) {
      try {
        if (file.type !== 'application/pdf') {
          errors.push(`${file.name}: Not a PDF file`)
          continue
        }

        const statement = await parsePDFBankStatement(file)
        statements.push(statement)
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error)
        errors.push(`${file.name}: Failed to process`)
      }
    }

    if (statements.length === 0) {
      return NextResponse.json(
        { error: 'No valid PDF files could be processed', errors },
        { status: 400 }
      )
    }

    // Consolidate all transactions
    const consolidated = consolidateTransactions(statements)

    // Generate CSV content
    const csvContent = generateCSVContent(consolidated.transactions)

    return NextResponse.json({
      success: true,
      preview: consolidated.transactions.slice(0, 3), // First 3 for preview
      totalTransactions: consolidated.totalTransactions,
      totalFiles: consolidated.totalFiles,
      csvContent,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}