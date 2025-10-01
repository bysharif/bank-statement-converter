import { NextRequest, NextResponse } from 'next/server'
import { ServerBankStatementConverter } from '@/lib/server-converter'
import { JobManager } from '@/lib/job-manager'
import { requireAuth } from '@/lib/auth-utils'

// Maximum file size: 50MB (increased for large bank statements)
const MAX_FILE_SIZE = 50 * 1024 * 1024

// Allowed MIME types
const ALLOWED_TYPES = [
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
]

export async function POST(request: NextRequest) {
  console.log('=== CONVERSION API CALLED ===')

  try {
    console.log('1. Starting authentication check...')
    // Require authentication
    const { user } = await requireAuth()
    console.log('✓ Authentication successful for user:', user.id)

    console.log('2. Parsing form data...')
    const formData = await request.formData()
    const file = formData.get('file') as File
    const outputFormat = formData.get('outputFormat') as 'csv' | 'excel' | 'qif' || 'csv'
    console.log('✓ Form data parsed')

    // Validation
    if (!file) {
      console.error('✗ No file provided')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('3. File received:', {
      name: file.name,
      size: file.size,
      type: file.type,
      outputFormat
    })

    if (file.size > MAX_FILE_SIZE) {
      console.error('✗ File size exceeds limit:', file.size, 'vs', MAX_FILE_SIZE)
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error('✗ Unsupported file type:', file.type)
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      )
    }

    console.log('✓ File validation passed')

    // Skip user limits for local testing
    // const limits = await JobManager.checkUserLimits(user.id)
    // if (!limits.canProcess) {
    //   return NextResponse.json(
    //     {
    //       error: 'Usage limit reached',
    //       limits: {
    //         daily: `${limits.dailyCount}/${limits.planLimits.daily}`,
    //         monthly: `${limits.monthlyCount}/${limits.planLimits.monthly}`
    //       }
    //     },
    //     { status: 429 }
    //   )
    // }

    console.log('4. Creating job record...')
    // Create job record
    const jobId = await JobManager.createJob(user.id, file.name, file.size)
    console.log('✓ Job created with ID:', jobId)

    try {
      console.log('5. Setting job to processing status...')
      // Set processing status
      await JobManager.setProcessing(jobId)
      console.log('✓ Job status set to processing')

      console.log('6. Converting file to buffer...')
      // Convert file to buffer for server processing
      const fileBuffer = await ServerBankStatementConverter.fileToBuffer(file)
      console.log('✓ File converted to buffer, size:', fileBuffer.length, 'bytes')

      console.log('7. Starting server-side conversion...')
      // Process the file
      const result = await ServerBankStatementConverter.convertFileFromBuffer(
        fileBuffer,
        file.name,
        file.type,
        outputFormat
      )
      console.log('✓ Conversion completed successfully')
      console.log('Result summary:', {
        transactionCount: result.transactions.length,
        totalCredits: result.summary.totalCredits,
        totalDebits: result.summary.totalDebits,
        dateRange: result.summary.dateRange
      })

      console.log('8. Completing job...')
      // Complete the job
      await JobManager.completeJob(jobId, result)
      console.log('✓ Job completed successfully')

      console.log('=== CONVERSION API SUCCESS ===')
      return NextResponse.json({
        success: true,
        data: result,
        jobId
      })

    } catch (processingError) {
      console.error('=== PROCESSING ERROR ===')
      console.error('Error type:', processingError?.constructor?.name)
      console.error('Error message:', processingError instanceof Error ? processingError.message : 'Unknown error')
      console.error('Error stack:', processingError instanceof Error ? processingError.stack : 'No stack trace')

      const errorMessage = processingError instanceof Error ? processingError.message : 'Processing failed'
      await JobManager.failJob(jobId, errorMessage)
      throw processingError
    }

  } catch (error) {
    console.error('=== CONVERSION API ERROR ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')

    if (error instanceof Error && error.message === 'Authentication required') {
      console.error('Authentication error detected')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.error('=== CONVERSION API FAILED ===')
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'File conversion failed',
        success: false
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Bank Statement Converter API',
    version: '1.0.0',
    supportedFormats: ['PDF', 'CSV', 'Excel', 'TXT'],
    outputFormats: ['CSV', 'QIF'],
    maxFileSize: '10MB'
  })
}