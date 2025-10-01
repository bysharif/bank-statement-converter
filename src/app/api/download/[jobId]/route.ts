import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-utils'
import { JobManager } from '@/lib/job-manager'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const jobId = params.jobId
    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'csv'

    // Get job data
    const job = await JobManager.getJob(jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.status !== 'completed' || !job.result) {
      return NextResponse.json({ error: 'Job not completed or no result available' }, { status: 400 })
    }

    const transactions = job.result.transactions

    if (format === 'csv') {
      // Import and use the new CSV generator
      const { generateCSV } = require('@/lib/csv-generator')
      const csvContent = generateCSV(transactions)

      const filename = `${job.fileName.replace(/\.(pdf|csv)$/i, '')}_converted_${new Date().toISOString().split('T')[0]}.csv`

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache',
          'Content-Length': csvContent.length.toString()
        }
      })
    } else if (format === 'qif') {
      // Generate QIF content
      let qifContent = '!Type:Bank\n'

      transactions.forEach(t => {
        qifContent += `D${t.date}\n`
        qifContent += `T${t.type === 'Debit' ? '-' : ''}${Math.abs(t.amount).toFixed(2)}\n`
        qifContent += `P${t.description}\n`
        qifContent += '^\n'
      })

      return new NextResponse(qifContent, {
        headers: {
          'Content-Type': 'application/qif',
          'Content-Disposition': `attachment; filename="${job.fileName.replace('.pdf', '')}_converted.qif"`
        }
      })
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
    }

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to generate download' },
      { status: 500 }
    )
  }
}