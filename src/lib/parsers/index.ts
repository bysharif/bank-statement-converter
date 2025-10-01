export interface Transaction {
  date: string;
  description: string;
  transactionId?: string;
  amount: number;
  balance: number;
  type: 'Credit' | 'Debit';
}

export interface BankParser {
  name: string;
  identify: (text: string) => boolean;
  parse: (text: string) => Transaction[];
}