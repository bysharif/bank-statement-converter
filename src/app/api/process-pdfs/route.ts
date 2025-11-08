import { NextRequest, NextResponse } from 'next/server'
import { AIBankStatementParser } from '@/lib/ai-parser'
import { createClient } from '@/lib/supabase/server'
import { canUserConvert, incrementConversionCount, getUserSubscription } from '@/lib/subscription'

export const maxDuration = 60;

export async function POST(request: NextRequest) {
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
        const result = await parser.parsePDF(buffer, file.name, {
          userTier: subscription.tier.toUpperCase() as 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'BUSINESS'
        })

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

    // Increment conversion count
    const incrementSuccess = await incrementConversionCount(user.id)
    if (!incrementSuccess) {
      console.error('Failed to increment conversion count for user:', user.id)
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
        conversionsUsed: subscription.conversionsUsedThisMonth + 1,
        conversionsLimit: subscription.conversionsLimit,
      },
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