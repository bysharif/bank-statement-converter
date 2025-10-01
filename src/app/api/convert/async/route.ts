import { NextRequest, NextResponse } from 'next/server'
import { ServerBankStatementConverter } from '@/lib/server-converter'
import { JobManager } from '@/lib/job-manager'
import { requireAuth } from '@/lib/auth-utils'

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Allowed MIME types
const ALLOWED_TYPES = [
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
]

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { user } = await requireAuth()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const outputFormat = formData.get('outputFormat') as 'csv' | 'excel' | 'qif' || 'csv'

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      )
    }

    // Check user limits
    const limits = await JobManager.checkUserLimits(user.id)
    if (!limits.canProcess) {
      return NextResponse.json(
        {
          error: 'Usage limit reached',
          limits: {
            daily: `${limits.dailyCount}/${limits.planLimits.daily}`,
            monthly: `${limits.monthlyCount}/${limits.planLimits.monthly}`
          }
        },
        { status: 429 }
      )
    }

    // Create job for async processing
    const jobId = await JobManager.createJob(user.id, file.name, file.size)

    // Process asynchronously
    processFileAsync(file, outputFormat, jobId)

    return NextResponse.json({
      success: true,
      jobId,
      message: 'File processing started. Use the jobId to check status.'
    }, { status: 202 }) // 202 Accepted

  } catch (error) {
    console.error('Async conversion error:', error)

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'File processing failed to start',
        success: false
      },
      { status: 500 }
    )
  }
}

// Async processing function
async function processFileAsync(
  file: File,
  outputFormat: 'csv' | 'excel' | 'qif',
  jobId: string
) {
  try {
    // Set processing status
    await JobManager.setProcessing(jobId)

    // Convert file to buffer
    const fileBuffer = await ServerBankStatementConverter.fileToBuffer(file)

    // Process the file
    const result = await ServerBankStatementConverter.convertFileFromBuffer(
      fileBuffer,
      file.name,
      file.type,
      outputFormat
    )

    // Complete the job
    await JobManager.completeJob(jobId, result)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown processing error'
    await JobManager.failJob(jobId, errorMessage)
  }
}

export async function GET() {
  try {
    // Clean up old jobs on GET requests
    await JobManager.cleanupOldJobs()

    return NextResponse.json({
      message: 'Async Bank Statement Converter API',
      version: '1.0.0',
      description: 'Submit files for async processing and track status with jobId',
      endpoints: {
        'POST /api/convert/async': 'Submit file for async processing',
        'GET /api/jobs/{jobId}': 'Check job status',
        'DELETE /api/jobs/{jobId}': 'Cancel job'
      }
    })
  } catch (error) {
    return NextResponse.json({
      message: 'Async Bank Statement Converter API',
      version: '1.0.0',
      error: 'Failed to cleanup old jobs'
    })
  }
}