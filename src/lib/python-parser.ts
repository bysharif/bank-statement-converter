/**
 * Python Parser Integration
 * Wrapper for calling Python bank statement parser from Next.js API
 */

export interface PythonParserResult {
  success: boolean;
  bank: string;
  bank_display_name: string;
  transactions: Array<{
    date: string;
    description: string;
    debit: number;
    credit: number;
    balance?: number | null;
    type: 'income' | 'expense';
    amount?: number;
  }>;
  count: number;
  validation_errors: string[];
  validation_warnings: string[];
  accuracy_score: number;
  error?: string;
}

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit' | 'income' | 'expense';
  balance?: number;
  debit?: number;
  credit?: number;
}

export interface PythonParserOptions {
  userTier?: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  limit?: number;
}

/**
 * Parse PDF using Python backend parser
 */
export async function parsePDFWithPython(
  file: File | Buffer,
  options: PythonParserOptions = {}
): Promise<{
  success: boolean;
  transactions: ParsedTransaction[];
  bankName: string;
  detectedFormat?: string;
  transactionCount: number;
  accuracyScore?: number;
  validationErrors?: string[];
  error?: string;
  processingTime?: number;
  method?: string;
  confidence?: number;
}> {
  const startTime = Date.now();

  try {
    const formData = new FormData();
    
    // Handle both File and Buffer
    if (file instanceof File) {
      formData.append('file', file);
    } else {
      // For Buffer, convert to Uint8Array then create a Blob
      const uint8Array = new Uint8Array(file);
      const blob = new Blob([uint8Array], { type: 'application/pdf' });
      const fileName = `statement-${Date.now()}.pdf`;
      formData.append('file', blob, fileName);
    }

    // Call Python API endpoint via Next.js API route
    // This route proxies to the Python Flask server
    // When called from server-side, we need a full URL, not a relative path
    const baseUrl = typeof window !== 'undefined'
      ? '' // Client-side: use relative URL
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; // Server-side: use full URL

    // Add timeout handling (30 seconds for Python parser)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/api/parse-python`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('PYTHON_PARSER_TIMEOUT');
      }
      throw fetchError;
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      // Check if Python parser is unavailable (503) - this is expected for unsupported banks
      if (response.status === 503 && errorData.unavailable) {
        throw new Error('PYTHON_PARSER_UNAVAILABLE');
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result: PythonParserResult = await response.json();

    if (!result.success) {
      return {
        success: false,
        transactions: [],
        bankName: result.bank_display_name || 'Unknown',
        transactionCount: 0,
        error: result.error || 'Failed to parse PDF',
        processingTime: Date.now() - startTime,
      };
    }

    // Convert Python format to our format
    const transactions: ParsedTransaction[] = result.transactions.map((tx) => {
      // Calculate amount from debit/credit
      const amount = tx.amount ?? (tx.credit > 0 ? tx.credit : tx.debit);
      
      return {
        date: tx.date,
        description: tx.description,
        amount: Math.abs(amount),
        type: tx.type === 'income' ? 'credit' : 'debit',
        balance: tx.balance ?? undefined,
        debit: tx.debit,
        credit: tx.credit,
      };
    });

    // Apply tier limits
    let limitedTransactions = transactions;
    const tierLimits = {
      FREE: 50,
      STARTER: 500,
      PROFESSIONAL: 5000,
      ENTERPRISE: undefined, // Unlimited
    };

    const limit = options.limit ?? tierLimits[options.userTier || 'FREE'];
    if (limit && transactions.length > limit) {
      limitedTransactions = transactions.slice(0, limit);
    }

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      transactions: limitedTransactions,
      bankName: result.bank_display_name,
      detectedFormat: result.bank,
      transactionCount: result.count,
      accuracyScore: result.accuracy_score,
      validationErrors: result.validation_errors,
      processingTime,
      method: 'python',
      confidence: result.accuracy_score / 100, // Convert to 0-1 scale
    };
  } catch (error: any) {
    console.error('Python parser error:', error);
    return {
      success: false,
      transactions: [],
      bankName: 'Unknown',
      transactionCount: 0,
      error: error.message || 'Failed to parse PDF with Python parser',
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Generate CSV from parsed transactions
 */
export function generateCSVFromPythonTransactions(
  transactions: ParsedTransaction[]
): string {
  const lines = ['Date,Description,Debit,Credit'];

  transactions.forEach((tx) => {
    const debit = tx.type === 'debit' ? tx.amount.toFixed(2) : '';
    const credit = tx.type === 'credit' ? tx.amount.toFixed(2) : '';
    const description = tx.description.includes(',')
      ? `"${tx.description}"`
      : tx.description;

    lines.push(`${tx.date},${description},${debit},${credit}`);
  });

  return lines.join('\n');
}

