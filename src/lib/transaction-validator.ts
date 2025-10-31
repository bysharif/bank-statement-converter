import { Transaction } from './universal-bank-parser';

/**
 * Validates and corrects transaction debit/credit classification
 * Uses keyword matching and business logic
 */
export function validateAndCorrectTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.map(txn => validateTransaction(txn));
}

/**
 * Validate and correct a single transaction
 */
function validateTransaction(txn: Transaction): Transaction {
  const description = txn.description.toLowerCase();

  // Determine correct type based on keywords
  const correctType = determineTransactionType(description);

  // If we detected a different type, correct it
  if (correctType && correctType !== txn.type) {
    console.log(`   ✏️ Correcting transaction: "${txn.description}"`);
    console.log(`      Was: ${txn.type}, Should be: ${correctType}`);

    return {
      ...txn,
      type: correctType,
    };
  }

  return txn;
}

/**
 * Determine transaction type from description
 * Returns 'debit', 'credit', or null if uncertain
 */
function determineTransactionType(description: string): 'debit' | 'credit' | null {
  // CREDIT keywords (money IN)
  const creditKeywords = [
    'received from',
    'received',
    'deposit',
    'salary',
    'income',
    'refund',
    'cashback',
    'interest received',
    'payment received',
    'transfer from',
    'credited',
    'paid in',
    'cash in',
    'money in',
    'faster payment in',
    'bacs credit',
    'credit transfer',
    'payment in',
    'start balance',
    'opening balance',
  ];

  // DEBIT keywords (money OUT)
  const debitKeywords = [
    'direct debit to',
    'direct debit',
    'card payment to',
    'card payment',
    'payment to',
    'transfer to',
    'withdrawal',
    'cash withdrawal',
    'atm withdrawal',
    'bill payment',
    'standing order',
    'paid to',
    'paid out',
    'money out',
    'faster payment out',
    'bacs debit',
    'debit transfer',
    'purchase',
    'fee',
    'charge',
    'interest charged',
  ];

  // Check credit keywords first (more specific)
  for (const keyword of creditKeywords) {
    if (description.includes(keyword)) {
      return 'credit';
    }
  }

  // Then check debit keywords
  for (const keyword of debitKeywords) {
    if (description.includes(keyword)) {
      return 'debit';
    }
  }

  // If no clear keyword match, return null (keep original classification)
  return null;
}

/**
 * Clean up transaction descriptions
 */
export function cleanDescription(description: string): string {
  return description
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/\n/g, ' ') // Newlines to spaces
    .replace(/^\d+\s*/, '') // Remove leading reference numbers
    .replace(/[^\w\s£$€.,()-]/g, '') // Remove special characters except common ones
    .trim()
    .substring(0, 200); // Limit length
}

/**
 * Validate running balance calculations
 * Returns transactions with corrected balances
 */
export function validateBalances(transactions: Transaction[]): Transaction[] {
  if (transactions.length === 0) return transactions;

  let runningBalance = transactions[0].balance || 0;
  const correctedTransactions: Transaction[] = [];

  for (let i = 0; i < transactions.length; i++) {
    const txn = transactions[i];

    // Calculate expected balance
    if (i > 0) {
      if (txn.type === 'credit') {
        runningBalance += txn.amount;
      } else {
        runningBalance -= txn.amount;
      }
    }

    // If we have a balance from the statement, check if it makes sense
    if (txn.balance !== undefined && Math.abs(txn.balance - runningBalance) > 0.02) {
      // Balance doesn't match - this might indicate wrong debit/credit classification
      console.log(`   ⚠️ Balance mismatch for "${txn.description}"`);
      console.log(`      Expected: £${runningBalance.toFixed(2)}, Got: £${txn.balance.toFixed(2)}`);

      // Try flipping the type
      const flippedBalance = txn.type === 'credit'
        ? runningBalance - (2 * txn.amount) // Was added, should have been subtracted
        : runningBalance + (2 * txn.amount); // Was subtracted, should have been added

      if (Math.abs(flippedBalance - txn.balance) < 0.02) {
        console.log(`   ✏️ Flipping transaction type to fix balance`);

        correctedTransactions.push({
          ...txn,
          type: txn.type === 'credit' ? 'debit' : 'credit',
        });

        runningBalance = txn.balance;
        continue;
      }
    }

    correctedTransactions.push(txn);

    // Update running balance with actual statement balance if available
    if (txn.balance !== undefined) {
      runningBalance = txn.balance;
    }
  }

  return correctedTransactions;
}

/**
 * Full validation pipeline
 */
export function validateTransactionData(transactions: Transaction[]): Transaction[] {
  console.log('🔍 Validating transaction data...');

  // Step 1: Validate debit/credit based on keywords
  let validated = validateAndCorrectTransactions(transactions);

  // Step 2: Validate balance calculations
  validated = validateBalances(validated);

  console.log('✅ Validation complete');

  return validated;
}
