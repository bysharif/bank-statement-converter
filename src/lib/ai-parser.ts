import Anthropic from '@anthropic-ai/sdk';

export interface AIParseResult {
  success: boolean;
  csvContent: string;
  transactionCount: number;
  error?: string;
  tokensUsed?: number;
  processingTime?: number;
}

export interface ParseOptions {
  maxTokens?: number;
  userTier?: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'BUSINESS';
}

export class AIBankStatementParser {
  private client: Anthropic;
  private readonly MAX_RETRIES = 3;
  private readonly TIMEOUT_MS = 240000; // 4 minutes - allows time for large PDFs

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;

    // Debug: Check if API key is loaded (without logging the actual key)
    if (!key) {
      console.error('❌ ANTHROPIC_API_KEY is not set! Check your environment variables.');
      console.error('   - In local dev: Make sure .env.local exists with ANTHROPIC_API_KEY');
      console.error('   - In production: Make sure ANTHROPIC_API_KEY is set in Vercel dashboard');
    } else {
      console.log('✅ ANTHROPIC_API_KEY is loaded (length:', key.length, 'chars)');
    }

    this.client = new Anthropic({
      apiKey: key,
    });
  }

  async parsePDF(
    pdfBuffer: Buffer,
    fileName?: string,
    options?: ParseOptions
  ): Promise<AIParseResult> {
    const startTime = Date.now();

    try {
      console.log('🤖 Starting AI-powered PDF parsing...');
      console.log(`📄 File: ${fileName || 'unknown'}, Size: ${pdfBuffer.length} bytes`);

      const base64PDF = pdfBuffer.toString('base64');
      const prompt = this.createParsingPrompt();

      // Claude 3.5 Haiku max output tokens: 8,192
      // This can handle ~300-400 transactions (sufficient for most monthly statements)
      // For extremely large statements, the Python parser should be used as primary
      const maxTokens = options?.maxTokens || 8192;

      const response = await this.callClaudeWithRetry(base64PDF, prompt, maxTokens);

      const csvContent = this.extractCSV(response.content);
      const transactionCount = this.countTransactions(csvContent);

      const processingTime = Date.now() - startTime;

      console.log(`✅ AI parsing complete: ${transactionCount} transactions in ${processingTime}ms`);
      console.log(`💰 Tokens used: ${response.usage.input_tokens} input, ${response.usage.output_tokens} output`);

      return {
        success: true,
        csvContent,
        transactionCount,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        processingTime,
      };

    } catch (error) {
      console.error('❌ AI parsing failed:', error);
      return {
        success: false,
        csvContent: '',
        transactionCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        processingTime: Date.now() - startTime,
      };
    }
  }

  private createParsingPrompt(): string {
    return `You are an expert bank statement parser. Your task is to extract ALL transactions from this bank statement PDF and convert them into a CSV format.

**CRITICAL REQUIREMENTS:**

1. **Extract ALL transactions from ALL pages** - This statement may have 10+ pages with 100+ transactions. You MUST extract every single transaction across all pages. Do not skip any pages or transactions.

2. **CSV Format** - Return ONLY the CSV data, no explanations or additional text

3. **Column Headers** (first row):
   Date,Description,Debit,Credit

4. **Column Rules:**
   - Date: Use DD/MM/YYYY format (e.g., 15/03/2024). If the statement only shows "DD MMM" (e.g., "03 Apr"), use the year from the statement header.
   - Description: Keep the transaction description concise but complete. For long descriptions (e.g., foreign currency transactions with exchange rate details), keep the main merchant/payee name and transaction type.
   - Debit: Money OUT of the account (payments, withdrawals, transfers out) - number only, no currency symbol
   - Credit: Money INTO the account (deposits, salary, refunds, transfers in) - number only, no currency symbol

5. **IMPORTANT - Debit vs Credit Classification:**
   **DEBIT (Money Out):**
   - Direct Debit to...
   - Card Payment to... (this is ALWAYS a debit/payment OUT)
   - Card Purchase... (this is ALWAYS a debit/payment OUT)
   - Payment to...
   - Transfer to...
   - Bill Payment to...
   - Withdrawal
   - Standing Order to...
   - Cash withdrawal
   - Fee, Charge, Interest charged
   - Blue Rewards Fee

   **CREDIT (Money In):**
   - Received from... / Received From...
   - Salary from...
   - Transfer from... / Transfer From...
   - Bill Payment From... (money IN, not out)
   - Deposit
   - Refund / Card Refund
   - Cashback
   - Interest received
   - Payment received
   - Income

6. **Data Rules:**
   - All amounts must be to 2 decimal places (e.g., 123.45)
   - If money goes OUT, put amount in Debit column, leave Credit empty
   - If money comes IN, put amount in Credit column, leave Debit empty
   - Use empty values (not 0.00) for missing Debit/Credit
   - Wrap descriptions in quotes if they contain commas
   - Preserve the chronological order of transactions
   - NEVER put the same transaction in both Debit and Credit columns

7. **Multi-Page Statements:**
   - Continue extracting from EVERY page
   - Watch for "Continued" markers - these indicate transactions continue on next page
   - Do NOT stop at page breaks or footer text
   - The statement may span 10+ pages - extract ALL transactions

8. **Handling Edge Cases:**
   - Skip header rows, footer information, account summaries ("At a glance", "Your balances")
   - Skip opening/closing balance rows unless they're actual transactions
   - Clean up descriptions: remove extra whitespace, but keep them readable
   - Foreign currency transactions: Extract the GBP amount, not the original currency

**Example Output:**
Date,Description,Debit,Credit
01/04/2024,Opening Balance,,0.00
03/04/2024,Direct Debit to V12 Finance,38.70,
03/04/2024,Direct Debit to David Lloyd,189.00,
03/04/2024,Card Payment to Amazon Prime,8.99,
03/04/2024,Received from Maintenance Proper,,641.19
03/04/2024,"Transfer From Sort Code 20-45-41",,10.00

**Remember:**
- Return ONLY the CSV data
- Start with the header row
- No explanations, no markdown code blocks
- Extract from ALL pages (this statement may have 100+ transactions)
- PAY CAREFUL ATTENTION to whether money is going IN (Credit) or OUT (Debit)`;
  }

  private async callClaudeWithRetry(
    base64PDF: string,
    prompt: string,
    maxTokens: number,
    retryCount = 0
  ): Promise<any> {
    try {
      // Create timeout promise to prevent hanging indefinitely
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Claude API timeout after ${this.TIMEOUT_MS / 1000} seconds. The PDF may be too large or complex.`));
        }, this.TIMEOUT_MS);
      });

      // Race between Claude API call and timeout
      const apiPromise = this.client.messages.create({
        model: 'claude-3-5-haiku-20241022', // Fastest Claude model
        max_tokens: maxTokens,
        temperature: 0, // Deterministic output for consistency
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: base64PDF,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      });

      const message = await Promise.race([apiPromise, timeoutPromise]);
      return message;

    } catch (error: any) {
      // Check if it's a timeout error
      if (error.message?.includes('timeout')) {
        console.error('⏰ Claude API timeout:', error.message);
        throw error;
      }

      if (retryCount < this.MAX_RETRIES) {
        if (error.status === 429 || error.status === 529) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`⏳ Rate limited, retrying in ${delay}ms...`);
          await this.sleep(delay);
          return this.callClaudeWithRetry(base64PDF, prompt, maxTokens, retryCount + 1);
        }
      }

      throw error;
    }
  }

  private extractCSV(content: any[]): string {
    const textBlock = content.find((block: any) => block.type === 'text');
    if (!textBlock) {
      throw new Error('No text content in response');
    }

    let text = textBlock.text.trim();

    // Log the raw response for debugging
    console.log('📝 Raw Claude response (first 500 chars):', text.substring(0, 500));

    // Remove markdown code blocks
    text = text.replace(/```csv\n?/gi, '');
    text = text.replace(/```\n?/g, '');
    text = text.trim();

    // Try to find CSV content - look for the header line
    const headerPattern = /Date.*Description.*Debit.*Credit.*Balance/i;
    const headerMatch = text.match(headerPattern);

    let csv: string;

    if (!headerMatch) {
      // Claude sometimes omits the header - check if we have transaction data
      console.log('⚠️ No header found, checking if we have transaction data...');

      // Check if the text looks like CSV data (has commas and dates)
      const datePattern = /\d{2}\/\d{2}\/\d{4}/;
      if (text.match(datePattern) && text.includes(',')) {
        console.log('✅ Found transaction data without header, adding header automatically');
        // Add the header ourselves
        csv = 'Date,Description,Debit,Credit,Balance\n' + text.trim();
      } else {
        console.error('❌ Could not find CSV header or transaction data in response');
        console.error('Full response:', text);
        throw new Error('Invalid CSV format: no recognizable data');
      }
    } else {
      // Extract CSV starting from the header
      const headerIndex = text.indexOf(headerMatch[0]);
      csv = text.substring(headerIndex).trim();
    }

    // Clean up any trailing text after the CSV
    const lines = csv.split('\n');
    const csvLines: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Stop if we hit non-CSV content (lines without commas or dates)
      if (csvLines.length > 0 && !trimmedLine.includes(',')) {
        break;
      }

      csvLines.push(trimmedLine);
    }

    csv = csvLines.join('\n');

    console.log(`✅ Extracted CSV with ${csvLines.length - 1} transaction lines`);

    return csv;
  }

  private countTransactions(csv: string): number {
    const lines = csv.split('\n').filter(line => line.trim());
    return Math.max(0, lines.length - 1);
  }

  parseCSVToTransactions(csv: string) {
    const lines = csv.split('\n');
    const transactions = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = this.parseCSVLine(line);
      if (parts.length < 4) continue;

      const [date, description, debit, credit] = parts;

      const isDebit = debit && debit.trim() !== '';
      const amount = isDebit ? parseFloat(debit) : parseFloat(credit);

      transactions.push({
        id: `txn_${i}`,
        date,
        description: description.replace(/^"|"$/g, ''),
        amount,
        type: isDebit ? 'debit' : 'credit',
      });
    }

    return transactions;
  }

  private parseCSVLine(line: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    parts.push(current.trim());
    return parts;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export async function parseStatementWithAI(
  pdfBuffer: Buffer,
  fileName?: string,
  options?: ParseOptions
): Promise<AIParseResult> {
  const parser = new AIBankStatementParser();
  return parser.parsePDF(pdfBuffer, fileName, options);
}
