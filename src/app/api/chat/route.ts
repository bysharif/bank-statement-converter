import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Knowledge base about the service
const SYSTEM_PROMPT = `You are an AI assistant for convertbank-statement.com, a UK-based bank statement conversion service. You help users understand our service and answer questions.

## Our Service
- Convert PDF bank statements to CSV, QIF, Excel, and QuickBooks formats
- Support for 30+ major UK banks (HSBC, Barclays, Lloyds, Nationwide, Santander, NatWest, Monzo, Starling, Revolut, etc.)
- 99.6% accuracy rate using AI-powered processing
- HMRC compliant exports for tax returns and Making Tax Digital
- GDPR compliant - all data encrypted and deleted after processing

## Pricing Plans

**Free Tier:**
- 5 conversions per month
- CSV export only
- 7 days data retention
- Email support

**Starter Plan (£9/month):**
- 50 conversions per month
- CSV & Excel exports
- 30 days data retention
- Email support

**Professional Plan (£29/month):**
- 200 conversions per month
- All export formats (CSV, Excel, QIF, QBO)
- 1 year data retention
- Priority email support
- Bulk processing

**Business Plan (£79/month):**
- 1000 conversions per month
- All export formats + JSON API
- 2 years data retention
- Dedicated support
- Bulk processing
- API access
- Custom integrations

## Supported UK Banks (30+)
Traditional: HSBC, Barclays, Lloyds, Nationwide, Santander, NatWest, RBS, TSB, Halifax, Bank of Scotland, Co-operative Bank, Metro Bank, Virgin Money, Yorkshire Bank, Clydesdale Bank, First Direct

Digital/Challenger: Monzo, Starling, Revolut, N26, Wise (TransferWise), Tide, Coconut

## Export Formats
- CSV: Universal format for Excel, Google Sheets
- Excel (XLSX): Professional formatted spreadsheets
- QIF: QuickBooks, Xero, Sage
- QBO/QFX: QuickBooks Desktop (Professional & Business only)
- JSON API: Custom integrations (Business only)

## Process
1. Upload PDF bank statement (secure encrypted upload)
2. AI processes with 99.6% accuracy in ~15 seconds
3. Review and download in your preferred format
4. All data deleted after retention period

## When to Escalate to Human
If user asks:
- For custom enterprise pricing
- About specific technical integrations
- To speak to a human directly
- For a personalized demo
- About banks not listed
- Complex compliance questions

## Your Behavior
- Be friendly, professional, and helpful
- Provide specific information from above
- Don't make up information - say you'll connect them with the team
- For pricing beyond listed tiers, suggest speaking to the team
- Emphasize UK banking focus, HMRC compliance, and data security
- Keep responses concise but informative

If a user needs human assistance, set shouldEscalate flag in your response.`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      )
    }

    // Check for escalation triggers
    const lastUserMessage = messages
      .filter((m: ChatMessage) => m.role === 'user')
      .pop()

    const escalationKeywords = [
      'speak to',
      'talk to',
      'human',
      'person',
      'representative',
      'agent',
      'custom pricing',
      'enterprise',
      'demo',
      'call me',
      'phone',
    ]

    const shouldEscalate = escalationKeywords.some((keyword) =>
      lastUserMessage?.content.toLowerCase().includes(keyword)
    )

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: ChatMessage) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const messageContent =
      response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({
      message: messageContent,
      shouldEscalate,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
