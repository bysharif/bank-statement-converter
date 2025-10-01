import { BankParser, Transaction } from './index';

export const GenericParser: BankParser = {
  name: 'Generic',
  identify: () => true, // Always matches as fallback
  parse: (text: string) => {
    const transactions: Transaction[] = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    console.log('=== GENERIC PARSER DEBUG ===');
    console.log(`Processing ${lines.length} lines with generic parser`);

    // Look for common patterns:
    // Dates: DD/MM/YYYY, DD-MM-YYYY, DD MMM YYYY
    // Amounts: 1,234.56 or -1,234.56
    const datePatterns = [
      /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}\b/,
      /\b\d{1,2}\s+\w{3,}\s+\d{4}\b/
    ];

    const amountPattern = /-?\d{1,3}(?:,\d{3})*\.?\d{0,2}/g;

    for (const line of lines) {
      let hasDate = false;
      let dateStr = '';

      // Check for date patterns
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          hasDate = true;
          dateStr = match[0];
          break;
        }
      }

      if (hasDate) {
        const amounts = line.match(amountPattern);
        if (amounts && amounts.length >= 1) {
          // Extract description (remove date and amounts)
          let description = line.replace(dateStr, '');
          amounts.forEach(amount => {
            description = description.replace(amount, '');
          });
          description = description.trim();

          const amount = parseFloat(amounts[0].replace(/,/g, ''));
          const balance = amounts[1] ? parseFloat(amounts[1].replace(/,/g, '')) : 0;

          transactions.push({
            date: dateStr,
            description: description || 'Transaction',
            amount: amount,
            balance: balance,
            type: amount < 0 ? 'Debit' : 'Credit'
          });
        }
      }
    }

    console.log(`Generic parser found ${transactions.length} transactions`);
    return transactions;
  }
};