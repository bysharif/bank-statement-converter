import { NextRequest, NextResponse } from 'next/server'
import { AIBankStatementParser } from '@/lib/ai-parser'

export const maxDuration = 60; // 60 seconds for AI processing

// Free tier transaction limit
const FREE_TIER_LIMIT = 50;

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

    console.log(`📥 Processing single PDF with AI: ${file.name}`)

    // Convert file to buffer for server-side parsing
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse with AI
    const parser = new AIBankStatementParser()
    const result = await parser.parsePDF(buffer, file.name, { userTier: 'FREE' })

    if (!result.success) {
      throw new Error(result.error || 'Failed to parse bank statement')
    }

    console.log(`✅ AI parsed ${result.transactionCount} transactions`)

    // Parse CSV to transaction objects
    const allTransactions = parser.parseCSVToTransactions(result.csvContent)

    // Apply free tier limit (50 transactions)
    const limitedTransactions = allTransactions.slice(0, FREE_TIER_LIMIT)
    const isLimited = allTransactions.length > FREE_TIER_LIMIT

    // Generate limited CSV for free tier
    const limitedCSV = generateLimitedCSV(limitedTransactions, result.csvContent)

    const previewTransactions = limitedTransactions.slice(0, 3)

    return NextResponse.json({
      preview: previewTransactions,
      download: limitedTransactions,
      actualTransactionCount: result.transactionCount,
      shownTransactionCount: limitedTransactions.length,
      csvContent: limitedCSV,
      bankName: 'AI Powered',
      detectedFormat: 'ai-universal',
      isLimited,
      limitMessage: isLimited
        ? `Free tier limited to ${FREE_TIER_LIMIT} transactions. Your statement has ${result.transactionCount} transactions. Sign up for unlimited access!`
        : undefined,
      metadata: {
        tokensUsed: result.tokensUsed,
        processingTime: result.processingTime,
        method: 'ai-claude',
      },
    })
  } catch (error: any) {
    console.error('❌ AI Parsing API Error:', error)
    return NextResponse.json(
      { error: 'Failed to parse PDF', details: error.message },
      { status: 500 }
    )
  }
}

// Helper function to generate limited CSV
function generateLimitedCSV(transactions: any[], originalCSV: string): string {
  const headerLine = originalCSV.split('\n')[0]
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
