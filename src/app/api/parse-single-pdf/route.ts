import { NextRequest, NextResponse } from 'next/server'
import { HybridBankParser } from '@/lib/hybrid-parser'
import { parsePDFWithPython } from '@/lib/python-parser'

// Hybrid parser is much faster:
// - Fast pattern matching: 5-10 seconds (95% of cases)
// - AI fallback: 40-70 seconds (5% of cases)
// - Python parser: High accuracy for supported banks (Barclays, Wise, Monzo)
export const maxDuration = 60; // 60 seconds for processing

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

    console.log(`📥 Processing single PDF: ${file.name}`)

    // Convert file to buffer for server-side parsing
    console.log('🔄 Converting file to buffer...')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log(`✅ Buffer created: ${buffer.length} bytes`)

    // Try Python parser first (for supported banks: Barclays, Wise, Monzo)
    console.log('🐍 Attempting Python parser (Barclays, Wise, Monzo)...')
    let result;
    
    try {
      const pythonResult = await parsePDFWithPython(buffer, { userTier: 'FREE' });
      
      if (pythonResult.success && pythonResult.transactionCount > 0) {
        console.log(`✅ Python parser succeeded: ${pythonResult.transactionCount} transactions from ${pythonResult.bankName}`);
        result = {
          success: pythonResult.success,
          method: pythonResult.method || 'python',
          bankName: pythonResult.bankName,
          detectedFormat: pythonResult.detectedFormat,
          transactionCount: pythonResult.transactionCount,
          transactions: pythonResult.transactions,
          csvContent: undefined, // Will generate below
          processingTime: pythonResult.processingTime,
          confidence: pythonResult.confidence,
          error: pythonResult.error,
          accuracyScore: pythonResult.accuracyScore,
        };
      } else {
        console.log('⚠️ Python parser failed or unsupported bank, falling back to Hybrid Parser');
        throw new Error('Python parser not available for this bank');
      }
    } catch (pythonError: any) {
      // Check if error is "unavailable" (expected for unsupported banks) vs actual error
      const isUnavailable = pythonError.message === 'PYTHON_PARSER_UNAVAILABLE';
      
      if (isUnavailable) {
        console.log('⚠️ Python parser not available for this bank (expected for unsupported banks), falling back to Hybrid Parser');
      } else {
        console.log(`⚠️ Python parser error: ${pythonError.message}, falling back to Hybrid Parser`);
      }
      
      // Fallback to Hybrid Parser
      console.log('🚀 Initializing Hybrid Parser (Fast + AI fallback)...')
      const parser = new HybridBankParser()
      console.log('⚡ Starting hybrid parsing (5-10 seconds for known banks)...')
      result = await parser.parsePDF(buffer, file.name, { userTier: 'FREE' })
    }

    console.log(`📊 Hybrid parsing result:`)
    console.log(`   - Success: ${result.success}`)
    console.log(`   - Method: ${result.method}`)
    console.log(`   - Bank: ${result.bankName}`)
    console.log(`   - Transactions: ${result.transactionCount}`)
    console.log(`   - Confidence: ${result.confidence}`)
    console.log(`   - Processing time: ${result.processingTime}ms`)

    if (!result.success) {
      console.error(`❌ Hybrid parsing failed: ${result.error}`)
      throw new Error(result.error || 'Failed to parse bank statement')
    }

    console.log(`✅ Hybrid parser extracted ${result.transactionCount} transactions in ${result.processingTime}ms`)
    console.log(`   - Used ${result.method} method`)

    // Get transactions from result
    const allTransactions = result.transactions
    console.log(`✅ Got ${allTransactions.length} transaction objects`)

    // Apply free tier limit (50 transactions)
    const limitedTransactions = allTransactions.slice(0, FREE_TIER_LIMIT)
    const isLimited = allTransactions.length > FREE_TIER_LIMIT

    console.log(`📊 Limiting transactions: ${allTransactions.length} → ${limitedTransactions.length} (isLimited: ${isLimited})`)

    // Generate limited CSV for free tier
    let limitedCSV = result.csvContent
      ? generateLimitedCSV(limitedTransactions, result.csvContent)
      : generateCSVFromTransactions(limitedTransactions)
    
    // If using Python parser and no CSV content, generate from transactions
    if (!limitedCSV || limitedCSV.length < 10) {
      limitedCSV = generateCSVFromTransactions(limitedTransactions)
    }

    const previewTransactions = limitedTransactions.slice(0, 3)

    const responseData = {
      preview: previewTransactions,
      download: limitedTransactions,
      actualTransactionCount: result.transactionCount,
      shownTransactionCount: limitedTransactions.length,
      csvContent: limitedCSV,
      bankName: result.bankName,
      detectedFormat: result.detectedFormat,
      isLimited,
      limitMessage: isLimited
        ? `Free tier limited to ${FREE_TIER_LIMIT} transactions. Your statement has ${result.transactionCount} transactions. Sign up for unlimited access!`
        : undefined,
      metadata: {
        processingTime: result.processingTime,
        method: result.method,
        confidence: result.confidence,
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

// Helper function to generate CSV from transactions
function generateCSVFromTransactions(transactions: any[]): string {
  const lines = ['Date,Description,Debit,Credit,Balance']

  transactions.forEach(txn => {
    const debit = txn.type === 'debit' ? txn.amount.toFixed(2) : ''
    const credit = txn.type === 'credit' ? txn.amount.toFixed(2) : ''
    const balance = txn.balance ? txn.balance.toFixed(2) : ''
    const description = txn.description.includes(',') ? `"${txn.description}"` : txn.description

    lines.push(`${txn.date},${description},${debit},${credit},${balance}`)
  })

  return lines.join('\n')
}
