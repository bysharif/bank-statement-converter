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
  private readonly TIMEOUT_MS = 60000;

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
      // This can handle ~300-400 transactions (sufficient for most statements)
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

1. **Extract ALL transactions** - Do not skip any transactions, even if they seem unclear
2. **CSV Format** - Return ONLY the CSV data, no explanations or additional text
3. **Column Headers** (first row):
   Date,Description,Debit,Credit,Balance

4. **Column Rules:**
   - Date: Use DD/MM/YYYY format (e.g., 15/03/2024)
   - Description: Keep the full transaction description, remove extra whitespace
   - Debit: Money OUT of the account (payments, withdrawals, transfers out) - number only, no currency symbol
   - Credit: Money INTO the account (deposits, salary, refunds, transfers in) - number only, no currency symbol
   - Balance: Running balance after transaction (if available, otherwise leave empty)

5. **IMPORTANT - Debit vs Credit Classification:**
   **DEBIT (Money Out):**
   - Direct Debit to...
   - Card Payment to...
   - Payment to...
   - Transfer to...
   - Withdrawal
   - Bill Payment
   - Standing Order to...
   - Cash withdrawal
   - Fee, Charge, Interest charged

   **CREDIT (Money In):**
   - Received from...
   - Salary from...
   - Transfer from...
   - Deposit
   - Refund
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

7. **Handling Edge Cases:**
   - Skip header rows, footer information, account summaries
   - Skip opening/closing balance rows unless they're actual transactions
   - "Start balance" or "Opening balance" = Credit (if positive)
   - If balance is not shown, leave the Balance column empty
   - Clean up descriptions: remove multiple spaces, newlines, special characters

**Example Output:**
Date,Description,Debit,Credit,Balance
01/04/2024,"Start balance",,123.92,123.92
03/04/2024,"Direct Debit to V12 Finance",38.70,,85.22
03/04/2024,"Received from Employer",,2500.00,2585.22
05/04/2024,"Card Payment at Tesco",67.89,,2517.33

**Remember:**
- Return ONLY the CSV data
- Start with the header row
- No explanations, no markdown code blocks
- PAY CAREFUL ATTENTION to whether money is going IN (Credit) or OUT (Debit)`;
  }

  private async callClaudeWithRetry(
    base64PDF: string,
    prompt: string,
    maxTokens: number,
    retryCount = 0
  ): Promise<any> {
    try {
      const message = await this.client.messages.create({
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

      return message;

    } catch (error: any) {
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
      if (parts.length < 5) continue;

      const [date, description, debit, credit, balance] = parts;

      const isDebit = debit && debit.trim() !== '';
      const amount = isDebit ? parseFloat(debit) : parseFloat(credit);

      transactions.push({
        id: `txn_${i}`,
        date,
        description: description.replace(/^"|"$/g, ''),
        amount,
        type: isDebit ? 'debit' : 'credit',
        balance: balance ? parseFloat(balance) : undefined,
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
