import { BankStatementConverter, ConversionResult, Transaction } from './converter'
import { cleanMerchantName, calculateDescriptionQuality } from './merchant-cleaner'
import { enhanceDescriptions } from './ai-enhancer'

// Server-side PDF processing interface
interface ServerPDFParseResult {
  text: string
  error?: string
}

export class ServerBankStatementConverter extends BankStatementConverter {
  private static async extractTextFromPDFServer(fileBuffer: Buffer): Promise<ServerPDFParseResult> {
    try {
      // Dynamic import for server-side
      const PDFParser = (await import('pdf2json')).default

      return new Promise((resolve) => {
        const pdfParser = new PDFParser(null, true)

        pdfParser.on('pdfParser_dataError', (errData: any) => {
          resolve({
            text: '',
            error: `PDF parsing error: ${errData.parserError}`
          })
        })

        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          try {
            // Extract text from PDF data with enhanced processing
            let extractedText = ''

            if (pdfData && pdfData.Pages) {
              pdfData.Pages.forEach((page: any, pageIndex: number) => {
                console.log(`Processing page ${pageIndex + 1} of ${pdfData.Pages.length}`)

                if (page.Texts) {
                  // Sort texts by Y position (top to bottom) and X position (left to right)
                  const sortedTexts = page.Texts.sort((a: any, b: any) => {
                    const yDiff = (a.y || 0) - (b.y || 0)
                    if (Math.abs(yDiff) < 0.5) { // Same line
                      return (a.x || 0) - (b.x || 0)
                    }
                    return yDiff
                  })

                  let currentY = -1
                  sortedTexts.forEach((text: any) => {
                    if (text.R) {
                      // Check if this is a new line
                      if (currentY !== -1 && Math.abs((text.y || 0) - currentY) > 0.5) {
                        extractedText += '\n'
                      }
                      currentY = text.y || 0

                      text.R.forEach((run: any) => {
                        if (run.T) {
                          // Decode the text and handle special characters
                          const decodedText = decodeURIComponent(run.T)
                            .replace(/%20/g, ' ')
                            .replace(/%2C/g, ',')
                            .replace(/%2D/g, '-')
                          extractedText += decodedText + ' '
                        }
                      })
                    }
                  })
                  extractedText += '\n\n' // Double new line after each page
                }
              })
            }

            console.log(`Extracted ${extractedText.length} characters from ${pdfData.Pages?.length || 0} pages`)

            resolve({
              text: extractedText.trim(),
              error: extractedText.trim() ? undefined : 'No text found in PDF'
            })
          } catch (error) {
            resolve({
              text: '',
              error: `Text extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
          }
        })

        // Parse the buffer directly
        pdfParser.parseBuffer(fileBuffer)
      })
    } catch (error) {
      return {
        text: '',
        error: `PDF processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  public static async convertFileFromBuffer(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    outputFormat: 'csv' | 'excel' | 'qif' = 'csv'
  ): Promise<ConversionResult> {
    console.log('=== SERVER CONVERTER START ===')
    console.log('File details:', {
      fileName,
      mimeType,
      bufferSize: fileBuffer.length,
      outputFormat
    })

    try {
      let content: string

      // Check if file is PDF
      if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
        console.log('Detected PDF file, starting PDF extraction...')
        const pdfResult = await this.extractTextFromPDFServer(fileBuffer)

        if (pdfResult.error) {
          console.error('PDF extraction failed:', pdfResult.error)
          throw new Error(`PDF processing failed: ${pdfResult.error}`)
        }

        content = pdfResult.text
        console.log('✓ PDF extraction successful')
        console.log('Extracted text length:', content.length)
        console.log('First 500 characters:', content.substring(0, 500))
        console.log('Last 500 characters:', content.substring(content.length - 500))

        // Check for Wise identifiers
        const hasWisePayments = content.includes('Wise Payments')
        const hasTRWI = content.includes('TRWI')
        const hasWiseCom = content.includes('wise.com')
        console.log('Wise detection:', { hasWisePayments, hasTRWI, hasWiseCom })

      } else {
        console.log('Detected text file, reading as UTF-8...')
        // Handle CSV and other text files
        content = fileBuffer.toString('utf-8')
        console.log('✓ Text file read successfully, length:', content.length)
      }

      console.log('Starting transaction parsing...')
      let transactions = BankStatementConverter.parseTransactions(content)
      console.log('✓ Transaction parsing completed, found:', transactions.length, 'transactions')

      // Stage 1: Apply universal rule-based merchant cleaning (always runs, fast)
      console.log('🧹 Applying universal merchant name cleaning...')
      transactions = transactions.map(t => ({
        ...t,
        description: cleanMerchantName(t.description, t.type)
      }))

      const initialQuality = calculateDescriptionQuality(transactions)
      console.log(`📊 Initial quality after rule-based cleaning: ${initialQuality.toFixed(1)}%`)

      // Stage 2: Apply AI enhancement if needed and configured
      const enableAI = process.env.ENABLE_AI_MERCHANT_CLEANUP === 'true'
      const aiThreshold = parseInt(process.env.AI_ENHANCEMENT_THRESHOLD || '95')

      if (enableAI && initialQuality < aiThreshold) {
        console.log(`🤖 Quality ${initialQuality.toFixed(1)}% < ${aiThreshold}% - applying AI enhancement...`)
        transactions = await enhanceDescriptions(transactions, true)

        const finalQuality = calculateDescriptionQuality(transactions)
        console.log(`📊 Final quality after AI enhancement: ${finalQuality.toFixed(1)}%`)
      } else {
        console.log(`✅ Quality ${initialQuality.toFixed(1)}% sufficient - skipping AI enhancement`)
      }

      console.log('✓ Merchant name enhancement completed')

      if (transactions.length === 0) {
        throw new Error('No transactions found in the file. Please ensure the file contains valid bank statement data.')
      }

      // Calculate summary
      const totalCredits = transactions
        .filter(t => t.type === 'Credit')
        .reduce((sum, t) => sum + t.amount, 0)

      const totalDebits = transactions
        .filter(t => t.type === 'Debit')
        .reduce((sum, t) => sum + t.amount, 0)

      const dates = transactions.map(t => t.date).sort()

      const result: ConversionResult = {
        transactions,
        summary: {
          totalTransactions: transactions.length,
          totalCredits,
          totalDebits,
          dateRange: {
            from: dates[0],
            to: dates[dates.length - 1]
          }
        },
        format: outputFormat,
        originalFile: fileName
      }

      return result
    } catch (error) {
      throw error instanceof Error ? error : new Error('Unknown error occurred during file conversion')
    }
  }

  // Helper method to convert File to Buffer for server processing
  public static async fileToBuffer(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }
}