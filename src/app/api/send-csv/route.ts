import { NextRequest, NextResponse } from 'next/server'
import { generateCSVContent } from '@/lib/csv-utils'

// This endpoint is DEPRECATED and should not be used
// The proper flow is: upload PDF → parse → preview → download
// This was generating mock data which is incorrect

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Please use the direct download feature from the /convert page.',
      message: 'Upload your PDF at /convert to get real transaction data.'
    },
    { status: 410 } // 410 Gone - resource no longer available
  )
}
