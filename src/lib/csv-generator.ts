import { Transaction } from './parsers';

export function generateCSV(transactions: Transaction[]): string {
  if (!transactions || transactions.length === 0) {
    throw new Error('No transactions to export');
  }

  console.log(`=== CSV GENERATION ===`);
  console.log(`Generating CSV for ${transactions.length} transactions`);

  // CSV Headers
  const headers = ['Date', 'Description', 'Transaction ID', 'Amount', 'Balance', 'Type'];

  // Build CSV rows
  const csvRows = [headers.join(',')];

  for (const transaction of transactions) {
    // Format amount: negative for debits (money going out), positive for credits (money coming in)
    const formattedAmount = transaction.type === 'Debit'
      ? `-${transaction.amount.toFixed(2)}`
      : transaction.amount.toFixed(2);

    const row = [
      transaction.date,
      `"${(transaction.description || '').replace(/"/g, '""')}"`, // Escape quotes
      transaction.transactionId || '',
      formattedAmount,
      transaction.balance.toFixed(2),
      transaction.type
    ];

    csvRows.push(row.join(','));
    console.log(`CSV row: ${row.join(',')}`);
  }

  const csv = csvRows.join('\n');
  console.log(`Generated CSV with ${csvRows.length - 1} data rows`);
  console.log(`CSV preview (first 200 chars): ${csv.substring(0, 200)}`);

  return csv;
}