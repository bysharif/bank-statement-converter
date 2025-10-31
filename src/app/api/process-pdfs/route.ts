import { NextRequest, NextResponse } from 'next/server'
import { AIBankStatementParser } from '@/lib/ai-parser'

export const maxDuration = 60;

// Free tier limit
const FREE_TIER_LIMIT = 50;

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

    // Process each PDF file with AI
    const parser = new AIBankStatementParser()
    const allTransactions: any[] = []
    const errors: string[] = []
    let totalTokens = 0

    for (const file of files) {
      try {
        if (file.type !== 'application/pdf') {
          errors.push(`${file.name}: Not a PDF file`)
          continue
        }

        // Convert to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Parse with AI
        const result = await parser.parsePDF(buffer, file.name, { userTier: 'FREE' })

        if (result.success) {
          const transactions = parser.parseCSVToTransactions(result.csvContent)
          allTransactions.push(...transactions)
          totalTokens += result.tokensUsed || 0
        } else {
          errors.push(`${file.name}: ${result.error}`)
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error)
        errors.push(`${file.name}: Failed to process`)
      }
    }

    if (allTransactions.length === 0) {
      return NextResponse.json(
        { error: 'No valid PDF files could be processed', errors },
        { status: 400 }
      )
    }

    // Apply free tier limit
    const limitedTransactions = allTransactions.slice(0, FREE_TIER_LIMIT)
    const isLimited = allTransactions.length > FREE_TIER_LIMIT

    // Generate CSV
    const csvContent = generateBatchCSV(limitedTransactions)

    return NextResponse.json({
      success: true,
      preview: limitedTransactions.slice(0, 3),
      download: limitedTransactions,
      totalTransactions: allTransactions.length,
      shownTransactionCount: limitedTransactions.length,
      totalFiles: files.length,
      csvContent,
      isLimited,
      limitMessage: isLimited
        ? `Free tier limited to ${FREE_TIER_LIMIT} transactions total. Your statements have ${allTransactions.length} transactions. Sign up for unlimited access!`
        : undefined,
      metadata: {
        tokensUsed: totalTokens,
        method: 'ai-claude-batch',
      },
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

// Helper to generate CSV from multiple files
function generateBatchCSV(transactions: any[]): string {
  const headerLine = 'Date,Description,Debit,Credit,Balance'
  const csvLines = [headerLine]

  transactions.forEach(txn => {
    const debit = txn.type === 'debit' ? txn.amount.toFixed(2) : ''
    const credit = txn.type === 'credit' ? txn.amount.toFixed(2) : ''
    const balance = txn.balance ? txn.balance.toFixed(2) : ''
    const description = txn.description.includes(',') ? `"${txn.description}"` : txn.description

    csvLines.push(`${txn.date},${description},${debit},${credit},${balance}`)
  })

  return csvLines.join('\n')
}