import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-utils'

// UK Tax Categories for business expenses
const UK_TAX_CATEGORIES = {
  // Allowable business expenses
  office_costs: ['office rent', 'office supplies', 'stationery', 'office equipment'],
  travel_expenses: ['fuel', 'train tickets', 'taxi', 'hotel', 'parking', 'mileage'],
  marketing: ['advertising', 'website costs', 'marketing materials', 'social media ads'],
  professional_services: ['accountant', 'solicitor', 'consultant', 'legal fees'],
  utilities: ['electricity', 'gas', 'internet', 'phone bills', 'water'],
  equipment: ['computer', 'software', 'tools', 'machinery'],
  training: ['courses', 'training', 'books', 'subscriptions'],
  insurance: ['business insurance', 'professional indemnity'],

  // Income categories
  income: ['payment received', 'invoice payment', 'sales', 'commission'],

  // Personal/non-deductible
  personal: ['groceries', 'personal shopping', 'entertainment', 'personal fuel']
}

// Mock AI categorisation function
// In production, this would integrate with Claude API or similar
async function categoriseTransaction(description: string, amount: number, businessType: string) {
  // Simple rule-based categorisation for demo
  const desc = description.toLowerCase()

  // Check each category
  for (const [category, keywords] of Object.entries(UK_TAX_CATEGORIES)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword)) {
        const isBusinessExpense = !['income', 'personal'].includes(category)
        return {
          category: category,
          subcategory: keyword,
          tax_category: isBusinessExpense ? 'allowable_expense' : category === 'income' ? 'business_income' : 'personal',
          business_relevance: category === 'personal' ? 'personal' : category === 'income' ? 'business' : 'business',
          confidence: 0.85 + Math.random() * 0.1 // Mock confidence score
        }
      }
    }
  }

  // Default categorisation for unknown transactions
  return {
    category: 'other',
    subcategory: 'unclassified',
    tax_category: 'review_required',
    business_relevance: 'mixed',
    confidence: 0.3 + Math.random() * 0.2
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const businessType = formData.get('businessType') as string
    const customInstructions = formData.get('customInstructions') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read file content
    const content = await file.text()
    const lines = content.split('\n').filter(line => line.trim())

    // Skip header if CSV
    const dataLines = lines[0].includes('date') || lines[0].includes('Date') ? lines.slice(1) : lines

    // Parse transactions from CSV
    const transactions = []
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim()
      if (!line) continue

      const parts = line.split(',')
      if (parts.length < 3) continue

      const date = parts[0]?.replace(/"/g, '')
      const description = parts[1]?.replace(/"/g, '')
      const amountStr = parts[2]?.replace(/"/g, '').replace('£', '').replace(',', '')
      const amount = parseFloat(amountStr) || 0

      if (date && description && !isNaN(amount)) {
        const categorisation = await categoriseTransaction(description, amount, businessType)

        transactions.push({
          id: `txn_${i}`,
          date: date,
          description: description,
          amount: Math.abs(amount),
          type: amount >= 0 ? 'credit' : 'debit',
          ...categorisation
        })
      }
    }

    // Calculate summary
    const summary = {
      total_transactions: transactions.length,
      business_expenses: transactions
        .filter(t => t.business_relevance === 'business' && t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0),
      personal_expenses: transactions
        .filter(t => t.business_relevance === 'personal')
        .reduce((sum, t) => sum + t.amount, 0),
      income: transactions
        .filter(t => t.category === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      tax_deductible: transactions
        .filter(t => t.tax_category === 'allowable_expense')
        .reduce((sum, t) => sum + t.amount, 0)
    }

    const result = {
      transactions,
      summary,
      categories_used: Array.from(new Set(transactions.map(t => t.category)))
    }

    return NextResponse.json({
      success: true,
      result
    })

  } catch (error) {
    console.error('AI categorisation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to categorise transactions'
    }, { status: 500 })
  }
}