import { NextRequest, NextResponse } from 'next/server'
import { AIBankStatementParser } from '@/lib/ai-parser'

export const maxDuration = 60; // 60 seconds for AI processing

// Free tier transaction limit
const FREE_TIER_LIMIT = 50;

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('🎯 API /parse-single-pdf called at', new Date().toISOString())

  try {
    console.log('📝 Parsing form data...')
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.error('❌ No file provided in form data')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log(`📄 File received: ${file.name}, size: ${file.size} bytes, type: ${file.type}`)

    if (file.type !== 'application/pdf') {
      console.error(`❌ Invalid file type: ${file.type}`)
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    console.log(`📥 Processing single PDF with AI: ${file.name}`)

    // Convert file to buffer for server-side parsing
    console.log('🔄 Converting file to buffer...')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log(`✅ Buffer created: ${buffer.length} bytes`)

    // Parse with AI
    console.log('🤖 Initializing AI parser...')
    const parser = new AIBankStatementParser()

    console.log('🚀 Starting AI parsing...')
    const result = await parser.parsePDF(buffer, file.name, { userTier: 'FREE' })

    console.log(`📊 AI parsing result - Success: ${result.success}, Transactions: ${result.transactionCount}`)

    if (!result.success) {
      console.error(`❌ AI parsing failed: ${result.error}`)
      throw new Error(result.error || 'Failed to parse bank statement')
    }

    console.log(`✅ AI parsed ${result.transactionCount} transactions`)
    console.log(`📋 CSV content length: ${result.csvContent.length} characters`)

    // Parse CSV to transaction objects
    console.log('🔄 Converting CSV to transaction objects...')
    const allTransactions = parser.parseCSVToTransactions(result.csvContent)
    console.log(`✅ Converted to ${allTransactions.length} transaction objects`)

    // Apply free tier limit (50 transactions)
    const limitedTransactions = allTransactions.slice(0, FREE_TIER_LIMIT)
    const isLimited = allTransactions.length > FREE_TIER_LIMIT

    console.log(`📊 Limiting transactions: ${allTransactions.length} → ${limitedTransactions.length} (isLimited: ${isLimited})`)

    // Generate limited CSV for free tier
    const limitedCSV = generateLimitedCSV(limitedTransactions, result.csvContent)

    const previewTransactions = limitedTransactions.slice(0, 3)

    const responseData = {
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
    }

    const totalTime = Date.now() - startTime
    console.log(`✅ API request completed successfully in ${totalTime}ms`)
    console.log(`📤 Returning ${previewTransactions.length} preview transactions, ${limitedTransactions.length} download transactions`)

    return NextResponse.json(responseData)
  } catch (error: any) {
    const totalTime = Date.now() - startTime
    console.error(`❌ AI Parsing API Error after ${totalTime}ms:`, error)
    console.error('Error stack:', error.stack)

    return NextResponse.json(
      { error: 'Failed to parse PDF', details: error.message || String(error) },
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
