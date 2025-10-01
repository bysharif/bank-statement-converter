import { BankParser, Transaction } from './index';

export const WiseParser: BankParser = {
  name: 'Wise',
  identify: (text: string) => {
    return text.includes('Wise Payments') || text.includes('TRWI') || text.includes('wise.com');
  },
  parse: (text: string) => {
    const transactions: Transaction[] = [];

    console.log('=== WISE PARSER DEBUG ===');
    console.log(`Text length: ${text.length}`);

    // UK Bank Statement Patterns for comprehensive parsing
    const UK_BANK_PATTERNS = {
      // Card transactions
      cardPayment: /(?:CARD\s+(?:PAYMENT|PURCHASE)\s+(?:TO|AT|FROM)?\s*|Card transaction.*?issued by\s+)([A-Z0-9\s&'\-\.\*]+?)(?=\s+(?:£|GBP)|\s+\d|\s+REF:|\s+[A-Z]{2,3}\s*$|$)/i,

      // Direct debits and standing orders
      directDebit: /(?:DIRECT\s+DEBIT|DD|SO|STANDING\s+ORDER)\s+(?:TO|FROM)?\s*([A-Z0-9\s&'\-\.]+?)(?=\s+(?:£|GBP)|\s+\d|\s+REF:|$)/i,

      // Bank transfers
      transfer: /(?:TRANSFER|TFR|BGC|BACS|Sent money to|Received money from)\s+(?:TO|FROM)?\s*([A-Z0-9\s&'\-\.]+?)(?:\s+REF:?\s*(.+?))?(?=\s+(?:£|GBP)|\s+\d|\s+with reference|$)/i,

      // Faster payments
      fasterPayment: /(?:FP|FASTER\s+PAYMENT)\s+(?:TO|FROM)?\s*([A-Z0-9\s&'\-\.]+?)(?=\s+(?:£|GBP)|\s+\d|\s+REF:|$)/i,

      // ATM withdrawals
      atm: /ATM\s+(?:WITHDRAWAL\s+)?(.+?)(?=\s+(?:£|GBP)|\s+\d|$)/i,

      // Cheque payments
      cheque: /(?:CHEQUE|CHQ)\s+(?:NO\.?\s*)?(\d+)/i
    };

    // Enhanced description cleaning with UK bank format support
    function cleanAndFormatDescription(rawText: string, transactionType: string = '', fullMatch: string = ''): string {
      if (!rawText || rawText.trim() === '') return 'Transaction';

      let cleaned = rawText.trim();

      // Remove transaction type prefixes (already in Type column)
      cleaned = cleaned.replace(/^(CARD PAYMENT|CARD PURCHASE|CARD TRANSACTION|DIRECT DEBIT|DD|FASTER PAYMENT|FP|TRANSFER|TFR|BGC|BACS|ATM WITHDRAWAL|ATM)\s+/i, '');
      cleaned = cleaned.replace(/^(TO|FROM|AT|OF)\s+/i, '');
      cleaned = cleaned.replace(/^issued by\s+/i, '');

      // Remove reference codes and UUIDs
      cleaned = cleaned.replace(/\s+REF:?\s*[A-Z0-9\-]+.*$/i, '');
      cleaned = cleaned.replace(/\s+ref:[a-f0-9\-]{8,}.*$/i, '');
      cleaned = cleaned.replace(/ref:[a-f0-9\-]{36}/gi, ''); // UUID format
      cleaned = cleaned.replace(/\s+with reference.*$/i, '');

      // Remove pagination artifacts
      cleaned = cleaned.replace(/\s+\d+\s*\/\s*\d+\s+[A-Z]$/i, '');

      // Remove trailing location codes (but keep meaningful ones for context)
      cleaned = cleaned.replace(/\s+(LONDON|BIRMINGHAM|MANCHESTER|LIVERPOOL|GLASGOW|EDINBURGH|CARDIFF|BELFAST)\s+(GB|UK)$/i, '');
      cleaned = cleaned.replace(/\s+(GB|UK|USA?|EUR?)$/i, '');

      // Remove trailing amounts
      cleaned = cleaned.replace(/\s+£?[\d,]+\.?\d*$/i, '');
      cleaned = cleaned.replace(/\s+\d{1,3}(?:,\d{3})*\.\d{2}$/i, '');

      // Remove currency codes when standalone
      cleaned = cleaned.replace(/\s+(GBP|EUR|USD)$/i, '');

      // Clean up known payment processor prefixes but keep meaningful parts
      cleaned = cleaned.replace(/^PAYPAL\s*\*\s*/i, 'PayPal - ');
      cleaned = cleaned.replace(/^SQ\s*\*\s*/i, 'Square - ');
      cleaned = cleaned.replace(/^STRIPE\s*/i, 'Stripe - ');

      // Remove extra whitespace
      cleaned = cleaned.replace(/\s+/g, ' ').trim();

      // Format names appropriately
      cleaned = formatMerchantName(cleaned);

      return cleaned || 'Transaction';
    }

    function formatMerchantName(name: string): string {
      if (!name || name.length === 0) return 'Transaction';

      // Known payment processors - keep in proper case
      const processors = [
        { pattern: /paypal/gi, replacement: 'PayPal' },
        { pattern: /stripe/gi, replacement: 'Stripe' },
        { pattern: /square/gi, replacement: 'Square' },
        { pattern: /venmo/gi, replacement: 'Venmo' },
        { pattern: /amazon/gi, replacement: 'Amazon' },
        { pattern: /netflix/gi, replacement: 'Netflix' },
        { pattern: /spotify/gi, replacement: 'Spotify' },
        { pattern: /uber/gi, replacement: 'Uber' },
        { pattern: /mcdonalds/gi, replacement: 'McDonald\'s' },
        { pattern: /starbucks/gi, replacement: 'Starbucks' }
      ];

      for (const processor of processors) {
        name = name.replace(processor.pattern, processor.replacement);
      }

      // If it looks like a person name (2-3 capitalized words), use title case
      if (/^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(name) && !name.includes('*') && !name.includes('Ltd') && !name.includes('LTD')) {
        return name.toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      // Remove corporate suffixes when not needed for common cases
      name = name.replace(/\s+(Ltd|LTD|Limited|LIMITED|Inc|INC|Corp|CORP|Plc|PLC)$/i, '');

      return name;
    }

    // Multi-line description handler for UK bank statements
    function combineMultilineDescription(lines: string[], startIndex: number): { description: string, linesConsumed: number } {
      let description = lines[startIndex];
      let nextIndex = startIndex + 1;

      // Check if next lines are part of the description (no date, no amount)
      while (nextIndex < lines.length && nextIndex < startIndex + 3) {
        const nextLine = lines[nextIndex].trim();

        // Stop if we hit another transaction (starts with date)
        if (/^\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(nextLine)) {
          break;
        }

        // Stop if line is just an amount
        if (/^£?[\d,]+\.\d{2}$/.test(nextLine)) {
          break;
        }

        // Stop if line starts with 'Transaction:' or 'Balance'
        if (/^(Transaction:|Balance)/i.test(nextLine)) {
          break;
        }

        // If line has content, it's likely part of description
        if (nextLine.length > 0) {
          description += ' ' + nextLine;
          nextIndex++;
        } else {
          break;
        }
      }

      return { description, linesConsumed: nextIndex - startIndex };
    }

    // Enhanced comprehensive regex patterns for UK bank statements and Wise transactions
    const patterns = [
      // Primary pattern - Money transfers with references (Wise format)
      /(Sent money to|Received money from)\s+([^0-9]+?)\s+(?:with reference\s+([^0-9]+?)\s+)?(\d{1,2}\s+\w+\s+\d{4}).*?Transaction:\s*([A-Z\-\d_]+).*?([-]?\d{1,3}(?:,\d{3})*\.?\d{2})(?:\s+(\d{1,3}(?:,\d{3})*\.?\d{2}))?/g,

      // Card transaction pattern - extract vendor from "issued by VENDOR" (Wise format)
      /Card transaction of\s+([\d,]+\.?\d*)\s+\w+\s+issued by\s+([^0-9]+?)\s+(?:[A-Z]{2,}\s+)?(\d{1,2}\s+\w+\s+\d{4}).*?Transaction:\s*([A-Z\-\d_]+).*?([-]?\d{1,3}(?:,\d{3})*\.?\d{2})(?:\s+(\d{1,3}(?:,\d{3})*\.?\d{2}))?/g,

      // UK Bank Card Payments - CARD PAYMENT TO/AT format
      /(?:CARD\s+(?:PAYMENT|PURCHASE)\s+(?:TO|AT)\s+)([A-Z0-9\s&'\-\.\*]+?)\s+(\d{1,2}\s+\w+\s+\d{4}).*?Transaction:\s*([A-Z\-\d_]+).*?([-]?\d{1,3}(?:,\d{3})*\.?\d{2})(?:\s+(\d{1,3}(?:,\d{3})*\.?\d{2}))?/g,

      // UK Bank Direct Debits
      /(?:DIRECT\s+DEBIT|DD)\s+(?:TO\s+)?([A-Z0-9\s&'\-\.]+?)\s+(\d{1,2}\s+\w+\s+\d{4}).*?Transaction:\s*([A-Z\-\d_]+).*?([-]?\d{1,3}(?:,\d{3})*\.?\d{2})(?:\s+(\d{1,3}(?:,\d{3})*\.?\d{2}))?/g,

      // UK Bank Transfers - TRANSFER/TFR/BACS/BGC format
      /(?:TRANSFER|TFR|BGC|BACS)\s+(?:TO|FROM\s+)?([A-Z0-9\s&'\-\.]+?)(?:\s+REF:?\s*([^\d]+?))?\s+(\d{1,2}\s+\w+\s+\d{4}).*?Transaction:\s*([A-Z\-\d_]+).*?([-]?\d{1,3}(?:,\d{3})*\.?\d{2})(?:\s+(\d{1,3}(?:,\d{3})*\.?\d{2}))?/g,

      // UK Bank Faster Payments
      /(?:FP|FASTER\s+PAYMENT)\s+(?:TO\s+)?([A-Z0-9\s&'\-\.]+?)\s+(\d{1,2}\s+\w+\s+\d{4}).*?Transaction:\s*([A-Z\-\d_]+).*?([-]?\d{1,3}(?:,\d{3})*\.?\d{2})(?:\s+(\d{1,3}(?:,\d{3})*\.?\d{2}))?/g,

      // UK Bank ATM Withdrawals
      /ATM\s+(?:WITHDRAWAL\s+)?([A-Z0-9\s&'\-\.]+?)\s+(\d{1,2}\s+\w+\s+\d{4}).*?Transaction:\s*([A-Z\-\d_]+).*?([-]?\d{1,3}(?:,\d{3})*\.?\d{2})(?:\s+(\d{1,3}(?:,\d{3})*\.?\d{2}))?/g,

      // Conversion pattern (Wise specific)
      /(Converted)\s+([\d,]+\.?\d*)\s+(\w{3})\s+.*?to\s+([\d,]+\.?\d*)\s+(\w{3})\s+(\d{1,2}\s+\w+\s+\d{4}).*?Transaction:\s*([A-Z\-\d_]+).*?([-]?\d{1,3}(?:,\d{3})*\.?\d{2})(?:\s+(\d{1,3}(?:,\d{3})*\.?\d{2}))?/g,

      // Other transaction types (cashback, top-up, fees)
      /(Topped up balance|Card Cashback|No information)\s+(\d{1,2}\s+\w+\s+\d{4}).*?Transaction:\s*([A-Z\-\d_]+).*?([-]?\d{1,3}(?:,\d{3})*\.?\d{2})(?:\s+(\d{1,3}(?:,\d{3})*\.?\d{2}))?/g,

      // Enhanced fallback pattern - any transaction with date and ID, now with description extraction
      /(.{20,200}?)\s+(\d{1,2}\s+\w+\s+\d{4}).*?Transaction:\s*([A-Z\-\d_]+).*?([-]?\d{1,3}(?:,\d{3})*\.?\d{2})(?:\s+(\d{1,3}(?:,\d{3})*\.?\d{2}))?/g
    ];

    console.log('Using multiple comprehensive regex patterns...');
    let totalMatches = 0;
    let patternResults = [];

    // Process each pattern
    for (let patternIndex = 0; patternIndex < patterns.length; patternIndex++) {
      const pattern = patterns[patternIndex];
      let match;
      let patternMatches = 0;

      console.log(`\n--- Processing Pattern ${patternIndex + 1} ---`);

      while ((match = pattern.exec(text)) !== null) {
        totalMatches++;
        patternMatches++;

        try {
          // Pattern processing with enhanced description extraction
          let transaction: Transaction;
          let description = '';
          let date = '';
          let transactionId = '';
          let amountStr = '';
          let balanceStr = '';
          let amount = 0;
          let balance = 0;

          if (patternIndex === 0) {
            // Primary pattern - Money transfers (Wise format)
            const [fullMatch, transactionType, personName, reference, dateStr, txId, amt, bal] = match;
            description = cleanAndFormatDescription(personName, transactionType, fullMatch);
            if (reference && reference.trim() && reference.trim() !== txId) {
              description += ` - ${cleanAndFormatDescription(reference, 'reference', fullMatch)}`;
            }
            date = dateStr; transactionId = txId; amountStr = amt; balanceStr = bal;
          } else if (patternIndex === 1) {
            // Card transaction pattern (Wise format)
            const [fullMatch, cardAmount, vendor, dateStr, txId, amt, bal] = match;
            description = cleanAndFormatDescription(vendor, 'card', fullMatch);
            date = dateStr; transactionId = txId; amountStr = amt; balanceStr = bal;
          } else if (patternIndex === 2) {
            // UK Bank Card Payments
            const [fullMatch, merchantName, dateStr, txId, amt, bal] = match;
            description = cleanAndFormatDescription(merchantName, 'card', fullMatch);
            date = dateStr; transactionId = txId; amountStr = amt; balanceStr = bal;
          } else if (patternIndex === 3) {
            // UK Bank Direct Debits
            const [fullMatch, companyName, dateStr, txId, amt, bal] = match;
            description = cleanAndFormatDescription(companyName, 'dd', fullMatch);
            date = dateStr; transactionId = txId; amountStr = amt; balanceStr = bal;
          } else if (patternIndex === 4) {
            // UK Bank Transfers
            const [fullMatch, recipientName, reference, dateStr, txId, amt, bal] = match;
            description = cleanAndFormatDescription(recipientName, 'transfer', fullMatch);
            if (reference && reference.trim()) {
              description += ` - ${cleanAndFormatDescription(reference, 'reference', fullMatch)}`;
            }
            date = dateStr; transactionId = txId; amountStr = amt; balanceStr = bal;
          } else if (patternIndex === 5) {
            // UK Bank Faster Payments
            const [fullMatch, recipientName, dateStr, txId, amt, bal] = match;
            description = cleanAndFormatDescription(recipientName, 'fp', fullMatch);
            date = dateStr; transactionId = txId; amountStr = amt; balanceStr = bal;
          } else if (patternIndex === 6) {
            // UK Bank ATM Withdrawals
            const [fullMatch, location, dateStr, txId, amt, bal] = match;
            description = `ATM Withdrawal - ${cleanAndFormatDescription(location, 'atm', fullMatch)}`;
            date = dateStr; transactionId = txId; amountStr = amt; balanceStr = bal;
          } else if (patternIndex === 7) {
            // Conversion pattern (Wise specific)
            const [fullMatch, type, fromAmount, fromCurrency, toAmount, toCurrency, dateStr, txId, amt, bal] = match;
            description = `Currency Conversion: ${fromAmount} ${fromCurrency} to ${toAmount} ${toCurrency}`;
            date = dateStr; transactionId = txId; amountStr = amt; balanceStr = bal;
          } else if (patternIndex === 8) {
            // Other transaction types (Wise specific)
            const [fullMatch, transactionType, dateStr, txId, amt, bal] = match;
            switch (transactionType) {
              case 'Topped up balance': description = 'Balance Top-up'; break;
              case 'Card Cashback': description = 'Card Cashback'; break;
              case 'No information': description = 'Bank Fee'; break;
              default: description = transactionType;
            }
            date = dateStr; transactionId = txId; amountStr = amt; balanceStr = bal;
          } else {
            // Enhanced fallback pattern - extract description from context
            const [fullMatch, contextText, dateStr, txId, amt, bal] = match;

            // Use UK bank patterns to extract meaningful description
            let extractedDesc = 'Transaction';
            for (const [patternName, pattern] of Object.entries(UK_BANK_PATTERNS)) {
              const patternMatch = contextText.match(pattern);
              if (patternMatch && patternMatch[1]) {
                extractedDesc = cleanAndFormatDescription(patternMatch[1], patternName, fullMatch);
                break;
              }
            }

            // If no pattern matched, try basic extraction
            if (extractedDesc === 'Transaction') {
              const basicMatch = contextText.match(/(?:to|from|at)\s+([A-Z][A-Z0-9\s&'\-\.]{2,30})/i);
              if (basicMatch) {
                extractedDesc = cleanAndFormatDescription(basicMatch[1], 'basic', fullMatch);
              }
            }

            description = extractedDesc;
            date = dateStr; transactionId = txId; amountStr = amt; balanceStr = bal;
          }

          // Parse amounts
          amount = parseFloat(amountStr.replace(/,/g, ''));
          balance = balanceStr ? parseFloat(balanceStr.replace(/,/g, '')) : 0;

          // Create transaction object
          transaction = {
            date: date,
            description: description || 'Transaction',
            transactionId: transactionId || '',
            amount: Math.abs(amount),
            balance: balance,
            type: amount < 0 ? 'Debit' : 'Credit'
          };

          // Clean up PDF artifacts and apply final enhancements
          transaction.description = cleanPDFArtifacts(transaction.description);
          transaction.description = enhanceGenericDescription(transaction.description, transaction.transactionId || '', match[0] || '');

          // Check for duplicates (same transaction ID)
          const isDuplicate = transactions.some(t => t.transactionId && t.transactionId === transaction.transactionId);

          if (!isDuplicate && transaction.transactionId) {
            transactions.push(transaction);

            if (transactions.length <= 10 || transactions.length % 25 === 0) {
              console.log(`✓ Pattern ${patternIndex + 1} - Transaction ${transactions.length}: ${transaction.description} - ${transaction.amount}`);
            }
          }

        } catch (error) {
          console.error(`Error parsing match ${totalMatches} from pattern ${patternIndex + 1}:`, error);
        }
      }

      patternResults.push(`Pattern ${patternIndex + 1}: ${patternMatches} matches`);
      console.log(`Pattern ${patternIndex + 1} complete: ${patternMatches} matches, ${transactions.length} total unique transactions`);
    }

    // Sort transactions by date (newest first)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log(`\n=== PARSING SUMMARY ===`);
    console.log(`Total regex matches: ${totalMatches}`);
    console.log(`Unique transactions captured: ${transactions.length}`);
    patternResults.forEach(result => console.log(`- ${result}`));

    if (transactions.length > 0) {
      console.log(`\nFirst transaction: ${transactions[0].date} - ${transactions[0].description}`);
      console.log(`Last transaction: ${transactions[transactions.length - 1].date} - ${transactions[transactions.length - 1].description}`);
    }

    // Quality validation
    const qualityScore = validateParsingQuality(transactions);

    console.log(`\n=== WISE PARSER COMPLETE ===`);
    console.log(`Successfully parsed ${transactions.length} unique transactions`);
    console.log(`Quality score: ${qualityScore.toFixed(1)}%`);

    return transactions;
  }
};

// Helper functions for PDF artifact cleaning and description enhancement
function cleanPDFArtifacts(desc: string): string {
  // Remove PDF reference IDs completely
  desc = desc.replace(/ref:[a-f0-9\-]+\s+\d+\s*\/\s*\d+\s*[A-Z]?/gi, '');

  // Remove single letters that are PDF parsing artifacts
  desc = desc.replace(/^[A-Z]\s*$/, 'Transaction');

  // Remove if it's mostly PDF metadata
  if (desc.match(/^[a-f0-9\-\s\/]+$/i) || desc.length < 2) {
    return 'Transaction';
  }

  // If description is empty after cleaning, return Transaction
  if (!desc.trim()) {
    return 'Transaction';
  }

  return desc.trim();
}

function enhanceGenericDescription(desc: string, transactionId: string, fullMatch: string): string {
  // If it's already a generic "Transaction", try to extract from context
  if (desc === 'Transaction' || desc.length < 3) {

    // Try to extract vendor from card transactions
    if (transactionId.startsWith('CARD-')) {
      // Look for "issued by VENDOR" patterns
      const vendorMatch = fullMatch.match(/issued by\s+([^0-9\n]+?)(?:\s+[A-Z]{2,}|\s+\d|$)/i);
      if (vendorMatch) {
        let vendor = vendorMatch[1].trim();
        // Clean vendor name
        vendor = vendor.replace(/\s+(LONDON|MAKKAH|RIYADH|AMSTERDAM|CARDIFF|HAYES|SOUTHALL|HILLINGDON|LANCASHIRE|JEDDAH|SURREY|COINTRIN|KING|ABDULLAH)(\s+\d+)?$/i, '');
        vendor = vendor.replace(/\s+Card ending in \d+.*$/i, '');
        vendor = vendor.replace(/\s+\d{8,}$/g, '');
        if (vendor && vendor.length > 2) {
          return vendor;
        }
      }

      // Look for common payment processor patterns
      const processorPatterns = [
        { pattern: /PayPal\s*\*\s*([^0-9\s]+)/i, prefix: 'PayPal - ' },
        { pattern: /SQ\s*\*\s*([^0-9\s]+)/i, prefix: 'Square - ' },
        { pattern: /STRIPE\s*([^0-9\s]+)/i, prefix: 'Stripe - ' },
        { pattern: /(Amazon\*\w+)/i, prefix: '' },
        { pattern: /(Uber|Ubr\*)/i, prefix: 'Uber' },
        { pattern: /(Netflix|Spotify|Google|Apple|Microsoft)/i, prefix: '' }
      ];

      for (const { pattern, prefix } of processorPatterns) {
        const patternMatch = fullMatch.match(pattern);
        if (patternMatch) {
          return prefix + patternMatch[1].trim();
        }
      }

      return 'Card Purchase';
    }

    // For transfer transactions, try to extract person/company names
    if (transactionId.startsWith('TRANSFER-')) {
      // Look for money transfer patterns
      const transferMatch = fullMatch.match(/(Sent money to|Received money from)\s+([^0-9\n]+?)(?:\s+with reference|\s+\d)/i);
      if (transferMatch) {
        return transferMatch[2].trim();
      }

      // Check for common business names
      if (fullMatch.toLowerCase().includes('stripe')) {
        return 'Stripe Payment';
      }
      if (fullMatch.toLowerCase().includes('salary') || fullMatch.toLowerCase().includes('payroll')) {
        return 'Salary Payment';
      }
      if (fullMatch.toLowerCase().includes('refund')) {
        return 'Refund';
      }

      return 'Bank Transfer';
    }

    // Other transaction types
    if (transactionId.startsWith('BALANCE-')) {
      return 'Currency Conversion';
    }
    if (transactionId.includes('CASHBACK')) {
      return 'Card Cashback';
    }
  }

  return desc;
}

function validateParsingQuality(transactions: Transaction[]): number {
  const emptyDescriptions = transactions.filter(t =>
    !t.description ||
    t.description === 'Transaction' ||
    t.description.trim() === '' ||
    t.description.includes('ref:')
  );

  const qualityScore = ((transactions.length - emptyDescriptions.length) / transactions.length * 100);

  console.log(`\n📊 Parsing Quality Report:`);
  console.log(`   Total transactions: ${transactions.length}`);
  console.log(`   Successfully parsed: ${transactions.length - emptyDescriptions.length}`);
  console.log(`   Missing descriptions: ${emptyDescriptions.length}`);
  console.log(`   Quality score: ${qualityScore.toFixed(1)}%`);

  if (emptyDescriptions.length > 0) {
    console.log(`\n⚠️  Transactions needing attention:`);
    emptyDescriptions.slice(0, 5).forEach(t => {
      console.log(`   - ${t.date} | ${t.type} | £${t.amount} | ID: ${t.transactionId} | Desc: "${t.description}"`);
    });
  }

  // Target: <10% missing descriptions
  if (qualityScore < 90) {
    console.warn(`\n⚠️  Quality below target (90%). Consider enhancing parser patterns.`);
  } else {
    console.log(`\n✅ Quality target achieved (90%+)`);
  }

  return qualityScore;
};