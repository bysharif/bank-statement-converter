import { NextRequest, NextResponse } from 'next/server'

// Test endpoint to verify PDF reading works
export async function POST(request: NextRequest) {
  console.log('=== PDF TEST ENDPOINT CALLED ===')

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('Test file received:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Test 1: Convert File to Buffer
    console.log('Test 1: Converting File to Buffer...')
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    console.log('✓ Buffer created, size:', fileBuffer.length, 'bytes')

    // Test 2: Try pdf2json parsing
    console.log('Test 2: Testing pdf2json parsing...')
    try {
      const PDFParser = (await import('pdf2json')).default

      const result = await new Promise((resolve) => {
        const pdfParser = new PDFParser(null, true)

        pdfParser.on('pdfParser_dataError', (errData: any) => {
          console.error('PDF parsing error:', errData)
          resolve({
            success: false,
            error: `PDF parsing error: ${errData.parserError}`,
            stage: 'pdf2json_parsing'
          })
        })

        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          try {
            console.log('PDF data received, pages:', pdfData?.Pages?.length || 0)

            let extractedText = ''
            if (pdfData && pdfData.Pages) {
              pdfData.Pages.forEach((page: any, pageIndex: number) => {
                console.log(`Processing page ${pageIndex + 1}`)
                if (page.Texts) {
                  page.Texts.forEach((text: any) => {
                    if (text.R) {
                      text.R.forEach((run: any) => {
                        if (run.T) {
                          extractedText += decodeURIComponent(run.T) + ' '
                        }
                      })
                    }
                  })
                  extractedText += '\n'
                }
              })
            }

            const hasWiseKeywords = {
              wisePayments: extractedText.includes('Wise Payments'),
              trwi: extractedText.includes('TRWI'),
              wiseCom: extractedText.includes('wise.com')
            }

            resolve({
              success: true,
              pagesCount: pdfData?.Pages?.length || 0,
              textLength: extractedText.length,
              first1000chars: extractedText.substring(0, 1000),
              last500chars: extractedText.substring(extractedText.length - 500),
              wiseDetection: hasWiseKeywords,
              containsWise: Object.values(hasWiseKeywords).some(Boolean)
            })
          } catch (error) {
            console.error('Text extraction error:', error)
            resolve({
              success: false,
              error: `Text extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              stage: 'text_extraction'
            })
          }
        })

        pdfParser.parseBuffer(fileBuffer)
      })

      console.log('✓ PDF parsing test completed')
      return NextResponse.json({
        testName: 'PDF Reading Verification',
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type
        },
        result
      })

    } catch (error) {
      console.error('PDF test failed:', error)
      return NextResponse.json({
        testName: 'PDF Reading Verification',
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type
        },
        result: {
          success: false,
          error: `Failed to import or use pdf2json: ${error instanceof Error ? error.message : 'Unknown error'}`,
          stage: 'pdf2json_import'
        }
      })
    }

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      {
        error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'PDF Test Endpoint',
    description: 'Upload a PDF file via POST to test PDF parsing functionality'
  })
}