import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js API route that proxies requests to Python parser
 * This handles the file upload and calls the Python serverless function
 * 
 * Note: In Vercel, the Python function at api/convert.py will be automatically
 * deployed as a serverless function. We call it via HTTP.
 */
export const maxDuration = 60; // 60 seconds for processing

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Create FormData to forward to Python endpoint
    const pythonFormData = new FormData();
    pythonFormData.append('file', file);

    // Determine the base URL for the Python API
    // In Vercel production, use the deployed URL
    // In local development, call the Flask server on port 5001
    const isVercel = process.env.VERCEL === '1';
    const isProduction = process.env.NODE_ENV === 'production';
    
    let baseUrl;
    if (isVercel || isProduction) {
      // Production: Use Vercel URL
      baseUrl = `https://${process.env.VERCEL_URL || request.headers.get('host')}`;
    } else {
      // Local development: Try Flask server on ports 5001 or 5002
      baseUrl = process.env.PYTHON_API_URL || 'http://localhost:5002';
    }
    
    console.log(`🐍 Calling Python parser at: ${baseUrl}/api/convert`);

    try {
      // Call Python serverless function
      // The Python function at api/convert.py will be available at /api/convert
      const response = await fetch(`${baseUrl}/api/convert`, {
        method: 'POST',
        body: pythonFormData,
        // Let FormData set Content-Type with boundary automatically
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        console.error('Python API error:', errorData);
        throw new Error(errorData.error || `Python parser failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Python parser returned: ${result.count || 0} transactions`);
      return NextResponse.json(result);
    } catch (fetchError: any) {
      console.error('Error calling Python parser:', fetchError);
      
      // Return error but don't throw - let the caller handle fallback
      return NextResponse.json(
        {
          success: false,
          error: 'Python parser is not available',
          details: fetchError.message,
          // Return specific error code that the caller can check
          unavailable: true,
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error('Error in python-convert route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process request',
      },
      { status: 500 }
    );
  }
}

