import { NextRequest, NextResponse } from 'next/server'
import { AIBankStatementParser } from '@/lib/ai-parser'
import { parsePDFWithPython, ParsedTransaction } from '@/lib/python-parser'
import { createClient } from '@/lib/supabase/server'
import { canUserConvert, incrementConversionCount, getUserSubscription } from '@/lib/subscription'

export const maxDuration = 300; // 5 minutes - Vercel Pro allows up to 300s

// Convert DD/MM/YYYY or MM/DD/YYYY to YYYY-MM-DD format for PostgreSQL
function convertToISODate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0]

  // Try to parse the date string
  const parts = dateStr.split(/[\/\-]/)

  if (parts.length === 3) {
    // Check if it's DD/MM/YYYY format (most common in bank statements)
    const day = parseInt(parts[0])
    const month = parseInt(parts[1])
    const year = parseInt(parts[2])

    // Validate and convert
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      const fullYear = year < 100 ? 2000 + year : year
      return `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }

  // Fallback: try to parse as a date and convert
  try {
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
  } catch (e) {
    console.error('Failed to parse date:', dateStr)
  }

  // Last resort: return current date
  return new Date().toISOString().split('T')[0]
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to convert files.' },
        { status: 401 }
      )
    }

    // Check if user can convert
    const canConvert = await canUserConvert(user.id)
    if (!canConvert) {
      return NextResponse.json(
        {
          error: 'Monthly conversion limit reached',
          message: 'You have reached your monthly conversion limit. Please upgrade your plan to continue converting.',
          upgradeUrl: '/pricing'
        },
        { status: 403 }
      )
    }

    // Get user's subscription for tier info
    const subscription = await getUserSubscription(user.id)
    if (!subscription) {
      return NextResponse.json(
        { error: 'Could not fetch subscription info' },
        { status: 500 }
      )
    }

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

    // Process each PDF file - try Python parser first, fall back to AI
    const aiParser = new AIBankStatementParser()
    const allTransactions: any[] = []
    const errors: string[] = []
    let totalTokens = 0
    let parsingMethod = 'unknown'

    for (const file of files) {
      try {
        if (file.type !== 'application/pdf') {
          errors.push(`${file.name}: Not a PDF file`)
          continue
        }

        // Convert to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        let transactions: any[] = []
        let parseSuccess = false

        // ============================================
        // LAYER 1: Try Python parser first (faster, specialized)
        // Supports: Barclays, Wise, Monzo, Lloyds, Revolut, HSBC, ANNA, Santander, NatWest
        // ============================================
        try {
          console.log(`🐍 [${file.name}] Attempting Python parser...`)
          const pythonResult = await parsePDFWithPython(buffer, {
            userTier: subscription.tier.toUpperCase() as 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
          })

          if (pythonResult.success && pythonResult.transactions.length > 0) {
            console.log(`✅ [${file.name}] Python parser succeeded: ${pythonResult.transactionCount} transactions from ${pythonResult.bankName}`)

            // Convert Python transactions to our format - preserve debit/credit fields
            transactions = pythonResult.transactions.map((tx: ParsedTransaction, index: number) => {
              // Determine type from the transaction data
              const isCredit = tx.type === 'credit' || tx.type === 'income' || (tx.credit && tx.credit > 0)
              
              return {
                id: `txn_${index + 1}`,
                date: tx.date,
                description: tx.description,
                amount: tx.amount || (isCredit ? tx.credit : tx.debit) || 0,
                type: isCredit ? 'credit' : 'debit',
                balance: tx.balance,
                // Preserve original debit/credit values for accurate CSV generation
                debit: tx.debit || 0,
                credit: tx.credit || 0,
              }
            })

            parseSuccess = true
            parsingMethod = 'python'
          } else {
            console.log(`⚠️ [${file.name}] Python parser returned no transactions: ${pythonResult.error || 'unknown reason'}`)
          }
        } catch (pythonError: any) {
          // Python parser failed or unavailable - this is expected for unsupported banks
          if (pythonError.message === 'PYTHON_PARSER_UNAVAILABLE') {
            console.log(`ℹ️ [${file.name}] Python parser unavailable (unsupported bank), falling back to AI`)
          } else if (pythonError.message === 'PYTHON_PARSER_TIMEOUT') {
            console.log(`⏱️ [${file.name}] Python parser timeout (30s), falling back to AI`)
          } else {
            console.log(`⚠️ [${file.name}] Python parser error: ${pythonError.message}, falling back to AI`)
          }
          // Always continue to AI fallback - don't let Python errors block the process
        }

        // ============================================
        // LAYER 2: Fall back to AI parser if Python failed
        // Handles all banks, encrypted PDFs, unknown formats
        // ============================================
        if (!parseSuccess) {
          console.log(`🤖 [${file.name}] Using AI parser...`)
          const aiResult = await aiParser.parsePDF(buffer, file.name, {
            userTier: subscription.tier.toUpperCase() as 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'BUSINESS'
          })

          if (aiResult.success) {
            transactions = aiParser.parseCSVToTransactions(aiResult.csvContent)
            totalTokens += aiResult.tokensUsed || 0
            parseSuccess = true
            parsingMethod = 'ai-claude'
            console.log(`✅ [${file.name}] AI parser succeeded: ${transactions.length} transactions`)
          } else {
            errors.push(`${file.name}: ${aiResult.error}`)
            console.log(`❌ [${file.name}] AI parser failed: ${aiResult.error}`)
          }
        }

        if (parseSuccess) {
          allTransactions.push(...transactions)
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

    // Increment conversion count
    const incrementSuccess = await incrementConversionCount(user.id)
    if (!incrementSuccess) {
      console.error('Failed to increment conversion count for user:', user.id)
    }

    // Save conversion job to database
    const processingTime = Date.now() - startTime
    let jobId: string | null = null

    try {
      const { data: job, error: jobError } = await supabase
        .from('conversion_jobs')
        .insert({
          user_id: user.id,
          original_filename: files.map(f => f.name).join(', '),
          file_size: files.reduce((sum, f) => sum + f.size, 0),
          file_type: 'pdf',
          bank_detected: 'AI-Detected',
          input_format: 'pdf',
          output_format: 'csv',
          status: 'completed',
          progress: 100,
          transactions_count: allTransactions.length,
          processing_time_ms: processingTime,
          parser_version: 'ai-claude-v1',
          completed_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (jobError) {
        console.error('Failed to save conversion job:', jobError)
      } else if (job) {
        jobId = job.id

        // Save individual transactions
        if (allTransactions.length > 0) {
          const transactionRecords = allTransactions.map((txn, index) => ({
            job_id: job.id,
            transaction_date: convertToISODate(txn.date),
            description: txn.description,
            amount: parseFloat(txn.amount) || 0,
            balance: txn.balance ? parseFloat(txn.balance) : null,
            row_number: index + 1,
          }))

          const { error: txnError } = await supabase
            .from('transactions')
            .insert(transactionRecords)

          if (txnError) {
            console.error('Failed to save transactions:', txnError)
          }
        }
      }
    } catch (dbError) {
      console.error('Database save error:', dbError)
      // Don't fail the conversion if DB save fails
    }

    // Generate CSV
    const csvContent = generateBatchCSV(allTransactions)

    return NextResponse.json({
      success: true,
      preview: allTransactions.slice(0, 3),
      download: allTransactions,
      totalTransactions: allTransactions.length,
      shownTransactionCount: allTransactions.length,
      totalFiles: files.length,
      csvContent,
      subscription: {
        tier: subscription.tier,
        conversionsUsedThisMonth: subscription.conversionsUsedThisMonth + 1,
        conversionsLimit: subscription.conversionsLimit,
      },
      metadata: {
        tokensUsed: totalTokens,
        method: parsingMethod === 'python' ? 'python-specialized' : 'ai-claude-fallback',
        parserUsed: parsingMethod,
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
  const headerLine = 'Date,Description,Debit,Credit'
  const csvLines = [headerLine]

  transactions.forEach(txn => {
    // Use explicit debit/credit fields if available, otherwise derive from type + amount
    let debit = ''
    let credit = ''
    
    if (txn.debit !== undefined && txn.debit > 0) {
      debit = txn.debit.toFixed(2)
    } else if (txn.credit !== undefined && txn.credit > 0) {
      credit = txn.credit.toFixed(2)
    } else if (txn.amount !== undefined && !isNaN(txn.amount)) {
      // Fallback to type + amount
      if (txn.type === 'debit') {
        debit = txn.amount.toFixed(2)
      } else {
        credit = txn.amount.toFixed(2)
      }
    }
    
    const description = (txn.description || '').includes(',') ? `"${txn.description}"` : (txn.description || '')

    csvLines.push(`${txn.date},${description},${debit},${credit}`)
  })

  return csvLines.join('\n')
}