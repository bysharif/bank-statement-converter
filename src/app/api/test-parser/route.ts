import { NextRequest, NextResponse } from 'next/server'

// Test endpoint to verify Wise parser works with extracted text
export async function POST(request: NextRequest) {
  console.log('=== PARSER TEST ENDPOINT CALLED ===')

  try {
    const body = await request.json()
    const { text } = body

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    console.log('Test text received, length:', text.length)
    console.log('First 1000 chars:', text.substring(0, 1000))
    console.log('Last 500 chars:', text.substring(text.length - 500))

    // Import the Wise parser
    const { WiseParser } = require('@/lib/parsers/wise-parser')

    console.log('Testing Wise parser identification...')
    const isWise = WiseParser.identify(text)
    console.log('Wise identified:', isWise)

    if (!isWise) {
      return NextResponse.json({
        success: false,
        error: 'Text not identified as Wise format',
        textLength: text.length,
        identificationResult: isWise
      })
    }

    console.log('Starting Wise parser...')
    const transactions = WiseParser.parse(text)
    console.log('Parser completed, found:', transactions.length, 'transactions')

    // Return results
    return NextResponse.json({
      success: true,
      textLength: text.length,
      identificationResult: isWise,
      transactionCount: transactions.length,
      firstFewTransactions: transactions.slice(0, 5),
      lastFewTransactions: transactions.slice(-5),
      sampleDescriptions: transactions.slice(0, 20).map((t: any) => ({
        description: t.description,
        amount: t.amount,
        date: t.date,
        transactionId: t.transactionId
      }))
    })

  } catch (error) {
    console.error('Parser test error:', error)
    return NextResponse.json(
      {
        error: `Parser test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Parser Test Endpoint',
    description: 'Send POST request with { "text": "your extracted text" } to test parser'
  })
}