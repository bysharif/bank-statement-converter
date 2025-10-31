import { extractPDFWithCoordinates, ExtractedPDFData } from './fast-pdf-extractor';
import { detectTransactionTable, tableToRecords, DetectedTable } from './table-detector';
import { detectBankType, BankDetectionResult, Transaction } from './universal-bank-parser';
import { AIBankStatementParser, ParseOptions } from './ai-parser';

export interface HybridParseResult {
  success: boolean;
  transactions: Transaction[];
  transactionCount: number;
  bankName: string;
  detectedFormat: string;
  method: 'fast-pattern' | 'ai-fallback';
  confidence: number;
  processingTime: number;
  error?: string;
  csvContent?: string;
}

/**
 * Hybrid 3-Layer Bank Statement Parser
 *
 * Layer 1: Fast PDF extraction (2-3 seconds)
 * Layer 2: Pattern-based parsing (1-2 seconds) - 95% of cases
 * Layer 3: AI fallback (40-70 seconds) - 5% of cases
 *
 * Average processing time: 5-10 seconds
 * AI fallback only for unknown formats
 */
export class HybridBankParser {
  private aiParser: AIBankStatementParser;

  constructor() {
    this.aiParser = new AIBankStatementParser();
  }

  /**
   * Main parsing method with 3-layer fallback
   */
  async parsePDF(
    buffer: Buffer,
    fileName?: string,
    options?: ParseOptions
  ): Promise<HybridParseResult> {
    const startTime = Date.now();

    console.log('🚀 Hybrid Parser: Starting 3-layer parsing system');

    try {
      // ============================================
      // LAYER 1: Fast PDF Extraction (2-3 seconds)
      // ============================================
      console.log('📄 Layer 1: Fast PDF extraction with pdf2json...');
      const extractionStart = Date.now();

      const pdfData = await extractPDFWithCoordinates(buffer);

      console.log(`✅ Layer 1 complete in ${Date.now() - extractionStart}ms`);
      console.log(`   - Pages: ${pdfData.pages.length}`);
      console.log(`   - Text length: ${pdfData.fullText.length} characters`);

      // ============================================
      // LAYER 2: Pattern Matching (1-2 seconds)
      // ============================================
      console.log('🔍 Layer 2: Bank detection and pattern matching...');
      const detectionStart = Date.now();

      const bankDetection = detectBankType(pdfData.fullText);

      console.log(`   - Detected bank: ${bankDetection.bankName}`);
      console.log(`   - Confidence: ${bankDetection.confidence}`);
      console.log(`   - Format: ${bankDetection.format}`);

      // Try pattern-based parsing if confidence is high
      if (bankDetection.confidence >= 15) {
        console.log('   - Attempting pattern-based parsing...');

        const transactions = await this.parseWithPatterns(pdfData, bankDetection);

        if (transactions.length > 0) {
          const processingTime = Date.now() - startTime;

          console.log(`✅ Layer 2 complete in ${Date.now() - detectionStart}ms`);
          console.log(`✨ Fast parsing successful: ${transactions.length} transactions in ${processingTime}ms`);

          const csvContent = this.generateCSV(transactions);

          return {
            success: true,
            transactions,
            transactionCount: transactions.length,
            bankName: bankDetection.bankName,
            detectedFormat: bankDetection.format,
            method: 'fast-pattern',
            confidence: bankDetection.confidence,
            processingTime,
            csvContent,
          };
        }
      }

      // ============================================
      // LAYER 3: AI Fallback (40-70 seconds)
      // ============================================
      console.log('⚠️ Layer 2 failed or low confidence');
      console.log('🤖 Layer 3: Using AI fallback for unknown format...');
      console.log('   - This will take 40-70 seconds...');

      const aiStart = Date.now();
      const aiResult = await this.aiParser.parsePDF(buffer, fileName, options);

      if (!aiResult.success) {
        throw new Error(aiResult.error || 'AI parsing failed');
      }

      const aiTransactions = this.aiParser.parseCSVToTransactions(aiResult.csvContent) as Transaction[];

      const processingTime = Date.now() - startTime;

      console.log(`✅ Layer 3 complete in ${Date.now() - aiStart}ms`);
      console.log(`✨ AI fallback successful: ${aiTransactions.length} transactions in ${processingTime}ms`);

      return {
        success: true,
        transactions: aiTransactions,
        transactionCount: aiTransactions.length,
        bankName: 'AI Detected',
        detectedFormat: 'ai-universal',
        method: 'ai-fallback',
        confidence: 100, // AI is always confident
        processingTime,
        csvContent: aiResult.csvContent,
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;

      console.error('❌ All layers failed:', error);

      return {
        success: false,
        transactions: [],
        transactionCount: 0,
        bankName: 'Unknown',
        detectedFormat: 'failed',
        method: 'ai-fallback',
        confidence: 0,
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Parse using pattern matching and table detection
   */
  private async parseWithPatterns(
    pdfData: ExtractedPDFData,
    bankDetection: BankDetectionResult
  ): Promise<Transaction[]> {
    const allTransactions: Transaction[] = [];

    // Process each page
    for (const page of pdfData.pages) {
      console.log(`   - Processing page ${page.pageNumber}...`);

      // Detect transaction table
      const table = detectTransactionTable(page);

      if (!table) {
        console.log(`   - No transaction table found on page ${page.pageNumber}`);
        continue;
      }

      console.log(`   - Found table with ${table.columns.length} columns, ${table.rows.length} rows`);

      // Convert table to records
      const records = tableToRecords(table);

      console.log(`   - Extracted ${records.length} potential transactions`);

      // Parse transactions based on bank format
      const transactions = this.parseTransactionsFromRecords(
        records,
        bankDetection.format,
        allTransactions.length
      );

      allTransactions.push(...transactions);
    }

    return allTransactions;
  }

  /**
   * Parse transactions from table records
   */
  private parseTransactionsFromRecords(
    records: Record<string, string>[],
    bankFormat: string,
    startIndex: number
  ): Transaction[] {
    const transactions: Transaction[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      try {
        const transaction = this.parseTransaction(record, bankFormat, startIndex + i);

        if (transaction) {
          transactions.push(transaction as Transaction);
        }
      } catch (error) {
        console.log(`   - Skipping invalid row: ${error instanceof Error ? error.message : error}`);
      }
    }

    return transactions;
  }

  /**
   * Parse a single transaction from a record
   */
  private parseTransaction(
    record: Record<string, string>,
    bankFormat: string,
    index: number
  ): Transaction | null {
    // Extract date
    const dateStr = record.date || record.col0 || '';
    if (!dateStr || dateStr.length < 5) return null;

    const date = this.parseDate(dateStr);
    if (!date) return null;

    // Extract description
    const description = record.description || record.col1 || '';
    if (!description || description.length < 2) return null;

    // Extract amounts
    const debit = this.parseAmount(record.debit || record['money out'] || '');
    const credit = this.parseAmount(record.credit || record['money in'] || '');
    const balance = this.parseAmount(record.balance || '');

    // Determine amount and type
    let amount: number;
    let type: 'debit' | 'credit';

    if (debit) {
      amount = debit;
      type = 'debit';
    } else if (credit) {
      amount = credit;
      type = 'credit';
    } else {
      // Try to parse from 'amount' column
      const amountStr = record.amount || record.col2 || '';
      const parsedAmount = this.parseAmount(amountStr);

      if (!parsedAmount) return null;

      // Determine type from sign or context
      if (amountStr.includes('-') || amountStr.includes('(')) {
        amount = Math.abs(parsedAmount);
        type = 'debit';
      } else {
        amount = parsedAmount;
        type = 'credit';
      }
    }

    return {
      id: `txn_${index + 1}`,
      date,
      description: this.cleanDescription(description),
      amount,
      type: type as 'debit' | 'credit',
      balance: balance || undefined,
    };
  }

  /**
   * Parse date string to DD/MM/YYYY format
   */
  private parseDate(dateStr: string): string | null {
    // Remove extra whitespace
    dateStr = dateStr.trim().replace(/\s+/g, ' ');

    // Try common date patterns
    const patterns = [
      // DD MMM YYYY or D MMM YYYY (e.g., "03 APR 2023" or "3 APR 2023")
      /(\d{1,2})\s+([A-Z]{3})\s+(\d{4})/i,
      // DD/MM/YYYY
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      // YYYY-MM-DD
      /(\d{4})-(\d{2})-(\d{2})/,
      // DD-MM-YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/,
    ];

    for (const pattern of patterns) {
      const match = dateStr.match(pattern);

      if (match) {
        if (pattern.source.includes('MMM') || pattern.source.includes('[A-Z]{3}')) {
          // Month name format
          const day = match[1].padStart(2, '0');
          const monthName = match[2].toUpperCase();
          const year = match[3];

          const monthMap: Record<string, string> = {
            JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
            JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
          };

          const month = monthMap[monthName];
          if (!month) continue;

          return `${day}/${month}/${year}`;
        } else if (match[1].length === 4) {
          // YYYY-MM-DD format
          return `${match[3].padStart(2, '0')}/${match[2].padStart(2, '0')}/${match[1]}`;
        } else {
          // DD/MM/YYYY or DD-MM-YYYY format
          return `${match[1].padStart(2, '0')}/${match[2].padStart(2, '0')}/${match[3]}`;
        }
      }
    }

    return null;
  }

  /**
   * Parse amount string to number
   */
  private parseAmount(amountStr: string): number | null {
    if (!amountStr) return null;

    // Remove currency symbols, commas, and whitespace
    const cleaned = amountStr
      .replace(/[£$€,\s]/g, '')
      .replace(/\(/g, '-')
      .replace(/\)/g, '');

    const parsed = parseFloat(cleaned);

    return isNaN(parsed) ? null : Math.abs(parsed);
  }

  /**
   * Clean description text
   */
  private cleanDescription(desc: string): string {
    return desc
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^\d+\s*/, '') // Remove leading reference numbers
      .substring(0, 200); // Limit length
  }

  /**
   * Generate CSV from transactions
   */
  private generateCSV(transactions: Transaction[]): string {
    const lines = ['Date,Description,Debit,Credit,Balance'];

    for (const txn of transactions) {
      const debit = txn.type === 'debit' ? txn.amount.toFixed(2) : '';
      const credit = txn.type === 'credit' ? txn.amount.toFixed(2) : '';
      const balance = txn.balance ? txn.balance.toFixed(2) : '';
      const description = txn.description.includes(',') ? `"${txn.description}"` : txn.description;

      lines.push(`${txn.date},${description},${debit},${credit},${balance}`);
    }

    return lines.join('\n');
  }
}

/**
 * Convenience function for parsing
 */
export async function parseStatementHybrid(
  buffer: Buffer,
  fileName?: string,
  options?: ParseOptions
): Promise<HybridParseResult> {
  const parser = new HybridBankParser();
  return parser.parsePDF(buffer, fileName, options);
}
