import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const jobId = params.jobId

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the job belongs to the user
    const { data: job, error: jobError } = await supabase
      .from('conversion_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Fetch all transactions for this job
    const { data: transactions, error: txnError } = await supabase
      .from('transactions')
      .select('*')
      .eq('job_id', jobId)
      .order('row_number', { ascending: true })

    if (txnError) {
      console.error('Error fetching transactions:', txnError)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // Generate CSV
    const csvContent = generateCSV(transactions || [])

    return NextResponse.json({
      csvContent,
      filename: job.original_filename.replace('.pdf', '.csv'),
      transactionCount: transactions?.length || 0,
    })
  } catch (error) {
    console.error('Download CSV error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateCSV(transactions: any[]): string {
  const headerLine = 'Date,Description,Debit,Credit,Balance'
  const csvLines = [headerLine]

  transactions.forEach(txn => {
    // Convert date from YYYY-MM-DD to DD/MM/YYYY
    const date = txn.transaction_date ? formatDate(txn.transaction_date) : ''
    const amount = Math.abs(txn.amount || 0)
    const debit = txn.amount < 0 ? amount.toFixed(2) : ''
    const credit = txn.amount >= 0 ? amount.toFixed(2) : ''
    const balance = txn.balance ? txn.balance.toFixed(2) : ''
    const description = (txn.description || '').includes(',') ? `"${txn.description}"` : txn.description || ''

    csvLines.push(`${date},${description},${debit},${credit},${balance}`)
  })

  return csvLines.join('\n')
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}
